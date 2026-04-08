# TMDB Movie Request Plugin

ADMINCHAT Panel plugin for TMDB movie/TV request management with multi-key rotation and media library integration.

## Features

- Telegram users submit movie/TV requests via TMDB URLs (`/req` or `req` command)
- **Rich reply cards** with poster, tagline, runtime, country, director/creator, top 3 cast, synopsis, IMDB/TMDB links
- Multi-key TMDB API rotation with automatic rate-limit handling (supports both v3 API Key and v4 Bearer Token)
- Deduplication: multiple users requesting the same title increments the request count
- Optional external media library database check (PostgreSQL/MySQL)
- Admin panel page to view, approve, or reject requests
- Settings tab for managing TMDB API keys and media library configuration with inline validation error display
- **Web chat logging**: `/req` interactions appear in the panel's chat history alongside normal messages

## Installation

1. Copy the `movie-request/` folder into your Panel's plugin directory
2. Activate the plugin from the Panel's Plugin Manager
3. The plugin will automatically run its database migration to create the required tables

## Configuration

### TMDB API Keys

Navigate to **Settings > TMDB Keys** to add your TMDB API keys. Multiple keys are supported for rotation and rate-limit resilience.

### Media Library (Optional)

Connect an external PostgreSQL or MySQL database to automatically check whether a requested title already exists in your media library. Configure this in the TMDB Keys settings tab.

## Bot Commands

| Context | Command | Example |
|---------|---------|---------|
| Private chat | `/req <TMDB_URL>` or `req <TMDB_URL>` | `/req https://www.themoviedb.org/movie/550` |
| Group chat | `@bot req <TMDB_URL>` | `@mybot req https://www.themoviedb.org/tv/1396` |

## Database Tables

All tables use the `plg_movie_request_` prefix:

- `plg_movie_request_tmdb_keys` - TMDB API key storage
- `plg_movie_request_requests` - Movie/TV request records
- `plg_movie_request_users` - Junction table linking requests to Telegram users
- `plg_movie_request_media_library_configs` - External media library connection config

## Changelog

### 1.0.24 (2026-04-08)
- **Fix (CRITICAL)**: PATCH endpoint (✓ fulfill / ✗ reject) returned 500 `MissingGreenlet` error — `MovieRequestOut.model_validate(req)` tried to lazy-load `updated_at` (a server-generated value) outside the async greenlet context. Fixed by adding `await db.refresh(req)` after flush.
- **Feature**: Fulfill webhook — when a request is marked as fulfilled (✓), the plugin POSTs the request data (tmdb_id, title, media_type, requested_resolution, etc.) to a configurable webhook URL. Configure `fulfill_webhook_url` and optionally `fulfill_webhook_auth` in the plugin config. Leave empty to disable.
- **Config**: Added `fulfill_webhook_url` and `fulfill_webhook_auth` to `config_schema` in manifest.json.

### 1.0.23 (2026-04-08)
- **Feature**: TV season supplement — compares library episode counts against TMDB's per-season totals. Incomplete seasons are flagged with ⚠️ in a compact summary format (e.g. "23季在库 | ✓ 20季完整 | ⚠️ 3季缺集"). Up to 3 inline buttons for the most-incomplete seasons (e.g. "✅ 补S21(缺11集)").
- **Feature**: Precise episode supplement via reply — user replies to the bot's library-check card with `S21E15` or `S21` to submit a specific season/episode supplement request. Parsed via `TVSupplementReplyFilter` which validates the reply context (must be replying to a message with a TMDB TV link in caption_entities).
- **Display**: Compact format for TV shows replaces per-season listing for complete seasons. Only incomplete/missing seasons are detailed. Stays within Telegram's 1024-char caption limit for 20+ season shows.
- **Backend**: `detect_incomplete_seasons()` and `_get_tmdb_season_counts()` helpers in media_library.py. New callback action `ts` (TV supplement) in handlers. `format_library_detail_lines()` now accepts optional `tmdb_raw` for comparison. `requested_resolution` stores "S21" or "S21E15" for TV supplements.

