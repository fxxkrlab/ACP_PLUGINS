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
"""
from __future__ import annotations

import logging
import re
from datetime import datetime

from aiogram import Router
from aiogram.filters import Filter
from aiogram.types import Message as TgMessage
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


def _safe_raw_data(msg: TgMessage) -> dict:
    """Extract a JSON-safe subset of the raw Telegram message.

    Excludes ``bot`` and ``from_user`` which contain aiogram internal
    sentinel types (``Default``) that Pydantic cannot serialise to JSON.
    Mirrors the approach used in ``app/bot/handlers/private.py``.
    """
    try:
        return msg.model_dump(
            exclude={"bot", "from_user"},
            exclude_none=True,
            mode="json",
        )
    except Exception:
        return {}

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
#  Handler
# ──────────────────────────────────────────────

async def _upsert_panel_conversation(
    session: AsyncSession,
    tg_user_db_id: int,
    bot_db_id: int,
    chat_type: str,
) -> Conversation:
    """Find or create the panel-side Conversation for this (user, bot, chat) trio.

    The plugin handler intercepts the message before ``private.py`` runs,
    so we have to mirror the same conversation/message bookkeeping here.
    Without this the message disappears from the panel's web chat list.
    """
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
    """Mirror the user's incoming message into the panel's ``messages`` table.

    Mimics the shape produced by ``app/bot/handlers/private.py`` so the row
    looks identical to a normal inbound message in the chat UI.
    """
    msg_time = (
        message.date.replace(tzinfo=None)
        if message.date is not None
        else datetime.utcnow()
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
            message.reply_to_message.message_id
            if message.reply_to_message
            else None
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
    """Mirror an outgoing bot reply into the panel's ``messages`` table.

    Tagged with ``sender_type="bot"`` and ``faq_matched=False`` so the chat
    UI shows it as a bot-originated reply (sourced from the plugin, not FAQ).
    """
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


@router.message(MovieRequestTrigger())
async def handle_movie_request(message: TgMessage, bot_db_id: int) -> None:
    """Handle validated movie request messages."""
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

            # ---- 2. Mirror conversation + inbound message into the panel ----
            conv = await _upsert_panel_conversation(
                session, db_user.id, bot_db_id, message.chat.type
            )
            await _log_inbound(session, conv.id, bot_db_id, message)

            # ---- 3. Dedup check (tmdb_id + media_type) ----
            result = await session.execute(
                select(MovieRequest).where(
                    MovieRequest.tmdb_id == tmdb_id,
                    MovieRequest.media_type == media_type,
                )
            )
            existing = result.scalar_one_or_none()

            if existing:
                # Check if this user already requested
                user_result = await session.execute(
                    select(MovieRequestUser).where(
                        MovieRequestUser.movie_request_id == existing.id,
                        MovieRequestUser.tg_user_id == db_user.id,
                    )
                )
                user_exists = user_result.scalar_one_or_none()

                if not user_exists:
                    existing.request_count += 1
                    session.add(MovieRequestUser(
                        movie_request_id=existing.id,
                        tg_user_id=db_user.id,
                    ))

                await session.commit()
                sent = await _send_reply_card(message, existing, is_duplicate=True)
                async with async_session_factory() as outsess:
                    await _log_outbound(
                        outsess, conv.id, bot_db_id,
                        text=_render_caption(existing, is_duplicate=True),
                        tg_message_id=getattr(sent, "message_id", None),
                        reply_to_message_id=message.message_id,
                    )
                    await outsess.commit()
                return

            # ---- 4. First request -- fetch from TMDB ----
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

            # Extract fields
            title = tmdb_data.get("title") or tmdb_data.get("name") or "Unknown"
            original_title = tmdb_data.get("original_title") or tmdb_data.get("original_name")
            release_date = tmdb_data.get("release_date") or tmdb_data.get("first_air_date")
            genres_list = tmdb_data.get("genres", [])
            genres_str = ", ".join(g["name"] for g in genres_list) if genres_list else None

            # Check remote media library (returns False if not configured)
            in_library = await check_in_library(session, tmdb_id, media_type)

            movie_req = MovieRequest(
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
            session.add(movie_req)
            await session.flush()

            # Record requesting user
            session.add(MovieRequestUser(
                movie_request_id=movie_req.id,
                tg_user_id=db_user.id,
            ))

            await session.commit()
            sent = await _send_reply_card(message, movie_req, is_duplicate=False)
            # Log outbound in a separate session because the previous one is
            # already committed and we want this row even if the send-side
            # fails partially.
            async with async_session_factory() as outsess:
                await _log_outbound(
                    outsess, conv.id, bot_db_id,
                    text=_render_caption(movie_req, is_duplicate=False),
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
#  Reply card
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


def _render_caption(req: MovieRequest, is_duplicate: bool) -> str:
    """Render the rich poster-caption for a MovieRequest.

    Pulls extras (tagline, runtime, director, top cast, IMDB id, country)
    out of the cached ``tmdb_raw`` JSONB blob populated when the request
    was first fetched with ``append_to_response=credits,external_ids``.
    Telegram caps photo captions at 1024 chars; we truncate the synopsis
    aggressively to stay well under that.
    """
    raw = req.tmdb_raw or {}
    is_tv = req.media_type == "tv"
    media_label = "\U0001f4fa TV" if is_tv else "\U0001f3ac Movie"
    year = req.release_date[:4] if req.release_date else "—"

    # Header line: localized title (+ original title if different)
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

    # Runtime / episode runtime
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

    # Credits — director(s) + top 3 cast
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
            director_line = (
                f"\U0001f3ac {_html_escape(', '.join(c['name'] for c in creators[:2]))}\n"
            )
    cast_line = ""
    if cast:
        top_cast = ", ".join(c["name"] for c in cast[:3])
        cast_line = f"\U0001f465 {_html_escape(top_cast)}\n"

    # Synopsis
    overview = (req.overview or "").strip()
    overview_block = ""
    if overview:
        overview_block = "\n\U0001f4dd " + _html_escape(_truncate(overview, 350))

    # Status line
    if req.in_library:
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
    links_line = " · ".join(links)

    caption = (
        f"\U0001f4fd {title_html}\n"
        f"{tagline_line}"
        f"{media_label} · {year}{country_str}{runtime_str}\n"
        f"{rating}\n"
        f"{genres_line}"
        f"{director_line}"
        f"{cast_line}"
        f"{overview_block}\n\n"
        f"{status_line}\n"
        f"{links_line}"
    )

    # Telegram photo caption hard-cap is 1024 characters.
    if len(caption) > 1024:
        # Drop the synopsis first, that's the biggest variable chunk.
        caption = caption.replace(overview_block, "")
        if len(caption) > 1024:
            caption = caption[:1020] + "\u2026"

    return caption


async def _send_reply_card(
    message: TgMessage,
    req: MovieRequest,
    is_duplicate: bool,
):
    """Send a rich poster-card reply. Returns the sent ``Message`` or ``None``."""
    caption = _render_caption(req, is_duplicate)
    poster_url = f"{TMDB_IMAGE_BASE}/w780{req.poster_path}" if req.poster_path else None

    try:
        if poster_url:
            return await message.answer_photo(
                photo=poster_url,
                caption=caption,
                parse_mode="HTML",
            )
        return await message.reply(
            caption, parse_mode="HTML", disable_web_page_preview=False
        )
    except Exception:
        logger.warning("Failed to send poster photo, falling back to text")
        try:
            return await message.reply(caption, parse_mode="HTML")
        except Exception:
            logger.exception("Even text-only reply failed")
            return None
