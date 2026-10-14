# Ibeku League 2026 — Phase 1

Official competition website for **Ibeku League 2026** (11 Oct 2026 – 3 Jan 2027).

**Phase 1** delivers a production-ready core platform:

- Groups, teams, fixtures & knockout slots
- Automatic group tables + overall ranking
- Public pages (Home, Fixtures, Results, Groups, Standings, Knockout, Teams, Match centre)
- Fan signup / login / recovery
- Admin console for scores, teams, players, users and secondary admins
- Docker Compose + Coolify-ready deployment
- PostgreSQL persistence, health checks, audit log

**Out of scope for Phase 1:** AI analysis, fan predictions, shareable score images, CSV roster import.

---

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL 17
- Argon2id password hashing
- Docker multi-stage build

---

## Quick start (local with Docker)

```bash
cp .env.example .env
# Edit .env — set strong PRIMARY_ADMIN_* and SESSION_SECRET

docker compose up --build
```

App: http://localhost:3000  
Health: http://localhost:3000/api/health

Primary admin is created automatically from the environment variables on first start (never reset on subsequent restarts).

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (internal hostname `db` in Compose) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Yes | Used by the db service |
| `PRIMARY_ADMIN_USERNAME` | First start | Bootstrap primary admin |
| `PRIMARY_ADMIN_PASSWORD` | First start | Bootstrap primary admin (hashed) |
| `PRIMARY_ADMIN_PHONE` | First start | Bootstrap primary admin |
| `SESSION_SECRET` | Yes | Long random string (≥32 chars) |
| `APP_URL` | Yes | Public base URL |
| `COOKIE_SECURE` | Prod | `true` behind HTTPS |
| `PORT` | No | Default 3000 |

Never commit real secrets. Keep production values only in Coolify.

---

## Coolify deployment

1. Push this repository to GitHub.
2. Create a new application in Coolify → Docker Compose.
3. Point to this repo and the `docker-compose.yml` file.
4. Set all environment variables listed above.
5. Ensure the web service port is 3000 and the domain has HTTPS.
6. Deploy. Check logs for migration + seed + admin bootstrap.
7. Visit `/api/health` and log in as the primary admin.

PostgreSQL data is stored in a named volume and survives restarts.

---

## Main routes

**Public**
- `/` — Home
- `/fixtures` — Fixtures
- `/results` — Results
- `/groups` — Group tables
- `/standings` — Overall ranking (comparison only)
- `/knockout` — Bracket
- `/teams` / `/teams/[slug]` — Teams
- `/matches/[id]` — Match centre
- `/login` `/signup` `/account` `/forgot-password`

**Admin** (`/admin`)
- Dashboard, Matches (edit scores), Teams, Players, Users, Admins (primary only)

---

## Standings rules

- Points: Win 3, Draw 1, Loss 0
- Sort: Points → Goal Difference → Goals For
- Qualification: top 2 per group only
- Overall ranking is for comparison and does **not** affect qualification

---

## Sponsor

> Ibeku League 2026 is sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom.

---

## Phase 2 (future)

Predictions, full match events (goals/cards), CSV import, AI analysis (RunPod), shareable graphics.

---

## Licence

Private / league use.
