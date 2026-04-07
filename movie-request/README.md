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