### 1.0.22 (2026-04-08)
- **Feature**: Path-based fallback query — when the `tmdb` column is empty (common for older seasons), the plugin now also queries by `path LIKE '%[tmdbid=XXX]%'`. This recovers 647K+ files that were invisible before because the strm system didn't populate their tmdb field.
- **Feature**: Media-type filtering at path level — prevents tmdb_id collisions (e.g. `/movie/4614` = 惊天核网 vs `/tv/4614` = NCIS). TV queries only match files under `/Season NN/` subdirectories; movie queries exclude Season folders.
- **Feature**: Separated display — TV shows now show a "📺 剧集 (N季)" header with per-season episode ranges, while standalone files (movies/specials) show under "📀 其他版本".
- **Backend**: New optional config field `path_column` (migration 006). New `_build_common_filters` / `_validate_cfg_identifiers` helpers reduce duplication. `_check_via_db` refactored into two-step query.
- **Code quality**: All SQL identifiers validated via `_validate_cfg_identifiers()` before any query. No unused imports. Identifier quoting consistent.

### 1.0.21 (2026-04-08)
- **Fix**: Strip HTML tags from web chat outbound log to fix ReactMarkdown rendering overlap

### 1.0.20 (2026-04-08)
- **Fix**: Group conversations no longer split across multiple chat windows when a user interacts with different bots from the same pool (`_upsert_panel_conversation` now matches by `(tg_user_id, source_type="group")` without `primary_bot_id` filter for group chats)

### 1.0.19 (2026-04-08)
- **Feature**: Supplement-request for missing resolutions — when a movie is found in the library but is missing the 1080p or 4K version, the bot now offers "✅ 补片 1080p" / "✅ 补片 4K" buttons (plus a Cancel button). Clicking submits a separate `MovieRequest` row tagged with `requested_resolution`.
- **Logic**: Only triggers for movies (TV shows already have per-season tracking). Only considers 1080p and 4K — other resolutions (720p, etc.) and HDR/DoVi flavours are ignored. If both 1080p and 4K exist, no buttons are shown.
- **Backend**: New column `requested_resolution` on `plg_movie_request_requests`. Dedup is now by `(tmdb_id, media_type, requested_resolution)` so a generic request and a 4K supplement for the same movie are tracked as separate rows.
- **Migration**: `005_add_requested_resolution`
- **Frontend**: Admin requests table shows a small `补片 1080p` / `补片 4K` orange badge next to entries that came from a supplement request.
- **Cancel**: The Cancel button is now context-aware — `❌ 已取消补片` for supplement context, `❌ 求片已取消` for normal flow.

### 1.0.18 (2026-04-08)
- **Feature**: Edit existing media library configs in place — pencil icon on each card opens an inline edit form pre-filled with current values. Backend `PATCH /media-library/{id}` updates a single config.
- **UX**: Password and API auth header are never pre-filled in the edit form. Leaving them blank keeps the existing value (so users can edit other fields without re-typing secrets).
- **Refactor**: Form extracted into a reusable `MediaLibraryForm` component used by both create and edit modes.

### 1.0.17 (2026-04-08)
- **Feature**: Multi-database support — Media Library Check now supports multiple connections side-by-side. Each one is rendered as its own card with Test/Delete buttons. The bot queries all active configs and merges results.
- **Feature**: Library version detail — when the optional `name_column` (and optionally `is_dir_column` / `trashed_column`) is set, the bot reply card now shows version information below "已在媒体库中":
  - **Movies**: `📀 1080p × 1`, `📀 4K DoVi+HDR10 × 1` etc.
  - **TV shows**: `📺 S01: E01-E26 (1080p) 26集`, `📺 S02: E01-E07 (1080p) 7集` etc.
- **Filename parser**: Detects resolution (4K/2160p/UHD, 1080p/FHD, 720p/HD, 576p, 480p), HDR (DoVi, HDR10+, HDR10, HDR), and SxxExx season/episode patterns.
- **Backend**: New migration `004_media_library_detail` adds `name_column`, `is_dir_column`, `trashed_column` columns. Routes refactored from singleton to multi-config CRUD: `GET /media-library` returns a list, `POST` creates one (no longer replaces all), `DELETE /media-library/{id}` removes one, `POST /media-library/{id}/test` tests one.
- **Service**: `check_in_library()` now returns a `LibraryInfo` dict (not bool) with `exists`, `movie_versions`, `tv_seasons`, `total_files`. Multi-config aggregation merges results across all active configs. Backwards compatible — bool callers can use `info["exists"]`.

