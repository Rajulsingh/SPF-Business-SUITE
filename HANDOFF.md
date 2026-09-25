# Handoff

Status as of 2026-09-25. Written for whoever (human or a fresh Claude session)
picks this project back up next.

## What this is

SPF Business Suite — daily record-keeping for a poultry breeder/layer farm
(flocks, mortality, egg production, feed/water, body-weight uniformity,
vaccinations). Scoped to the **farm side only** (parent-flock rearing/lay),
not the hatchery. Built after a deep-research pass into the industry (two
research reports exist in this project's history — hatchery-side and
farm-side — covering pain points, mortality root causes, existing
software/hardware, AI maturity, and regulatory/market context; ask the user
if those are still wanted as reference, they were delivered as files
earlier in the session that produced this app, not committed to the repo).

## It's live

**https://spf-business-suite.mailrajulsingh-in.workers.dev**

- Cloudflare account ID: `4b311214e2fe3391a39f9f315aa10382`
- D1 database: `spf-business-suite`, id `a83f5730-5567-4fb0-a569-1f353df8d429`
- KV namespace (sessions): `spf-business-suite-session`, id `aed26cdb8c5b47a5b341cbc3e34ec957`
- Both bound explicitly in `wrangler.jsonc` (not auto-provisioned, since
  auto-provisioning collided with resources that already existed from an
  earlier partial deploy attempt)
- Deployed manually via `npm run deploy` from the owner's local machine.
  **No CI/CD is connected yet** — Cloudflare's Git integration (Workers
  Builds) was discussed but never set up. Every future change needs a
  manual `git pull && npm run deploy` from a machine that can reach
  Cloudflare's API (this development sandbox cannot — see below).

### ⚠️ Rotate the seed credentials

The app was seeded with the default owner login from `.env.example`
(username `owner`, the default password that ships in that file). That
exact password has been posted in plaintext in this session's chat history
and sat in a local `.env` file and shell history — **it must be treated as
compromised**. First priority for whoever has dashboard access: log in,
create a new owner account (or add self-service password change), and
retire the seeded one.

A Cloudflare API token was also pasted into chat earlier in this session to
attempt a direct deploy from the sandbox. That attempt failed (network
policy blocked it, see below) and the token was never used, but **it should
be revoked** if that hasn't already happened (Cloudflare dashboard → My
Profile → API Tokens).

## Environment constraint worth knowing

This development sandbox's network egress policy blocks essentially all
Cloudflare domains (`api.cloudflare.com`, `sparrow.cloudflare.com`, and even
the deployed `*.workers.dev` URL itself). This isn't fixable from inside the
sandbox — it's an organization-level policy, not a retriable connection
issue. Practical effect: **all `wrangler` commands that touch the real
Cloudflare account, and any verification of the live URL, have to be run by
the human on their own machine.** This session could only edit `wrangler.jsonc`
after being told the resulting IDs, and could never itself deploy or curl
the live site to confirm anything.

## Stack (why these choices)

- **Astro** (server output, Astro Actions for zero-JS forms) — chosen when
  the user asked to switch off Next.js
- **Cloudflare Workers** deploy target — user's explicit request
- **Cloudflare D1 + Drizzle ORM** — Prisma was the original choice (see git
  history) but was swapped for Drizzle when moving to Workers: Prisma's D1
  story is heavier/less proven, and `better-sqlite3` (the original driver)
  has native bindings that don't run on Workers at all. This was a judgment
  call made without asking, flagged to the user at the time.
- **Astro's built-in Sessions API** (Cloudflare KV-backed) instead of
  hand-rolled JWT cookies — found while reading the Cloudflare adapter docs
  mid-build; simpler and framework-native.
- **Web Crypto PBKDF2** instead of bcrypt for password hashing — bcrypt's
  deliberately-slow loop is a poor fit for Workers' per-request CPU budget.
- **Hand-rolled server-rendered SVG charts**, no charting library — avoided
  a React island for two single-series line charts; fits Astro's
  zero-JS-by-default model. Chart specs (colors, mark widths, gridlines)
  follow the dataviz skill's validated palette.
- **Design**: monochrome, Vercel/Geist-inspired (black primary buttons,
  thin gray borders, color reserved for chart lines and status badges) —
  user asked for "Vercel design guidelines," this was the interpretation.

## What's built and verified

Verified end-to-end with a real Playwright browser against the actual
`workerd` dev runtime (23/23 checks passing) before deploy:

- Login/logout, role-gated pages (owner/manager/worker)
- Flock creation and listing
- Daily log: mortality, eggs, feed, water, temp/humidity — **upserts by
  flock+date rather than duplicating**, and the form pre-fills from any
  existing entry for the day so a second check-in doesn't wipe out the
  first (this was a real bug caught and fixed during testing)
- Body-weight uniformity samples: paste individual weights → auto-computes
  mean/spread/CV%, flags samples above the target CV band
- Vaccination log
- Dashboard: 30-day mortality and egg-production trend charts, today's KPIs

Not yet verified: the actual live deployment (see network constraint above)
— the user confirmed "yes its live" in chat but no automated check has run
against it from this session.

## Known gaps / not done

- No self-service password change
- No CI — deploys are manual
- No tests beyond the one-off Playwright smoke script (not committed to the
  repo; it lived in the session's scratch area)
- Single farm/tenant model — no multi-farm support
- `HANDOFF.md` (this file) documents the KV/D1 IDs in plaintext, which is
  fine (they're resource identifiers, not secrets — same as the account
  ID), but don't extend this pattern to anything that IS a secret

## Roadmap (from earlier research, not yet started)

The product research (done before this app existed) identified five
farm-side and five hatchery-side "open questions" — problem areas with
real evidence behind them but no committed build decision. This app is
**phase 1 of that: farm-side daily record-keeping**, chosen because almost
every other idea depends on having real data flowing first. Next
candidates, in rough order of how directly the research pointed at them:

1. **Heat-stress alerting** — highest-stakes finding in the whole research
   pass (a 2026 heatwave killed ~20 lakh birds in one event); nothing
   commercially available anywhere does *predictive* (forecast-driven)
   cooling, only reactive threshold control. Real greenfield opportunity,
   also real execution risk (rural power reliability may matter more than
   the software).
2. **Hatchery module** — deliberately out of scope for this app; the
   hatchery-side research report exists if picked back up.
3. **Body-weight/uniformity closed loop** — the app already has manual
   uniformity tracking; the research found individual-bird
   weighing+auto-feeding can cut weight-variation CV from ~14% to ≤2%, but
   that's research-stage, not a commercial product anywhere.
4. **Disease early-warning** — mortality is a poor early signal for
   breeder flocks specifically (egg-production drop is better); no AI
   model exists anywhere for this at breeder-farm scale per the research.
5. **Feed-cost / supply-resilience modeling** — feed is 60-75% of cost and
   India lived through a real supply shock in the underlying research
   window; this is more a planning/analytics feature than new data
   collection.

None of these have been scoped or estimated — they're findings, not a
committed plan. Whoever picks this up next should confirm priority with
the user before building rather than assuming this order.

## Repo / branch

- `github.com/Rajulsingh/SPF-Business-SUITE`, branch `claude/remote-control-9cyvmb`
- All work so far is on this branch; no PR has been opened
