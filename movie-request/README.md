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

Requires ADMINCHAT Panel >= **1.1.4** for correct plugin bot handler dispatch and ORM registry cleanup.

## License

GPL-3.0 - (R) 2026 NovaHelix & SAKAKIBARA
