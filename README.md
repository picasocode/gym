# gym

Multi-user training tracker for the **Death Protocol — 6-day training system**: check off all 93 exercises from the weekly protocol, per athlete, per week — and see how much work is done and how much is still pending.

## What it does

- **Session view** — per-day checklist (Mon–Fri) grouped by training block (Warm-up, Mobility, Strength, Isometric, Core, Endurance, Cooldown), with sets, reps, rest, and focus from the source sheet.
- **Crew view** — done vs. pending workload per athlete and per day, plus each athlete's share of the completed work.
- **Week history** — every week is tracked separately; navigate back and forth through past weeks.
- **Protocol notes** — intensity rules, session target, and the weekly emphasis matrix from the original plan.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma (SQLite / Turso libSQL)

## Database

The app talks to a **Turso** (libSQL) cloud database when `TURSO_DATABASE_URL` and
`TURSO_AUTH_TOKEN` are present in the environment, and falls back to a local
SQLite file otherwise.

Required environment variables:

```bash
TURSO_DATABASE_URL="libsql://<your-database>-<org>.turso.io"
TURSO_AUTH_TOKEN="<your-token>"
```

Apply the Prisma schema to Turso and load the protocol data (Prisma's `db push`
cannot target `libsql://`, so the DDL is generated and applied directly):

```bash
bun run scripts/apply-schema-turso.ts   # idempotent CREATE TABLE IF NOT EXISTS
bun run scripts/seed.ts                 # 93 exercises + demo athletes (safe to re-run)
```

If the database was created through the Vercel × Turso integration, both
variables are injected into your Vercel project automatically.

## Run it

```bash
bun install
bun run db:push            # local SQLite only (used when Turso env vars are absent)
bun run scripts/seed.ts
bun run dev
```

Then open the app on port 3000.
