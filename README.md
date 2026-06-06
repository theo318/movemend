# MoveMend

**Move better. Mend faster.**

Patients leave appointments with clinical notes and exercise instructions they
don't fully understand. MoveMend converts doctor notes and treatment plans into
visual, personalized recovery guidance using AI and an interactive 3D model.

## What it does

1. **Paste clinical inputs** — doctor notes, diagnosis, treatment plan, symptoms.
2. **AI extracts structure** — body part, affected area, a plain-language summary,
   recommended exercises, and safety warnings.
3. **See it on a 3D hand** — the injured finger glows red and the exercise is
   animated. Drag to rotate, scroll to zoom.
4. **Track progress** — log pain score, exercise completion and notes, and watch
   the recovery history build up.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **React Three Fiber / three.js** for the 3D hand (procedural — no GLB asset needed)
- **Framer Motion** for transitions
- **API routes** in Next.js (`/api/analyze`, `/api/progress`, `/api/case/:id`)
- **Claude Sonnet** for analysis (with a deterministic mock fallback)
- **Supabase Postgres** for storage (with an in-memory fallback)

## Runs with zero setup

Every external dependency is optional. With **no** API keys or database, the app
runs end-to-end on a mock analyzer + in-memory storage — ideal for fast iteration
and demos. Add credentials and it switches to the real services automatically.

```bash
npm install
npm run dev          # http://localhost:3000
```

Then open `/case/new` and click **Load demo** to run the spec's demo scenario.

## Going live (optional)

Copy `.env.example` to `.env.local` and fill in whichever you have:

| Variable | Effect when set |
| --- | --- |
| `ANTHROPIC_API_KEY` | Uses Claude Sonnet instead of the mock analyzer |
| `ANTHROPIC_MODEL` | Override the model (default `claude-sonnet-4-6`) |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Persists cases/progress in Postgres |

For Supabase, run `supabase/schema.sql` in the SQL editor first to create the
`cases` and `progress_logs` tables.

## Project structure

```
app/
  page.tsx                  Home / hero (live 3D hand)
  case/new/page.tsx         Create a recovery plan
  case/[id]/page.tsx        Recovery guide (3D model + summary + exercises)
  case/[id]/progress/page.tsx  Log + history
  api/analyze/route.ts      POST: AI analysis -> persist case
  api/progress/route.ts     POST: save a progress log
  api/case/[id]/route.ts    GET: case + progress history
components/
  Hand3D.tsx                React Three Fiber hand (highlight + flexion animation)
  HandFallback.tsx          2D SVG hand shown when WebGL is unavailable
  ProgressForm.tsx          Client form for logging progress
lib/
  ai.ts                     Claude + mock analyzer
  db.ts                     Supabase + in-memory store (same interface)
  anatomy.ts                Map analysis -> which finger to highlight/animate
  types.ts                  Shared types + zod schemas
supabase/schema.sql         Database schema
```

## API

**`POST /api/analyze`** — `{ doctorNotes, diagnosis, treatmentPlan, symptoms }`
→ `{ caseId, analysis: { bodyPart, affectedArea, injurySummary, recommendedExercises, warnings }, source }`

**`POST /api/progress`** — `{ caseId, painScore, exerciseCompleted, notes }` → the saved log

**`GET /api/case/:id`** — `{ case, progress }`

## Roadmap

The architecture is future-ready for more body parts (shoulder, knee, ankle); the
MVP ships the hand model. The analyzer already detects other regions in text.

> MoveMend summarizes clinical notes for understanding. It does not diagnose or
> replace professional medical advice.

## Team

- [@theo318](https://github.com/theo318)
- _teammate_
- _teammate_
- _teammate_
