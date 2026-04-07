"""
Bot handler for TMDB movie/TV request URLs.

Trigger rules:
  Private chat:
    /req <TMDB_URL>   -> recognised
    req <TMDB_URL>    -> recognised
    bare TMDB URL     -> ignored
  Group chat:
    @bot req <TMDB_URL>  -> recognised (mention + req)
    /req <TMDB_URL>      -> ignored (avoids duplicate triggers from bot pool)
    bare TMDB URL        -> ignored

Flow (v1.0.13+):
  1. User sends /req URL
  2. Bot replies with rich movie card + inline buttons (Confirm / Cancel)
  3. User clicks Confirm -> request saved to DB, card edited to "submitted"
  4. User clicks Cancel  -> card edited to "cancelled", nothing saved
"""
from __future__ import annotations

import logging
import re
import time
from datetime import datetime
from typing import Any

from aiogram import F, Router
from aiogram.filters import Filter
from aiogram.types import (
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message as TgMessage,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models.conversation import Conversation
from app.models.message import Message as PanelMessage
from app.models.user import TgUser

from backend.models import MovieRequest, MovieRequestUser
from backend.services.tmdb import get_tmdb_client, parse_tmdb_url, TMDB_IMAGE_BASE
from backend.services.media_library import check_in_library

logger = logging.getLogger(__name__)

router = Router(name="movie_request")

# Pending-request cache: keyed by "{media_type}:{tmdb_id}:{user_tg_uid}".
# Stores tmdb_data + metadata so the callback handler can complete the
# request without re-fetching from TMDB (with a 10-min TTL fallback).
_pending: dict[str, dict[str, Any]] = {}
_PENDING_TTL = 600  # seconds


def _safe_raw_data(msg: TgMessage) -> dict:
    """Extract a JSON-safe subset of the raw Telegram message."""
    try:
        return msg.model_dump(
            exclude={"bot", "from_user"},
            exclude_none=True,
            mode="json",
        )
    except Exception:
        return {}


def _evict_stale_pending() -> None:
    """Lazy eviction of expired pending-request cache entries."""
    now = time.monotonic()
    stale = [k for k, v in _pending.items() if now - v.get("ts", 0) > _PENDING_TTL]
    for k in stale:
        _pending.pop(k, None)


def _confirm_keyboard(
    media_type: str, tmdb_id: int, user_tg_uid: int
) -> InlineKeyboardMarkup:
    """Build the ✅ / ❌ inline keyboard for confirmation."""
    suffix = f"{media_type}:{tmdb_id}:{user_tg_uid}"
    return InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="\u2705 \u786e\u8ba4\u6c42\u7247",  # ✅ 确认求片
            callback_data=f"mr:c:{suffix}",
        ),
        InlineKeyboardButton(
            text="\u274c \u53d6\u6d88",  # ❌ 取消
            callback_data=f"mr:x:{suffix}",
        ),
    ]])


# ──────────────────────────────────────────────
#  Custom filter
# ──────────────────────────────────────────────

class MovieRequestTrigger(Filter):
    """
    Returns True only when the message is a valid movie request.

    Private:  /req URL  or  req URL
    Group:    @bot_username req URL
    """

    async def __call__(
        self,
        message: TgMessage,
        bot_username: str = "",
    ) -> bool:
        text = message.text or ""
        if not text:
            return False

        # Must contain a TMDB URL
        if not re.search(r"themoviedb\.org/(movie|tv)/(\d+)", text):
            return False

        chat_type = message.chat.type

        if chat_type == "private":
            # /req URL  or  req URL  (case-insensitive)
            return bool(re.match(r"^/?req\s", text, re.IGNORECASE))

        if chat_type in ("group", "supergroup"):
            # @bot_username req URL  (case-insensitive)
            if not bot_username:
                return False
            pattern = rf"@{re.escape(bot_username)}\s+req\b"
            return bool(re.search(pattern, text, re.IGNORECASE))

        return False


# ──────────────────────────────────────────────
#  Panel logging helpers
# ──────────────────────────────────────────────

