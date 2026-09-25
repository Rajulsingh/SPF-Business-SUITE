# SPF Business Suite

Daily record-keeping for a breeder/layer farm: flocks, mortality, egg production,
feed/water, body-weight uniformity, and vaccinations — the data foundation for
everything else (alerting, trend analysis) built on top later.

This is the first module of a larger suite. It's scoped to the **farm side** only
(parent-flock rearing and lay), not the hatchery — see the project's research
reports for the fuller roadmap.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) + TypeScript + Tailwind CSS v4
- **Prisma 7** + SQLite (via `@prisma/adapter-better-sqlite3`) — easy to swap for
  Postgres later by changing the datasource provider and adapter
- Session auth via signed cookies (`jose`), no external auth provider
- Charts: Recharts

## Getting started

```bash
npm install
cp .env.example .env          # then edit SESSION_SECRET for anything beyond local dev
npx prisma migrate deploy     # create the SQLite database
npx prisma db seed            # creates the first login (see .env for username/password)
npm run dev
```

Open http://localhost:3000 and log in with the seeded owner account
(`SEED_OWNER_USERNAME` / `SEED_OWNER_PASSWORD` in `.env`, defaults to
`owner` / `changeme123`). Change the password by creating a new user and
retiring the seed account — there's no self-service password change yet.

## Roles

- **Owner** — full access, including adding/managing users
- **Manager** — can create flocks and change flock status, plus everything a worker can do
- **Worker** — daily log entry, weight samples, vaccination records

## Data model

- `Flock` — a tracked batch: breed, source (kept free-text/supplier-agnostic),
  housing type, placement date, initial count
- `DailyRecord` — one per flock per day (mortality, eggs, feed, water,
  temperature/humidity); re-submitting the same flock+date **updates** that
  entry rather than creating a duplicate, and the daily-log form pre-fills
  from whatever's already logged for today so a second check-in doesn't wipe
  out the first
- `BodyWeightSample` — either paste individual sample weights (average,
  spread, and coefficient of variation are computed automatically) or enter a
  pre-computed average; samples above the target CV band are flagged
- `VaccinationRecord` — date, vaccine, method, batch, administered by

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run lint` — ESLint
- `npx prisma studio` — browse the database directly
- `npx prisma migrate dev --name <name>` — create a new migration after
  changing `prisma/schema.prisma`