### 1.0.16 (2026-04-08)
- **Fix**: Media library `int → str` type cast — `CAST AS TEXT` on both sides of comparison so DBs that store tmdb_id as VARCHAR work without asyncpg type errors
- **i18n**: Status text fully Chinese (`已在媒体库中`, `求片已提交`, `N人已求过此片`)

### 1.0.15 (2026-04-08)
- **Feature**: Delete movie requests — new `DELETE /{request_id}` endpoint + trash icon button in the admin requests table (with confirmation dialog)
- **Feature**: API-mode media library check — select "HTTP API" as connection type to check if a tmdb_id exists via an external REST API endpoint. Supports custom URL with `{tmdb_id}` / `{media_type}` placeholders, optional Authorization header, and configurable JSON response field path.
- **Feature**: New DB migration `003_add_api_media_library` adds `api_url`, `api_auth_header`, `api_response_path` columns and makes DB-specific fields nullable for API mode.
- **UI**: Settings tab renamed from "TMDB Keys" to "Request Config" to reflect the broader scope (TMDB keys + media library config)
- **UI**: Media Library section header changed to "Media Library Check", description updated to mention API option

### 1.0.14 (2026-04-07)
- **Fix (CRITICAL)**: Confirm/Cancel callbacks failed silently with `TypeError: missing required argument 'bot_db_id'` because Panel < 1.1.5 only injected bot context on the message observer, not callback_query. The handler now declares `bot_db_id` as optional so it works on older Panels too. Requires Panel >= **1.1.5** for full functionality (logs outbound messages).
- **UI**: TMDB / IMDB links moved ABOVE the status line, so the action prompt ("❓ 是否确认求片？") sits at the very bottom, right next to the inline buttons it refers to.

### 1.0.13 (2026-04-07)
- **Feature**: Confirmation step before submitting a request — bot shows the movie card with inline buttons (✅ 确认求片 / ❌ 取消). Only after the user clicks ✅ is the request saved to the database. Clicking ❌ edits the card to "求片已取消" without any DB write.
- **Feature**: Same-user duplicate requests now show "🔄 你已经求过这部了" without buttons (informational only)
- **Feature**: Callback query handler for inline button presses, with requester-only access control
- **Enhancement**: Added `callback_query` to manifest `bot_events`

### 1.0.12 (2026-04-07)
- **Fix**: `_log_inbound` crashed on `message.model_dump()` because aiogram's `Default` sentinel is not JSON-serializable; now excludes `bot` and `from_user` fields (mirrors the panel's `private.py` approach)

### 1.0.11 (2026-04-07)
- **Feature**: Rich reply cards — poster (w780), tagline, runtime, country, director/creator, top 3 cast, synopsis, IMDB + TMDB links
- **Feature**: Web chat logging — `/req` conversations now appear in the panel's chat page (Conversation + Message upsert)
- **Fix**: `datetime.now(timezone.utc)` (offset-aware) mixed with naive `DateTime` column caused asyncpg `TypeError` on rate-limit comparison; changed to `datetime.utcnow()`

### 1.0.10 (2026-04-07)
- **Fix**: All ORM models add `extend_existing=True` to survive plugin reactivation
- **Fix**: `api_key` schema/model/migration widened from 200 to 500 chars for TMDB JWT tokens
- **Fix**: Frontend `addMutation.onError` displays validation errors inline (previously 422 was silently swallowed)

### 1.0.8 (2026-04-07)
- **Fix**: `GET /tmdb-keys` and `GET /media-library` returned 422 because `/{request_id}` route shadowed literal paths; constrained with Starlette `:int` converter

### 1.0.6 and earlier
- Initial release through iterative development

## Compatibility

Requires ADMINCHAT Panel >= **1.1.5** for full functionality (callback_query bot context middleware). Will run on 1.1.4 but logs outbound messages may be skipped after a button click.

## License

GPL-3.0 - (R) 2026 NovaHelix & SAKAKIBARA
