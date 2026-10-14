# Ibeku League 2026 — Phase 2 (Full Product)

Official competition website for **Ibeku League 2026** (11 Oct 2026 – 3 Jan 2027).

Phase 2 includes everything from Phase 1 **plus**:

- Fan predictions (outcome + correct score) with cutoff and grading
- CSV player roster import (preview, partial import, error report)
- Match events model (goals, cards)
- AI match previews & post-match analysis via RunPod (OpenAI-compatible)
- Shareable SVG score cards and group table graphics
- Admin screens for predictions, AI, CSV import

---

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL 17
- Argon2id · Zod · csv-parse
- Docker Compose (web + db)

---

## Quick start

```bash
cp .env.example .env
# Set PRIMARY_ADMIN_*, SESSION_SECRET, and optionally LLM_* for AI

docker compose up --build
```

- App: http://localhost:3000  
- Health: http://localhost:3000/api/health  

---

## Environment variables

### Required (Phase 1)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` / `POSTGRES_*` | PostgreSQL |
| `PRIMARY_ADMIN_USERNAME/PASSWORD/PHONE` | First-start bootstrap only |
| `SESSION_SECRET` | ≥32 char random string |
| `APP_URL` | Public base URL |

### Optional (Phase 2 — AI)
| Variable | Description |
|----------|-------------|
| `AI_ENABLED` | `true` / `false` (default false) |
| `LLM_BASE_URL` | RunPod OpenAI-compatible base URL |
| `LLM_API_KEY` | Server-side only — never `NEXT_PUBLIC_*` |
| `LLM_MODEL` | Model name on the endpoint |
| `AI_AUTO_PUBLISH` | `true` to skip draft review (default false) |

Site works fully when AI is disabled or unavailable.

---

## New routes (Phase 2)

| Route | Purpose |
|-------|---------|
| `/predictions` | Fan prediction forms + disclaimer |
| `/api/predictions` | Create / list predictions |
| `/api/share/score/[matchId]` | SVG score card |
| `/api/share/table/[group]` | SVG group table |
| `/admin/import` | CSV player import |
| `/admin/ai` | Generate / review / publish AI analysis |

---

## Predictions rules

- Entertainment only — **no money, stakes or prizes**
- Outcome: Home / Draw / Away
- Correct score: one active per user per match (editable before cutoff)
- Cutoff: when match becomes Live (or admin `predictionCutoff`)
- Graded automatically when admin sets Full-time score

---

## CSV import

Accepted headers: `name`, `player`, `full_name`, `position`, `age`, `phone`, `jersey`, `jersey_number`.  
Name-only rows are valid. Blank optional fields do not overwrite existing data.  
Duplicates within a team are merged.

---

## AI

1. Set `LLM_*` and `AI_ENABLED=true` in Coolify.
2. Admin → AI → Generate Preview or Post-match.
3. Review draft → Publish.
4. Published analysis appears on match pages / home when available.

Never sends passwords, phones or private user data to the LLM.

---

## Share graphics

- Score card: `/api/share/score/{matchId}` (SVG 1200×1200)
- Group table: `/api/share/table/A` (or B/C/D)
- Includes league name + restrained sponsor line
- No private data in images

---

## Coolify

1. Push repo to GitHub  
2. Docker Compose app → this `docker-compose.yml`  
3. Set all env vars (including optional AI)  
4. Deploy → check `/api/health` and primary-admin login  

---

## Sponsor

> Ibeku League 2026 is sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom.

---

## Known limitations

- Fan recovery uses year of birth (no SMS provider configured)
- Group schedule is as supplied (not full round-robin) — organisers should confirm
- AI jobs processed inline on generate for simplicity; optional background worker can be added later
