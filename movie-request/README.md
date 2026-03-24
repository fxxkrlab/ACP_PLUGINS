# TMDB Movie Request Plugin

ADMINCHAT Panel plugin for TMDB movie/TV request management with multi-key rotation and media library integration.

## Features

- Telegram users submit movie/TV requests via TMDB URLs (`/req` or `req` command)
- Multi-key TMDB API rotation with automatic rate-limit handling
- Deduplication: multiple users requesting the same title increments the request count
- Optional external media library database check (PostgreSQL/MySQL)
- Admin panel page to view, approve, or reject requests
- Settings tab for managing TMDB API keys and media library configuration

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

## License

GPL-3.0 - (R) 2026 NovaHelix & SAKAKIBARA