async def _upsert_panel_conversation(
    session: AsyncSession,
    tg_user_db_id: int,
    bot_db_id: int,
    chat_type: str,
) -> Conversation:
    """Find or create the panel-side Conversation."""
    source_type = "private" if chat_type == "private" else "group"
    result = await session.execute(
        select(Conversation).where(
            Conversation.tg_user_id == tg_user_db_id,
            Conversation.source_type == source_type,
            Conversation.primary_bot_id == bot_db_id,
        )
    )
    conv = result.scalar_one_or_none()
    if conv is None:
        conv = Conversation(
            tg_user_id=tg_user_db_id,
            source_type=source_type,
            primary_bot_id=bot_db_id,
        )
        session.add(conv)
        await session.flush()
    return conv


async def _log_inbound(
    session: AsyncSession,
    conversation_id: int,
    bot_db_id: int,
    message: TgMessage,
) -> PanelMessage:
    """Mirror the user's incoming message into the panel's messages table."""
    msg_time = (
        message.date.replace(tzinfo=None) if message.date else datetime.utcnow()
    )
    db_msg = PanelMessage(
        conversation_id=conversation_id,
        tg_message_id=message.message_id,
        direction="inbound",
        sender_type="user",
        via_bot_id=bot_db_id,
        content_type="text",
        text_content=message.text or "",
        media_file_id=None,
        reply_to_message_id=(
            message.reply_to_message.message_id if message.reply_to_message else None
        ),
        raw_data=_safe_raw_data(message),
        created_at=msg_time,
    )
    session.add(db_msg)
    await session.flush()
    return db_msg


async def _log_outbound(
    session: AsyncSession,
    conversation_id: int,
    bot_db_id: int,
    text: str,
    tg_message_id: int | None = None,
    reply_to_message_id: int | None = None,
) -> None:
    """Mirror an outgoing bot reply into the panel's messages table."""
    db_msg = PanelMessage(
        conversation_id=conversation_id,
        tg_message_id=tg_message_id,
        direction="outbound",
        sender_type="bot",
        via_bot_id=bot_db_id,
        content_type="text",
        text_content=text,
        media_file_id=None,
        reply_to_message_id=reply_to_message_id,
        raw_data={"source": "plugin:movie-request"},
        created_at=datetime.utcnow(),
    )
    session.add(db_msg)
    await session.flush()


# ──────────────────────────────────────────────
#  MovieRequest helper: build in-memory object
# ──────────────────────────────────────────────

def _build_movie_request(
    tmdb_data: dict, media_type: str, tmdb_id: int, in_library: bool
) -> MovieRequest:
    """Create an in-memory MovieRequest from TMDB API data (NOT saved to DB)."""
    title = tmdb_data.get("title") or tmdb_data.get("name") or "Unknown"
    original_title = tmdb_data.get("original_title") or tmdb_data.get("original_name")
    release_date = tmdb_data.get("release_date") or tmdb_data.get("first_air_date")
    genres_list = tmdb_data.get("genres", [])
    genres_str = ", ".join(g["name"] for g in genres_list) if genres_list else None

    return MovieRequest(
        tmdb_id=tmdb_id,
        media_type=media_type,
        title=title,
        original_title=original_title,
        poster_path=tmdb_data.get("poster_path"),
        backdrop_path=tmdb_data.get("backdrop_path"),
        release_date=release_date,
        overview=tmdb_data.get("overview"),
        vote_average=tmdb_data.get("vote_average"),
        genres=genres_str,
        tmdb_raw=tmdb_data,
        in_library=in_library,
        request_count=1,
    )


