"""
Remote media library checker.

Supports three connection types via ``MediaLibraryConfig.db_type``:

* ``postgresql`` / ``mysql`` — direct SQL query via async SQLAlchemy engine.
* ``api`` — HTTP GET with optional auth header; checks a JSON response field.

Two output modes:

* **Bool mode** (legacy): just returns whether ``tmdb_id`` exists in the
  external library. Used when only ``table_name`` + ``tmdb_id_column`` are
  configured.
* **Detail mode** (v1.0.17+): when ``name_column`` is also set, the plugin
  fetches every matching filename and parses it for resolution / HDR /
  Dolby Vision / season-episode info, returning a structured ``LibraryInfo``
  dict. The bot reply card uses this to show e.g. "1080p × 1, 4K DoVi × 1"
  for movies, or "S01: E01-E26 (1080p) 26集" for TV shows.

Multi-config support: ``check_in_library()`` iterates over ALL active
``MediaLibraryConfig`` rows and aggregates results, so users can configure
multiple databases / APIs side-by-side.
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


# ──────────────────────────────────────────────
#  Identifier validation
# ──────────────────────────────────────────────

def _validate_identifier(name: str) -> bool:
    """Validate SQL identifier to prevent injection."""
    return bool(name and re.match(r'^[a-zA-Z_][a-zA-Z0-9_]{0,62}$', name))


# ──────────────────────────────────────────────
#  Filename parser (resolution / HDR / SxxExx)
# ──────────────────────────────────────────────

VIDEO_EXT_RE = re.compile(
    r'\.(mkv|mp4|avi|wmv|ts|m2ts|mpg|mpeg|flv|webm|rmvb|rm|mov|m4v)$',
    re.IGNORECASE,
)

# Resolution: detect from filename (priority order matters)
_RES_4K_RE = re.compile(r'2160p|\b4k\b|\buhd\b', re.IGNORECASE)
_RES_1080P_RE = re.compile(r'1080p|\bfhd\b', re.IGNORECASE)
_RES_1080I_RE = re.compile(r'1080i', re.IGNORECASE)
_RES_720P_RE = re.compile(r'720p|\bhd\b', re.IGNORECASE)
_RES_576P_RE = re.compile(r'576[pi]', re.IGNORECASE)
_RES_480P_RE = re.compile(r'480[pi]', re.IGNORECASE)

# HDR / DoVi
# - DoVi: matches "DoVi", ".DV." (between dots, not DVD), "Dolby Vision/DolbyVision"
# - HDR10+: literal HDR10+ or HDR10Plus
# - HDR10: literal HDR10 (must be checked AFTER HDR10+)
# - HDR: standalone HDR (avoid matching HDR10/HDR10+/HDRen etc.)
_DOVI_RE = re.compile(
    r'\bdovi\b|(?<=[\.\s_-])dv(?=[\.\s_-])|dolby[\s\.\-_]?vision',
    re.IGNORECASE,
)
_HDR10PLUS_RE = re.compile(r'hdr10\+|hdr10plus', re.IGNORECASE)
_HDR10_RE = re.compile(r'hdr10', re.IGNORECASE)
_HDR_RE = re.compile(r'\bhdr\b', re.IGNORECASE)

# Season/episode: SxxExx — handle 1-4 digit episode numbers
_SXXEXX_RE = re.compile(r'S(\d{1,4})E(\d{1,4})', re.IGNORECASE)


def _parse_resolution(name: str) -> str:
    """Return a resolution label for a filename, e.g. '4K', '1080p', '其他'."""
    # 4koma is anime panel notation, not 4K — guard against it
    lname = name.lower()
    if 'koma' in lname:
        # Strip 4k-like patterns inside ".4koma." occurrences before testing
        lname = re.sub(r'\d+koma', '', lname)

    if _RES_4K_RE.search(lname):
        return '4K'
    if _RES_1080P_RE.search(lname):
        return '1080p'
    if _RES_1080I_RE.search(lname):
        return '1080i'
    if _RES_720P_RE.search(lname):
        return '720p'
    if _RES_576P_RE.search(lname):
        return '576p'
    if _RES_480P_RE.search(lname):
        return '480p'
    return '其他'


def _parse_hdr(name: str) -> str:
    """Return an HDR label for a filename, e.g. 'DoVi+HDR10', 'HDR10+', '' (none)."""
    has_dovi = bool(_DOVI_RE.search(name))
    has_hdr10plus = bool(_HDR10PLUS_RE.search(name))
    has_hdr10 = bool(_HDR10_RE.search(name)) and not has_hdr10plus
    has_hdr = bool(_HDR_RE.search(name))

    if has_dovi and has_hdr10:
        return 'DoVi+HDR10'
    if has_dovi:
        return 'DoVi'
    if has_hdr10plus:
        return 'HDR10+'
    if has_hdr10:
        return 'HDR10'
    if has_hdr:
        return 'HDR'
    return ''


def _parse_episode(name: str) -> Optional[tuple[int, int]]:
    """Return ``(season_num, episode_num)`` or ``None`` if no SxxExx in the name."""
    m = _SXXEXX_RE.search(name)
    if m:
        try:
            return int(m.group(1)), int(m.group(2))
        except ValueError:
            return None
    return None


# ──────────────────────────────────────────────
#  LibraryInfo aggregation
# ──────────────────────────────────────────────

def _empty_library_info() -> dict[str, Any]:
    return {
        "exists": False,
        "movie_versions": [],   # list of {"resolution", "hdr", "count"}
        "tv_seasons": [],        # list of {"season", "first_ep", "last_ep", "ep_count", "resolutions"}
        "total_files": 0,
    }


def _aggregate_filenames(filenames: list[str]) -> dict[str, Any]:
    """Parse a list of filenames and aggregate movie versions + TV seasons."""
    info = _empty_library_info()
    info["exists"] = bool(filenames)
    info["total_files"] = len(filenames)

    # Group movie versions by (resolution, hdr)
    movie_groups: dict[tuple[str, str], int] = {}

    # Group TV seasons by season number → list of (episode, resolution)
    tv_groups: dict[int, list[tuple[int, str]]] = {}

    for fname in filenames:
        ep = _parse_episode(fname)
        resolution = _parse_resolution(fname)

        if ep is not None:
            # TV episode
            season_num, ep_num = ep
            tv_groups.setdefault(season_num, []).append((ep_num, resolution))
        else:
            # Movie file
            hdr = _parse_hdr(fname)
            key = (resolution, hdr)
            movie_groups[key] = movie_groups.get(key, 0) + 1

    # Sort movie versions: 4K first, then 1080p, etc.
    res_order = {'4K': 0, '1080p': 1, '1080i': 2, '720p': 3, '576p': 4, '480p': 5, '其他': 6}
    movie_versions = [
        {"resolution": res, "hdr": hdr, "count": count}
        for (res, hdr), count in sorted(
            movie_groups.items(),
            key=lambda kv: (res_order.get(kv[0][0], 99), kv[0][1])
        )
    ]
    info["movie_versions"] = movie_versions

    # Build TV season summary
    tv_seasons = []
    for season_num in sorted(tv_groups.keys()):
        eps = tv_groups[season_num]
        ep_nums = sorted({e for e, _ in eps})
        resolutions = sorted({r for _, r in eps if r != '其他'})
        tv_seasons.append({
            "season": season_num,
            "first_ep": ep_nums[0],
            "last_ep": ep_nums[-1],
            "ep_count": len(ep_nums),
            "resolutions": resolutions,
        })
    info["tv_seasons"] = tv_seasons

    return info


# ──────────────────────────────────────────────
#  Engine cache
# ──────────────────────────────────────────────

def _build_dsn(cfg: MediaLibraryConfig) -> str:
    """Build an async SQLAlchemy DSN from config fields."""
    if cfg.db_type == "postgresql":
        driver = "postgresql+asyncpg"
    elif cfg.db_type == "mysql":
        driver = "mysql+aiomysql"
    else:
        raise ValueError(f"Unsupported db_type: {cfg.db_type}")

    port = cfg.port or (5432 if cfg.db_type == "postgresql" else 3306)
    encoded_password = quote_plus(cfg.password or "")
    encoded_username = quote_plus(cfg.username or "")
    return f"{driver}://{encoded_username}:{encoded_password}@{cfg.host}:{port}/{cfg.database}"


def _get_engine(cfg: MediaLibraryConfig) -> AsyncEngine:
    """Get or create a cached async engine for the given config."""
    dsn = _build_dsn(cfg)

    if cfg.id in _engine_cache and _engine_dsn_cache.get(cfg.id) == dsn:
        return _engine_cache[cfg.id]

    old_engine = _engine_cache.pop(cfg.id, None)
    if old_engine is not None:
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


# ──────────────────────────────────────────────
#  Single-config check
# ──────────────────────────────────────────────

async def _get_active_configs(session: AsyncSession) -> list[MediaLibraryConfig]:
    """Load all active media library configs."""
    result = await session.execute(
        select(MediaLibraryConfig)
        .where(MediaLibraryConfig.is_active.is_(True))
        .order_by(MediaLibraryConfig.id)
    )
    return list(result.scalars().all())


def _resolve_json_path(data: Any, path: str) -> Any:
    """Navigate a dot-separated path into a JSON-decoded dict."""
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
) -> dict[str, Any]:
    """API mode: HTTP GET → bool result wrapped in LibraryInfo."""
    info = _empty_library_info()
    url = (cfg.api_url or "").replace("{tmdb_id}", str(tmdb_id)).replace("{media_type}", media_type)
    if not url:
        logger.error("api_url is empty for media library config %d", cfg.id)
        return info

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
        info["exists"] = bool(value)
        return info

    except Exception:
        logger.exception(
            "API media library check failed (url=%s, tmdb_id=%s)", url, tmdb_id
        )
        return info


async def _check_via_db(
    cfg: MediaLibraryConfig,
    tmdb_id: int,
    media_type: str,
) -> dict[str, Any]:
    """DB mode: SQL query for filenames → parse versions + episodes."""
    info = _empty_library_info()

    # Identifier validation
    if not _validate_identifier(cfg.table_name or ''):
        logger.error("Invalid table_name on cfg %d: %s", cfg.id, cfg.table_name)
        return info
    if not _validate_identifier(cfg.tmdb_id_column or ''):
        logger.error("Invalid tmdb_id_column on cfg %d: %s", cfg.id, cfg.tmdb_id_column)
        return info
    if cfg.media_type_column and not _validate_identifier(cfg.media_type_column):
        logger.error("Invalid media_type_column on cfg %d: %s", cfg.id, cfg.media_type_column)
        return info
    if cfg.name_column and not _validate_identifier(cfg.name_column):
        logger.error("Invalid name_column on cfg %d: %s", cfg.id, cfg.name_column)
        return info
    if cfg.is_dir_column and not _validate_identifier(cfg.is_dir_column):
        logger.error("Invalid is_dir_column on cfg %d: %s", cfg.id, cfg.is_dir_column)
        return info
    if cfg.trashed_column and not _validate_identifier(cfg.trashed_column):
        logger.error("Invalid trashed_column on cfg %d: %s", cfg.id, cfg.trashed_column)
        return info

    try:
        engine = _get_engine(cfg)
        async with engine.connect() as conn:
            # Pick filename column: 'name' if configured, else just SELECT 1
            select_col = f'"{cfg.name_column}"' if cfg.name_column else "1"
            query_str = (
                f'SELECT {select_col} FROM "{cfg.table_name}" '
                f'WHERE CAST("{cfg.tmdb_id_column}" AS TEXT) = CAST(:tmdb_id AS TEXT)'
            )
            params: dict = {"tmdb_id": str(tmdb_id)}

            if cfg.media_type_column:
                query_str += f' AND "{cfg.media_type_column}" = :media_type'
                params["media_type"] = media_type
            if cfg.is_dir_column:
                query_str += f' AND "{cfg.is_dir_column}" = false'
            if cfg.trashed_column:
                query_str += f' AND "{cfg.trashed_column}" = false'

            # If we have a name column, also filter to video files only at the
            # SQL level so we don't pull subtitle / metadata rows over the wire.
            if cfg.name_column:
                query_str += (
                    f" AND lower(\"{cfg.name_column}\") "
                    f"~ '\\.(mkv|mp4|avi|wmv|ts|m2ts|mpg|flv|webm|rmvb|rm|mov|m4v)$'"
                )

            # Cap result size to avoid pulling 10k filenames for huge TV shows
            query_str += " LIMIT 5000"

            result = await conn.execute(text(query_str), params)
            rows = result.fetchall()

        if not rows:
            return info

        if cfg.name_column:
            filenames = [r[0] for r in rows if r[0]]
            return _aggregate_filenames(filenames)
        else:
            # Bool-only mode
            info["exists"] = True
            info["total_files"] = len(rows)
            return info

    except Exception:
        logger.exception(
            "DB media library check failed (cfg=%d, tmdb_id=%s)", cfg.id, tmdb_id
        )
        return info


async def _check_one(
    cfg: MediaLibraryConfig,
    tmdb_id: int,
    media_type: str,
) -> dict[str, Any]:
    """Run a check against a single config (DB or API)."""
    if cfg.db_type == "api":
        return await _check_via_api(cfg, tmdb_id, media_type)
    return await _check_via_db(cfg, tmdb_id, media_type)


def _merge_library_info(a: dict[str, Any], b: dict[str, Any]) -> dict[str, Any]:
    """Combine two LibraryInfo dicts (e.g. from two different configs)."""
    out = _empty_library_info()
    out["exists"] = a["exists"] or b["exists"]
    out["total_files"] = a["total_files"] + b["total_files"]

    # Merge movie versions: sum counts for same (resolution, hdr) key
    merged: dict[tuple[str, str], int] = {}
    for v in a["movie_versions"] + b["movie_versions"]:
        key = (v["resolution"], v["hdr"])
        merged[key] = merged.get(key, 0) + v["count"]
    res_order = {'4K': 0, '1080p': 1, '1080i': 2, '720p': 3, '576p': 4, '480p': 5, '其他': 6}
    out["movie_versions"] = [
        {"resolution": r, "hdr": h, "count": c}
        for (r, h), c in sorted(merged.items(), key=lambda kv: (res_order.get(kv[0][0], 99), kv[0][1]))
    ]

    # Merge TV seasons by season number
    season_map: dict[int, dict[str, Any]] = {}
    for s in a["tv_seasons"] + b["tv_seasons"]:
        n = s["season"]
        if n not in season_map:
            season_map[n] = {
                "season": n,
                "first_ep": s["first_ep"],
                "last_ep": s["last_ep"],
                "ep_count": s["ep_count"],
                "resolutions": list(s["resolutions"]),
            }
        else:
            existing = season_map[n]
            existing["first_ep"] = min(existing["first_ep"], s["first_ep"])
            existing["last_ep"] = max(existing["last_ep"], s["last_ep"])
            existing["ep_count"] = max(existing["ep_count"], s["ep_count"])
            existing["resolutions"] = sorted(set(existing["resolutions"]) | set(s["resolutions"]))
    out["tv_seasons"] = [season_map[k] for k in sorted(season_map.keys())]

    return out


# ──────────────────────────────────────────────
#  Public entry point
# ──────────────────────────────────────────────

async def check_in_library(
    session: AsyncSession,
    tmdb_id: int,
    media_type: str,
) -> dict[str, Any]:
    """
    Check if a title exists in any of the configured media libraries.

    Returns a ``LibraryInfo`` dict with:

    * ``exists`` — bool, True if found in at least one config
    * ``movie_versions`` — list of {"resolution", "hdr", "count"} for movies
    * ``tv_seasons`` — list of {"season", "first_ep", "last_ep", "ep_count",
      "resolutions"} for TV shows
    * ``total_files`` — total number of matching files

    Always returns a valid dict — never raises.
    """
    configs = await _get_active_configs(session)
    if not configs:
        return _empty_library_info()

    aggregated = _empty_library_info()
    for cfg in configs:
        try:
            info = await _check_one(cfg, tmdb_id, media_type)
            if info["exists"]:
                aggregated = _merge_library_info(aggregated, info)
        except Exception:
            logger.exception("Failed to check library cfg %d", cfg.id)
    return aggregated


async def check_one_config(
    session: AsyncSession,
    config_id: int,
    tmdb_id: int = 0,
    media_type: str = "movie",
) -> dict[str, Any]:
    """Test a single config (used by the test endpoint)."""
    result = await session.execute(
        select(MediaLibraryConfig).where(MediaLibraryConfig.id == config_id)
    )
    cfg = result.scalar_one_or_none()
    if cfg is None:
        return _empty_library_info()
    return await _check_one(cfg, tmdb_id, media_type)


# ──────────────────────────────────────────────
#  Pretty-printers (for the bot reply card)
# ──────────────────────────────────────────────

def format_library_detail_lines(
    info: dict[str, Any], media_type: str
) -> list[str]:
    """Render LibraryInfo as a list of human-readable lines (Chinese)."""
    lines: list[str] = []
    if not info or not info.get("exists"):
        return lines

    if media_type == "tv" or info.get("tv_seasons"):
        for s in info.get("tv_seasons", []):
            res = "/".join(s.get("resolutions") or []) or "其他"
            lines.append(
                f"\U0001f4fa S{s['season']:02d}: "
                f"E{s['first_ep']:02d}-E{s['last_ep']:02d} "
                f"({res}) {s['ep_count']}集"
            )

    # Movie versions (also include leftover non-episode files for TV — extras)
    versions = info.get("movie_versions") or []
    if versions:
        for v in versions:
            label = v["resolution"]
            if v.get("hdr"):
                label += f" {v['hdr']}"
            lines.append(f"\U0001f4c0 {label} \u00d7 {v['count']}")

    return lines
