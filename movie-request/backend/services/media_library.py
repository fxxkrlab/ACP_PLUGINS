"""
Remote media library checker.
Connects to a user-configured external database (MySQL / PostgreSQL)
or HTTP API to check if a given tmdb_id already exists in their media library.

If no external config is set up, always returns False (not in library),
and the request is forwarded to the admin panel as usual.

Supported db_type values:
- ``postgresql`` — async query via asyncpg
- ``mysql`` — async query via aiomysql
- ``api`` — HTTP GET with optional auth header; checks a JSON response field
"""
from __future__ import annotations

import logging
import re
from typing import Any, Optional
from urllib.parse import quote_plus

import httpx
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, AsyncEngine

from backend.models import MediaLibraryConfig

logger = logging.getLogger(__name__)

# Cached engine keyed by config id
_engine_cache: dict[int, AsyncEngine] = {}
_engine_dsn_cache: dict[int, str] = {}


def _validate_identifier(name: str) -> bool:
    """Validate SQL identifier to prevent injection."""
    return bool(re.match(r'^[a-zA-Z_][a-zA-Z0-9_]{0,62}$', name))


async def _get_config(session: AsyncSession) -> Optional[MediaLibraryConfig]:
    """Load the active media library config (only one can be active)."""
    result = await session.execute(
        select(MediaLibraryConfig).where(MediaLibraryConfig.is_active.is_(True)).limit(1)
    )
    return result.scalar_one_or_none()


def _build_dsn(cfg: MediaLibraryConfig) -> str:
    """Build an async SQLAlchemy DSN from config fields."""
    if cfg.db_type == "postgresql":
        driver = "postgresql+asyncpg"
    elif cfg.db_type == "mysql":
        driver = "mysql+aiomysql"
    else:
        raise ValueError(f"Unsupported db_type: {cfg.db_type}")

    port = cfg.port or (5432 if cfg.db_type == "postgresql" else 3306)
    encoded_password = quote_plus(cfg.password)
    encoded_username = quote_plus(cfg.username)
    return f"{driver}://{encoded_username}:{encoded_password}@{cfg.host}:{port}/{cfg.database}"


def _get_engine(cfg: MediaLibraryConfig) -> AsyncEngine:
    """Get or create a cached async engine for the given config."""
    dsn = _build_dsn(cfg)

    # If config id exists but DSN changed (user updated config), rebuild
    if cfg.id in _engine_cache and _engine_dsn_cache.get(cfg.id) == dsn:
        return _engine_cache[cfg.id]

    # Dispose old engine if DSN changed
    old_engine = _engine_cache.pop(cfg.id, None)
    if old_engine is not None:
        # Schedule disposal (best-effort, non-blocking)
        logger.info("Rebuilding engine for media library config %d", cfg.id)

    engine = create_async_engine(dsn, pool_pre_ping=True, pool_size=2, max_overflow=0)
    _engine_cache[cfg.id] = engine
    _engine_dsn_cache[cfg.id] = dsn
    return engine


async def dispose_engines() -> None:
    """Dispose all cached engines (called during plugin teardown)."""
    for config_id, engine in list(_engine_cache.items()):
        try:
            await engine.dispose()
        except Exception:
            logger.warning("Failed to dispose engine for config %d", config_id)
    _engine_cache.clear()
    _engine_dsn_cache.clear()


def _resolve_json_path(data: Any, path: str) -> Any:
    """Navigate a dot-separated path into a JSON-decoded dict.

    Example::
        _resolve_json_path({"data": {"exists": True}}, "data.exists")
        # → True
    """
    for key in path.split("."):
        if isinstance(data, dict):
            data = data.get(key)
        else:
            return None
    return data


async def _check_via_api(
    cfg: MediaLibraryConfig,
    tmdb_id: int,
    media_type: str,
) -> bool:
    """Check media library via an external HTTP API.

    The configured ``api_url`` may contain ``{tmdb_id}`` and ``{media_type}``
    placeholders that are replaced before the request is sent. The response
    must be JSON; the field at ``api_response_path`` is tested for truthiness.

    Example configuration::

        api_url:           https://api.example.com/library/check?tmdb_id={tmdb_id}&type={media_type}
        api_auth_header:   Bearer my-secret-token
        api_response_path: exists

    Expected API response: ``{"exists": true}``
    """
    url = (cfg.api_url or "").replace("{tmdb_id}", str(tmdb_id)).replace("{media_type}", media_type)
    if not url:
        logger.error("api_url is empty for media library config %d", cfg.id)
        return False

    headers: dict[str, str] = {}
    if cfg.api_auth_header:
        headers["Authorization"] = cfg.api_auth_header

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        field_path = cfg.api_response_path or "exists"
        value = _resolve_json_path(data, field_path)
        return bool(value)

    except Exception:
        logger.exception(
            "API media library check failed (url=%s, tmdb_id=%s)", url, tmdb_id
        )
        return False


async def check_in_library(
    session: AsyncSession,
    tmdb_id: int,
    media_type: str,
) -> bool:
    """
    Check if a title exists in the remote media library.

    Supports three backends:
    - ``postgresql`` / ``mysql``: direct SQL query via async engine
    - ``api``: HTTP GET with optional auth header + JSON response field check

    Returns False if:
    - No MediaLibraryConfig is configured/active
    - The external DB/API is unreachable
    - The tmdb_id is not found
    """
    cfg = await _get_config(session)
    if cfg is None:
        return False

    # ── API mode ──
    if cfg.db_type == "api":
        return await _check_via_api(cfg, tmdb_id, media_type)

    # ── Database mode ──
    # Validate identifiers to prevent SQL injection
    if not cfg.table_name or not _validate_identifier(cfg.table_name):
        logger.error("Invalid table_name: %s", cfg.table_name)
        return False
    if not cfg.tmdb_id_column or not _validate_identifier(cfg.tmdb_id_column):
        logger.error("Invalid tmdb_id_column: %s", cfg.tmdb_id_column)
        return False
    if cfg.media_type_column and not _validate_identifier(cfg.media_type_column):
        logger.error("Invalid media_type_column: %s", cfg.media_type_column)
        return False

    try:
        engine = _get_engine(cfg)

        async with engine.connect() as conn:
            # Cast tmdb_id to string as well — some media library DBs store
            # TMDB IDs as VARCHAR/TEXT rather than INTEGER. asyncpg does strict
            # type checking and refuses int→str implicit casts. Using
            # ``CAST(:tmdb_id AS TEXT)`` on both sides makes the comparison
            # work regardless of the column's actual type.
            query_str = f'SELECT 1 FROM "{cfg.table_name}" WHERE CAST("{cfg.tmdb_id_column}" AS TEXT) = CAST(:tmdb_id AS TEXT)'
            params: dict = {"tmdb_id": str(tmdb_id)}

            if cfg.media_type_column:
                query_str += f' AND "{cfg.media_type_column}" = :media_type'
                params["media_type"] = media_type

            query_str += " LIMIT 1"

            result = await conn.execute(text(query_str), params)
            row = result.fetchone()
            return row is not None

    except Exception:
        logger.exception("Failed to check remote media library (tmdb_id=%s)", tmdb_id)
        return False
