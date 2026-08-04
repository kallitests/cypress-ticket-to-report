# ADR 0003 — Deterministic seed data, and tag-based suite selection

**Status:** Accepted
**Date:** 2026-08-04

## Context

Two independent decisions, both about making runs reproducible and cheap to
target, grouped here because they're small and related.

### Test data

RWA supports two seeding modes: `yarn db:seed` regenerates the whole
database with `faker`-driven random data (used for local development, where
variety is a feature), and `yarn db:seed:dev` copies the repo's own
pre-generated, deterministic `data/database-seed.json` over the live
`data/database.json`. RWA also exposes this as an HTTP action —
`POST /testData/seed` — and a read-back — `GET /testData/:entity` — mounted
only when `NODE_ENV` is `test` or `development` (see
`vendor/cypress-realworld-app/backend/app.ts`).

### Suite selection

The brief calls for smoke / regression / API suites, selected independently
in CI, without hand-maintained spec-path lists that drift from what's
actually tagged.

## Decision

- **Seed data is deterministic, never `faker`-random, in this pipeline.**
  The Docker image runs `db:seed:dev` at startup (not `db:seed`), and
  `dbActions.reseed()` (`cypress/support/app-actions/db.actions.ts`) calls
  `POST /testData/seed` at the top of specs that need a clean slate — same
  fixture data, every run, every environment. No test hard-codes a
  username or user id: `dbActions.getUsers()` reads real seeded users back
  through `GET /testData/users` and specs pick from that list, so they stay
  correct if the seed size (`SEED_USERBASE_SIZE`) ever changes.
- **`@cypress/grep`** drives suite selection via `{ tags: '@smoke' }` /
  `{ tags: '@regression' }` / `{ tags: '@api' }` on `describe`/`it` blocks,
  run with `cypress run --env grepTags=@smoke` (per npm script in
  `package.json`). No separate spec-path convention to keep in sync — a
  test's suite membership is a one-line annotation next to the test itself,
  and a test can carry more than one tag (e.g. `@regression` and
  `@negative`) without being duplicated.

## Consequences

- Regression runs are directly comparable night over night (same starting
  balances, same user set) — a numeric assertion that passes tonight will
  still be correct tomorrow night.
- A test can be promoted from `@regression` to `@smoke` (or vice versa) by
  editing one line, with no file move required.
- `dbActions.reseed()` costs one HTTP round-trip per spec that calls it;
  acceptable at this suite's size, worth revisiting (e.g. seed once per
  file instead of per test) if the regression suite grows much larger.
