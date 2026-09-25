# SPF Business Suite

Daily record-keeping for a breeder/layer farm: flocks, mortality, egg production,
feed/water, body-weight uniformity, and vaccinations — the data foundation for
everything else (alerting, trend analysis) built on top later.

This is the first module of a larger suite. It's scoped to the **farm side** only
(parent-flock rearing and lay), not the hatchery — see the project's research
reports for the fuller roadmap.

## Stack

- **Astro** (server output) with zero-JS-by-default forms via **Astro Actions**
- **Cloudflare Workers** as the deployment target, via `@astrojs/cloudflare`
- **Cloudflare D1** (serverless SQLite) as the database, via **Drizzle ORM**
- **Cloudflare KV** for session storage, via Astro's built-in Sessions API — no
  hand-rolled cookie/JWT auth; `Astro.session` / `context.session` handles it
- **Tailwind CSS v4** for styling, with a monochrome, Vercel/Geist-inspired
  design system (black primary actions, thin gray borders, color reserved for
  chart lines and status badges — see `src/styles/global.css`)
- Password hashing via Web Crypto PBKDF2 (not bcrypt — bcrypt's CPU-heavy loop
  is a poor fit for Workers' per-request CPU time limits; PBKDF2 via
  `crypto.subtle` is native and fast)
- Trend charts are hand-rolled, server-rendered SVG (no charting library, no
  client JS) — Astro's zero-JS philosophy fit this well once the chart specs
  were pinned down (see `src/components/TrendChart.astro`)

## Getting started

```bash
npm install
cp .env.example .env   # only used by the seed script, not by the deployed app
```

Create the local D1 database and apply the schema:

```bash
npx drizzle-kit generate                              # regenerate SQL from schema.ts (only needed after a schema change)
npm run db:migrate:local                               # applies drizzle/*.sql to the local D1 emulation
npm run db:seed:local                                   # creates the first login (see .env for username/password)
```

Then:

```bash
npm run dev
```

This runs `astro dev`, which since Astro 6 executes your app on Cloudflare's
actual `workerd` runtime locally (not Node) — dev is a much closer match to
production than older Astro/Next setups. It starts as a background daemon;
useful commands:

```bash
npx astro dev status   # check if it's running
npx astro dev stop     # stop it
npx astro dev logs     # tail its logs
```

Open http://localhost:4321 and log in with the seeded owner account
(`SEED_OWNER_USERNAME` / `SEED_OWNER_PASSWORD` in `.env`, defaults to
`owner` / `changeme123`). Change the password by creating a new user and
retiring the seed account — there's no self-service password change yet.

## Deploying to Cloudflare

1. Create a real D1 database (the one in `wrangler.jsonc` is a placeholder):
   ```bash
   npx wrangler d1 create spf-business-suite
   ```
   Copy the `database_id` it prints into `wrangler.jsonc`.
2. Apply the schema to the real database:
   ```bash
   npm run db:migrate:remote
   npm run db:seed:remote
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```

Session storage (Cloudflare KV) is provisioned automatically on first deploy —
no manual setup needed. `wrangler.jsonc` intentionally only declares the D1
binding.

## Roles

- **Owner** — full access, including adding/managing users
- **Manager** — can create flocks and change flock status, plus everything a worker can do
- **Worker** — daily log entry, weight samples, vaccination records

## Data model

Defined in `src/db/schema.ts` (Drizzle, SQLite dialect):

- `flocks` — a tracked batch: breed, source (kept free-text/supplier-agnostic),
  housing type, placement date, initial count
- `dailyRecords` — one per flock per day (mortality, eggs, feed, water,
  temperature/humidity); re-submitting the same flock+date **updates** that
  entry rather than creating a duplicate, and the daily-log form pre-fills
  from whatever's already logged for today so a second check-in doesn't wipe
  out the first
- `bodyWeightSamples` — either paste individual sample weights (average,
  spread, and coefficient of variation are computed automatically) or enter a
  pre-computed average; samples above the target CV band are flagged
- `vaccinationRecords` — date, vaccine, method, batch, administered by
- `users` — owner/manager/worker accounts

## Scripts

- `npm run dev` — start the dev server (real `workerd` runtime)
- `npm run build` — production build to `dist/`
- `npm run preview` — build, then serve it locally via `astro preview` for a
  final check before deploying
- `npm run check` — type-check (`astro check`)
- `npm run deploy` — build and `wrangler deploy`
- `npm run db:generate` — regenerate SQL migrations from `src/db/schema.ts`
- `npm run db:migrate:local` / `db:migrate:remote` — apply migrations
- `npm run db:seed:local` / `db:seed:remote` — create the first owner login
- `npm run db:studio` — browse the database with Drizzle Studio
