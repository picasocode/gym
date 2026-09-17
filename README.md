# gym

Multi-user training tracker for the **Death Protocol — 6-day training system**: check off all 93 exercises from the weekly protocol, per athlete, per week — and see how much work is done and how much is still pending.

## What it does

- **Session view** — per-day checklist (Mon–Fri) grouped by training block (Warm-up, Mobility, Strength, Isometric, Core, Endurance, Cooldown), with sets, reps, rest, and focus from the source sheet.
- **Crew view** — done vs. pending workload per athlete and per day, plus each athlete's share of the completed work.
- **Week history** — every week is tracked separately; navigate back and forth through past weeks.
- **Protocol notes** — intensity rules, session target, and the weekly emphasis matrix from the original plan.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma (SQLite)

## Run it

```bash
bun install
bun run db:push
bun run scripts/seed.ts   # loads the 93-exercise protocol + demo athletes
bun run dev
```

Then open the app on port 3000.