async def _save_request(
    session: AsyncSession,
    tmdb_data: dict,
    media_type: str,
    tmdb_id: int,
    in_library: bool,
    tg_user_db_id: int,
) -> MovieRequest:
    """Persist a MovieRequest + MovieRequestUser to the database.

    Handles the dedup case: if the same tmdb_id+media_type already exists,
    increments request_count and adds a new MovieRequestUser row.
    """
    result = await session.execute(
        select(MovieRequest).where(
            MovieRequest.tmdb_id == tmdb_id,
            MovieRequest.media_type == media_type,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.request_count += 1
        user_result = await session.execute(
            select(MovieRequestUser).where(
                MovieRequestUser.movie_request_id == existing.id,
                MovieRequestUser.tg_user_id == tg_user_db_id,
            )
        )
        if not user_result.scalar_one_or_none():
            session.add(MovieRequestUser(
                movie_request_id=existing.id,
                tg_user_id=tg_user_db_id,
            ))
        return existing

    req = _build_movie_request(tmdb_data, media_type, tmdb_id, in_library)
    session.add(req)
    await session.flush()
    session.add(MovieRequestUser(
        movie_request_id=req.id,
        tg_user_id=tg_user_db_id,
    ))
    return req


# ──────────────────────────────────────────────
#  Message handler (Phase 1: preview + confirm)
# ──────────────────────────────────────────────

@router.message(MovieRequestTrigger())
async def handle_movie_request(message: TgMessage, bot_db_id: int) -> None:
    """Show a rich preview card with confirm/cancel buttons (no DB write yet)."""
    tg_user = message.from_user
    if tg_user is None or tg_user.is_bot:
        return

    text = message.text or ""
    parsed = parse_tmdb_url(text)
    if not parsed:
        return

    media_type, tmdb_id = parsed

    async with async_session_factory() as session:
        try:
            # ---- 1. Upsert TgUser ----
            result = await session.execute(
                select(TgUser).where(TgUser.tg_uid == tg_user.id)
            )
            db_user = result.scalar_one_or_none()
            if db_user is None:
                db_user = TgUser(
                    tg_uid=tg_user.id,
                    username=tg_user.username,
                    first_name=tg_user.first_name,
                    last_name=tg_user.last_name,
                    language_code=tg_user.language_code,
                    is_premium=tg_user.is_premium or False,
                    is_bot=tg_user.is_bot,
                )
                session.add(db_user)
                await session.flush()

            # ---- 2. Mirror conversation + inbound message ----
            conv = await _upsert_panel_conversation(
                session, db_user.id, bot_db_id, message.chat.type
            )
            await _log_inbound(session, conv.id, bot_db_id, message)

            # ---- 3. Same-user duplicate check ----
            result = await session.execute(
                select(MovieRequest).where(
                    MovieRequest.tmdb_id == tmdb_id,
                    MovieRequest.media_type == media_type,
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                user_result = await session.execute(
                    select(MovieRequestUser).where(
                        MovieRequestUser.movie_request_id == existing.id,
                        MovieRequestUser.tg_user_id == db_user.id,
                    )
                )
                if user_result.scalar_one_or_none():
                    # Same user already requested — no buttons, informational only
                    await session.commit()
                    sent = await _send_reply_card(
                        message, existing,
                        status_override="\U0001f504 <b>\u4f60\u5df2\u7ecf\u6c42\u8fc7\u8fd9\u90e8\u4e86</b>",
                    )
                    async with async_session_factory() as outsess:
                        await _log_outbound(
                            outsess, conv.id, bot_db_id,
                            text=_render_caption(existing, status_override="\U0001f504 你已经求过这部了"),
                            tg_message_id=getattr(sent, "message_id", None),
                            reply_to_message_id=message.message_id,
                        )
                        await outsess.commit()
                    return

            # ---- 4. Fetch TMDB data for preview ----
            client = get_tmdb_client()
            tmdb_data = await client.get_media(session, media_type, tmdb_id)

            if not tmdb_data:
                err = "\u26a0\ufe0f TMDB API error, please try again later."
                sent = await message.reply(err, parse_mode="HTML")
                await _log_outbound(
                    session, conv.id, bot_db_id,
                    text=err,
                    tg_message_id=getattr(sent, "message_id", None),
                    reply_to_message_id=message.message_id,
                )
                await session.commit()
                return

            in_library = await check_in_library(session, tmdb_id, media_type)
            await session.commit()

            # ---- 5. Already in library? No confirmation needed ----
            if in_library:
                preview = _build_movie_request(tmdb_data, media_type, tmdb_id, True)
                sent = await _send_reply_card(
                    message, preview,
                    status_override="\u2705 <b>Already in your library</b>",
                )
                async with async_session_factory() as outsess:
                    await _log_outbound(
                        outsess, conv.id, bot_db_id,
                        text=_render_caption(preview, status_override="✅ Already in your library"),
                        tg_message_id=getattr(sent, "message_id", None),
                        reply_to_message_id=message.message_id,
                    )
                    await outsess.commit()
                return

            # ---- 6. Show preview with confirmation buttons ----
            preview = _build_movie_request(tmdb_data, media_type, tmdb_id, False)
            keyboard = _confirm_keyboard(media_type, tmdb_id, tg_user.id)
            sent = await _send_reply_card(
                message, preview,
                status_override="\u2753 <b>\u662f\u5426\u786e\u8ba4\u6c42\u7247\uff1f</b>",
                reply_markup=keyboard,
            )

            # Cache for the callback handler
            _evict_stale_pending()
            cache_key = f"{media_type}:{tmdb_id}:{tg_user.id}"
            _pending[cache_key] = {
                "tmdb_data": tmdb_data,
                "in_library": in_library,
                "bot_db_id": bot_db_id,
                "conv_id": conv.id,
                "chat_id": message.chat.id,
                "msg_id": getattr(sent, "message_id", None),
                "user_msg_id": message.message_id,
                "ts": time.monotonic(),
            }

            # Log outbound (the preview, not the final submission)
            async with async_session_factory() as outsess:
                await _log_outbound(
                    outsess, conv.id, bot_db_id,
                    text=_render_caption(preview, status_override="❓ 是否确认求片？"),
                    tg_message_id=getattr(sent, "message_id", None),
                    reply_to_message_id=message.message_id,
                )
                await outsess.commit()

        except Exception:
            await session.rollback()
            logger.exception("Error handling movie request from tg_uid=%s", tg_user.id)
            try:
                await message.reply("An error occurred processing your request.")
            except Exception:
                pass


# ──────────────────────────────────────────────
#  Callback handler (Phase 2: confirm / cancel)
# ──────────────────────────────────────────────

@router.callback_query(F.data.startswith("mr:"))
async def handle_request_callback(
    callback: CallbackQuery,
    bot_db_id: int | None = None,
) -> None:
    """Handle inline-button press for confirm / cancel.

    ``bot_db_id`` is injected by the panel's bot context middleware. It is
    declared optional here so that older Panel versions (< 1.1.5) which only
    register the middleware on the message observer don't crash this
    handler with ``TypeError: missing 1 required positional argument``.
    """
    logger.info("[mr-callback] received data=%s from tg_uid=%s", callback.data, callback.from_user.id if callback.from_user else None)
    data = (callback.data or "").split(":")
    if len(data) != 5:
        await callback.answer("\u274c Invalid callback", show_alert=True)
        return

    _, action, media_type, tmdb_id_str, user_tg_uid_str = data
    try:
        tmdb_id = int(tmdb_id_str)
        user_tg_uid = int(user_tg_uid_str)
    except ValueError:
        await callback.answer("\u274c Invalid data", show_alert=True)
        return

    # Only the original requester can click
    if callback.from_user.id != user_tg_uid:
        await callback.answer(
            "\u274c \u53ea\u6709\u6c42\u7247\u4eba\u624d\u80fd\u64cd\u4f5c",  # 只有求片人才能操作
            show_alert=True,
        )
        return

    cache_key = f"{media_type}:{tmdb_id}:{user_tg_uid}"
    cached = _pending.pop(cache_key, None)

    try:
        if action == "c":  # ── Confirm ──
            # Get or refetch TMDB data
            if cached:
                tmdb_data = cached["tmdb_data"]
                in_library = cached["in_library"]
                conv_id = cached["conv_id"]
            else:
                # Cache miss (multi-worker or TTL expired) — refetch
                async with async_session_factory() as sess:
                    client = get_tmdb_client()
                    tmdb_data = await client.get_media(sess, media_type, tmdb_id)
                    in_library = await check_in_library(sess, tmdb_id, media_type)
                    await sess.commit()
                conv_id = None  # will skip outbound log if unknown

            if not tmdb_data:
                await callback.answer(
                    "\u26a0\ufe0f TMDB data unavailable, please try again",
                    show_alert=True,
                )
                return

            # Persist to DB
            async with async_session_factory() as sess:
                result = await sess.execute(
                    select(TgUser).where(TgUser.tg_uid == user_tg_uid)
                )
                db_user = result.scalar_one_or_none()
                if db_user is None:
                    await callback.answer("\u274c User not found", show_alert=True)
                    return

                req = await _save_request(
                    sess, tmdb_data, media_type, tmdb_id, in_library, db_user.id
                )
                await sess.commit()

                # Refresh so we have the latest request_count
                await sess.refresh(req)

            # Edit the card: replace status + remove buttons
            confirmed_caption = _render_caption(
                req, status_override="\u2705 <b>\u6c42\u7247\u5df2\u63d0\u4ea4</b>"
            )
            try:
                if callback.message and callback.message.photo:
                    await callback.message.edit_caption(
                        caption=confirmed_caption,
                        parse_mode="HTML",
                        reply_markup=None,
                    )
                elif callback.message:
                    await callback.message.edit_text(
                        text=confirmed_caption,
                        parse_mode="HTML",
                        reply_markup=None,
                    )
            except Exception:
                logger.warning("Failed to edit message after confirm", exc_info=True)

            await callback.answer("\u2705 \u6c42\u7247\u5df2\u63d0\u4ea4")  # ✅ 求片已提交

            # Log outbound (confirmed) — skip if we have no conv_id or bot_db_id
            if conv_id and bot_db_id is not None:
                try:
                    async with async_session_factory() as outsess:
                        await _log_outbound(
                            outsess, conv_id, bot_db_id,
                            text="[确认求片] " + (req.title or ""),
                            tg_message_id=getattr(callback.message, "message_id", None),
                        )
                        await outsess.commit()
                except Exception:
                    logger.debug("Failed to log outbound for confirm", exc_info=True)

        elif action == "x":  # ── Cancel ──
            # Build a preview req for re-rendering the caption
            if cached:
                tmdb_data = cached["tmdb_data"]
                in_library = cached.get("in_library", False)
            else:
                # No cache — we need tmdb_data to re-render. Light refetch.
                async with async_session_factory() as sess:
                    client = get_tmdb_client()
                    tmdb_data = await client.get_media(sess, media_type, tmdb_id)
                    in_library = False
                    await sess.commit()

            if tmdb_data:
                preview = _build_movie_request(tmdb_data, media_type, tmdb_id, in_library)
                cancelled_caption = _render_caption(
                    preview, status_override="\u274c <b>\u6c42\u7247\u5df2\u53d6\u6d88</b>"
                )
                try:
                    if callback.message and callback.message.photo:
                        await callback.message.edit_caption(
                            caption=cancelled_caption,
                            parse_mode="HTML",
                            reply_markup=None,
                        )
                    elif callback.message:
                        await callback.message.edit_text(
                            text=cancelled_caption,
                            parse_mode="HTML",
                            reply_markup=None,
                        )
                except Exception:
                    logger.warning("Failed to edit message after cancel", exc_info=True)

            await callback.answer("\u274c \u5df2\u53d6\u6d88")  # ❌ 已取消

        else:
            await callback.answer("\u274c Unknown action", show_alert=True)

    except Exception:
        logger.exception("Error in request callback handler")
        await callback.answer(
            "\u26a0\ufe0f An error occurred", show_alert=True
        )


# ──────────────────────────────────────────────
#  Reply card rendering
# ──────────────────────────────────────────────

def _html_escape(s: str) -> str:
    """Minimal HTML escaping for Telegram parse_mode='HTML'."""
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def _truncate(text: str, limit: int) -> str:
    """Cut a string to ``limit`` chars, adding an ellipsis if it had to shrink."""
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "\u2026"


def _render_caption(
    req: MovieRequest,
    is_duplicate: bool = False,
    status_override: str | None = None,
) -> str:
    """Render the rich poster-caption for a MovieRequest.

    Args:
        req: The MovieRequest (may be an unsaved in-memory object for previews).
        is_duplicate: Whether this is a duplicate request (multiple users).
        status_override: If set, replaces the auto-computed status line.
            Accepts raw HTML (e.g. ``"❓ <b>是否确认求片？</b>"``).
    """
    raw = req.tmdb_raw or {}
    is_tv = req.media_type == "tv"
    media_label = "\U0001f4fa TV" if is_tv else "\U0001f3ac Movie"
    year = req.release_date[:4] if req.release_date else "\u2014"

    # Header
    title_html = f"<b>{_html_escape(req.title)}</b>"
    if req.original_title and req.original_title != req.title:
        title_html += f" <i>{_html_escape(req.original_title)}</i>"

    # Tagline
    tagline = (raw.get("tagline") or "").strip()
    tagline_line = f"<i>\u201c{_html_escape(tagline)}\u201d</i>\n" if tagline else ""

    # Rating
    if req.vote_average is not None:
        votes = raw.get("vote_count") or 0
        rating = f"\u2b50 {float(req.vote_average):.1f}/10"
        if votes:
            rating += f" ({votes:,} votes)"
    else:
        rating = "\u2b50 N/A"

    # Runtime
    runtime_min = raw.get("runtime")
    if not runtime_min and is_tv:
        ep_runtimes = raw.get("episode_run_time") or []
        if ep_runtimes:
            runtime_min = ep_runtimes[0]
    runtime_str = ""
    if runtime_min:
        h, m = divmod(int(runtime_min), 60)
        runtime_str = f" \u23f1 {h}h {m}m" if h else f" \u23f1 {m}m"

    # Country
    countries = raw.get("production_countries") or []
    country_str = ""
    if countries:
        country_str = " \U0001f30d " + "/".join(c.get("iso_3166_1", "") for c in countries[:2])

    # Genres
    genres_line = f"\U0001f3ad {_html_escape(req.genres)}\n" if req.genres else ""

    # Credits
    credits = raw.get("credits") or {}
    crew = credits.get("crew") or []
    cast = credits.get("cast") or []
    director_line = ""
    if not is_tv:
        directors = [c["name"] for c in crew if c.get("job") == "Director"]
        if directors:
            director_line = f"\U0001f3ac {_html_escape(', '.join(directors[:2]))}\n"
    else:
        creators = raw.get("created_by") or []
        if creators:
            director_line = f"\U0001f3ac {_html_escape(', '.join(c['name'] for c in creators[:2]))}\n"
    cast_line = ""
    if cast:
        top_cast = ", ".join(c["name"] for c in cast[:3])
        cast_line = f"\U0001f465 {_html_escape(top_cast)}\n"

    # Synopsis
    overview = (req.overview or "").strip()
    overview_block = ""
    if overview:
        overview_block = "\n\U0001f4dd " + _html_escape(_truncate(overview, 300))

    # Status
    if status_override:
        status_line = status_override
    elif req.in_library:
        status_line = "\u2705 <b>Already in your library</b>"
    elif is_duplicate:
        status_line = f"\U0001f504 <b>{req.request_count} users have requested this</b>"
    else:
        status_line = "\u23f3 <b>Request submitted</b>"

    # Links
    tmdb_link = f"https://www.themoviedb.org/{'tv' if is_tv else 'movie'}/{req.tmdb_id}"
    links = [f'<a href="{tmdb_link}">TMDB</a>']
    imdb_id = (raw.get("external_ids") or {}).get("imdb_id") or raw.get("imdb_id")
    if imdb_id:
        links.append(f'<a href="https://www.imdb.com/title/{imdb_id}/">IMDB</a>')
    links_line = " \u00b7 ".join(links)

    # Layout: links go just above the status/action line so the status
    # (e.g. "❓ 是否确认求片？") sits at the very bottom, right next to
    # the inline keyboard buttons it refers to.
    caption = (
        f"\U0001f4fd {title_html}\n"
        f"{tagline_line}"
        f"{media_label} \u00b7 {year}{country_str}{runtime_str}\n"
        f"{rating}\n"
        f"{genres_line}"
        f"{director_line}"
        f"{cast_line}"
        f"{overview_block}\n\n"
        f"{links_line}\n\n"
        f"{status_line}"
    )

    # Telegram photo caption hard-cap is 1024 chars.
    if len(caption) > 1024:
        caption = caption.replace(overview_block, "")
        if len(caption) > 1024:
            caption = caption[:1020] + "\u2026"

    return caption


async def _send_reply_card(
    message: TgMessage,
    req: MovieRequest,
    is_duplicate: bool = False,
    status_override: str | None = None,
    reply_markup: InlineKeyboardMarkup | None = None,
):
    """Send a rich poster-card reply. Returns the sent Message or None."""
    caption = _render_caption(req, is_duplicate=is_duplicate, status_override=status_override)
    poster_url = f"{TMDB_IMAGE_BASE}/w780{req.poster_path}" if req.poster_path else None

    try:
        if poster_url:
            return await message.answer_photo(
                photo=poster_url,
                caption=caption,
                parse_mode="HTML",
                reply_markup=reply_markup,
            )
        return await message.reply(
            caption, parse_mode="HTML",
            disable_web_page_preview=False,
            reply_markup=reply_markup,
        )
    except Exception:
        logger.warning("Failed to send poster photo, falling back to text")
        try:
            return await message.reply(
                caption, parse_mode="HTML", reply_markup=reply_markup,
            )
        except Exception:
            logger.exception("Even text-only reply failed")
            return None
