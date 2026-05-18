# SyncUp — Realtime Coaching Feed

A full-stack realtime coaching feed built with Node.js, Next.js, PostgreSQL, Redis, and Socket.IO.

## Stack
| Layer | Technology |
|-------|-----------|
| Backend API | Express + TypeScript |
| Database | PostgreSQL |
| Cache | Redis (30 s TTL) |
| Realtime | Socket.IO |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |

## Quick Start

### 1. Start infrastructure
```bash
docker compose up -d
```

### 2. Server
```bash
cd server
cp .env .env          # already created
npm install
npm run db:migrate    # creates feed_items table
npm run dev           # http://localhost:4000
```

### 3. Client
```bash
cd client
npm install
npm run dev           # http://localhost:3000
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/feed` | Return all feed items (Redis-cached 30 s) |
| POST | `/feed` | Create a feed item, invalidate cache, emit `new_feed` |
| GET | `/health` | Health check |

### POST /feed body
```json
{ "title": "string", "content": "string", "author": "string" }
```

## Frontend Pages
- **`/`** — Home: live feed with Socket.IO realtime updates, connection badge, skeleton loading
- **`/admin`** — Admin: form to publish new feed items

## Realtime Architecture
1. Admin submits POST /feed → server inserts row, invalidates Redis, broadcasts `new_feed` via Socket.IO
2. Home page receives `new_feed` event → prepends item to list without page refresh
3. Duplicate prevention: client tracks seen IDs in a `Set` and ignores repeats
4. Reconnect handling: Socket.IO auto-reconnects with exponential back-off; connection status shown in UI

## Environment Variables

See `.env.example` for all variables. Copy to `server/.env` and `client/.env.local`.
