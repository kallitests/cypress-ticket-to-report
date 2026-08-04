# ADR 0002 — cypress-realworld-app as SUT, via a custom Docker image

**Status:** Accepted
**Date:** 2026-08-04

## Context

The POC brief assumed cypress-realworld-app (RWA) "ships its own
`docker-compose.yml` and seed scripts." Having cloned the actual repo
(pinned commit `401daddb56c6ed935f20a8cb5f38e3f1fea16fec`) to verify rather
than assume, that turned out to be wrong on the Docker part: **RWA has no
Dockerfile and no docker-compose.yml at all.** It ships yarn scripts only
(`start`, `start:ci`, `db:seed`, `db:seed:dev`, ...), designed to run on a
bare Node.js host (its own CI, CircleCI, runs it that way).

RWA is vendored here as a **git submodule** (`vendor/cypress-realworld-app`,
pinned to the commit above) rather than copied in, so the SUT's own history
stays traceable and updates are an explicit, reviewable `git submodule
update` rather than a silent vendor drift. It is not forked or modified.

### The network-topology trap

While reading RWA's own source to get the `data-cy`/`data-test` selector
convention right (the brief also assumed `data-cy`; RWA actually uses
**`data-test`** — see `cypress/support/commands.ts`), a more consequential
detail surfaced: RWA's frontend bundle does **not** call its API through a
relative path or an environment-configurable base URL. It hardcodes
`http://localhost:${VITE_BACKEND_PORT}` at build time (see
`vendor/cypress-realworld-app/src/machines/*.ts`, e.g. `usersMachine.ts`,
`personalTransactionsMachine.ts`). Only four auth routes (`/login`,
`/callback`, `/logout`, `/checkAuth`) are proxied through the frontend's own
origin (`src/setupProxy.js`); everything else — users, transactions,
notifications, the `/testData/*` test-data backdoor — is called directly
against port 3001, by literal string, regardless of what host actually
served the page.

That's invisible in RWA's own CI (frontend and backend always run on the same
host, so `localhost` means the same machine either way) but it breaks the
"obvious" Docker Compose shape: a `cypress` container on the default bridge
network, addressing the app via a service hostname like `http://rwa:3000`,
would see its own `localhost:3001` when the bundle tries to reach the API —
not RWA's.

## Decision

- **`docker/rwa.Dockerfile`** (ours, RWA ships none): installs the vendored
  submodule's dependencies (`--ignore-scripts`, since `husky install` in
  `postinstall` needs a `.git` directory that doesn't exist in the image
  layer — `patch-package` is run explicitly instead), builds the frontend
  (`yarn build:ci`), seeds deterministic fixture data
  (`yarn db:seed:dev`, copying the repo's own `data/database-seed.json`),
  and boots the same `start:ci` entrypoint RWA's own CI uses
  (`docker/rwa-entrypoint.sh`).
- **`docker-compose.yml`** runs the `cypress` service with
  `network_mode: "service:rwa"` instead of a bridge network + service
  hostname, so both containers share one network namespace and
  `http://localhost:3000` / `:3001` resolve identically for both — matching
  what RWA's own bundle expects.
- In **CI** (`.github/workflows/pr-smoke.yml`,
  `nightly-regression.yml`), Cypress runs directly on the GitHub Actions
  runner (not in its own container) against `docker compose up -d rwa`
  with published ports — the simplest way to get the same "shared
  localhost" property without `network_mode` gymnastics, and it avoids
  paying twice for the `cypress/included` image pull in CI.
- Cookie scoping (RFC 6265 §8.5) ignores port, so a session cookie obtained
  by calling `http://localhost:3001/login` directly (used by
  `authActions.loginByApi`) is still sent on requests to
  `http://localhost:3000` — App Actions can talk to the API origin
  directly without re-deriving RWA's partial auth-proxy setup.

## Consequences

- The Docker image build is unavoidably heavier than a typical "copy static
  files" image (full `yarn install` + Vite build of a real app), but it's a
  faithful, unmodified SUT rather than a stripped-down stand-in.
- `network_mode: "service:rwa"` is a slightly unusual Compose pattern; it's
  documented here and inline in `docker-compose.yml` specifically so it
  doesn't look like an accident on review.
- If RWA ever moves to relative API paths or a configurable base URL
  upstream, this ADR's constraint disappears and the Compose file can be
  simplified back to a standard bridge network with a service hostname —
  worth re-checking on submodule updates.
