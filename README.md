# 🧪 cypress-ticket-to-report

> **End-to-end QA automation showroom — migrating from Cypress to Playwright, TypeScript throughout.**
> From a Jira ticket to a running critical-path smoke suite, exercised against a real application (not a toy demo site), Dockerized, orchestrated on Kubernetes, wired into GitHub Actions, alerting on Slack and reporting via Mochawesome / Playwright HTML Report. The Cypress suite is the historical baseline; Playwright (CLI + MCP) is the migration target — see [MIGRATION.md](MIGRATION.md).

[![Status](https://img.shields.io/badge/status-POC%20in%20progress-orange?style=flat-square)](<>)
[![Cypress](https://img.shields.io/badge/Cypress-TypeScript-17202C?style=flat-square&logo=cypress)](https://www.cypress.io)
[![Playwright](https://img.shields.io/badge/Playwright-migration%20target-2EAD33?style=flat-square&logo=playwright)](https://playwright.dev)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-orchestration-326CE5?style=flat-square&logo=kubernetes)](https://kubernetes.io)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions)](https://github.com/features/actions)
[![Mochawesome](https://img.shields.io/badge/Reporting-Mochawesome-8A2BE2?style=flat-square)](<>)

---

## 🗺️ Table of Contents

- [Why this repo?](#-why-this-repo)
- [Status — what's live vs. in progress](#-status--whats-live-vs-in-progress)
- [Cypress → Playwright migration](#-cypress--playwright-migration)
- [Test targets](#-test-targets)
- [Test suites](#-test-suites)
- [Architecture](#%EF%B8%8F-architecture)
- [Architecture Decision Records](#-architecture-decision-records)
- [Repository structure](#-repository-structure)
- [Running locally](#-running-locally)
- [Running with Docker](#-running-with-docker)
- [Building & pushing the Docker image](#-building--pushing-the-docker-image-github-container-registry)
- [Running on Kubernetes](#%EF%B8%8F-running-on-kubernetes-kind--minikube)
- [Alerting & Reporting](#-alerting--reporting)
- [Roadmap](#-roadmap)

---

## 💡 Why this repo?

This is not a client project — it's a **live showroom**. Anyone can fork this repository, run the pipeline, and see for themselves how a functional need (a Jira ticket) turns into a running, automated quality gate against a real application.

```
Jira ticket (tickets/ticket-101.json)
        │
        ▼
Cypress automation, TypeScript + App Actions (cypress/e2e/)
   against cypress-realworld-app (System Under Test)
        │
        ▼
Docker Compose (SUT + test runner)
        │
        ▼
Kubernetes Job (k8s/)
        │
        ▼
GitHub Actions CI/CD (.github/workflows/)
        │
        ├──► Slack alerting (on failure)
        │
        ▼
Mochawesome report (published on GitHub Pages)
```

**Loom demo:** _[link to be added]_

---

## 📍 Status — what's live vs. in progress

This repo pivoted mid-build from a saucedemo.com/reqres.in Cucumber suite to
**[cypress-realworld-app](https://github.com/cypress-io/cypress-realworld-app)
(RWA)** as the System Under Test, in TypeScript with an App Actions
architecture — a deliberate, heavier rework chosen for a more realistic
showroom. It's being built and committed phase by phase.

| Area                                                                     | Status                                                                                                                                       |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| SUT integration (RWA vendored as a submodule, custom Docker image)       | ✅ Done — see [ADR 0002](docs/adr/0002-rwa-as-sut-custom-docker-image.md)                                                                    |
| TypeScript strict + ESLint + Prettier + husky pre-commit                 | ✅ Done                                                                                                                                      |
| App Actions (`auth`, `transaction`, `db`) + `@cypress/grep` tagging      | ✅ Done — see [ADR 0001](docs/adr/0001-app-actions-vs-page-objects.md), [ADR 0003](docs/adr/0003-deterministic-seed-and-tagging-strategy.md) |
| `@smoke` suite (sign-in, send-a-payment — the critical path)             | ✅ Done                                                                                                                                      |
| `@regression` suite, `@api` suite                                        | ⬜ Not started                                                                                                                               |
| `pr-smoke.yml` / `nightly-regression.yml` (RWA via Docker Compose in CI) | ⬜ Not started — **the existing `.github/workflows/*.yml` still target the old saucedemo.com setup and will fail if triggered as-is**        |
| GitHub issue automation on nightly failure, Slack webhook                | ⬜ Not started                                                                                                                               |
| `cypress-axe` accessibility tests                                        | ⬜ Not started                                                                                                                               |
| `docs/user-stories/`, 3-amigos notes, test plan, coverage matrix         | ⬜ Not started                                                                                                                               |
| Postman/Bruno collection                                                 | ⬜ Not started                                                                                                                               |
| `CONTRIBUTING.md`, `CODEOWNERS`, PR template                             | ⬜ Not started                                                                                                                               |
| Kubernetes manifests (`k8s/`) updated for RWA                            | ⬜ Not started — still reference the old image/target                                                                                        |
| Playwright socle (`playwright/`), sign-in scenario migrated               | ✅ Done — see [Cypress → Playwright migration](#-cypress--playwright-migration), [MIGRATION.md](MIGRATION.md)                               |
| Playwright CLI (`codegen`, `init-agents`) on a new scenario               | ⬜ Not started                                                                                                                               |
| Playwright MCP session (`@playwright/mcp` + Claude Code)                  | ⬜ Not started                                                                                                                               |
| CI running both suites (Cypress + Playwright) in the same workflow        | ⬜ Not started                                                                                                                               |
| Second SUT, Playwright-only: automationexercise.com — UI `@smoke` (account + cart/checkout) | ✅ Done — see [Test targets](#-test-targets), `playwright/tests/automationexercise/`                                                          |
| Second SUT, Playwright-only: automationexercise.com — API `@smoke @api` (14 documented endpoints) | ✅ Done — `playwright/tests/automationexercise/api.spec.ts`                                                                                    |
| CI wiring for the automationexercise Playwright project                   | ⬜ Not started — `.github/workflows/*.yml` don't invoke it yet, same pending state as the rest of the Playwright CI wiring above             |

See the [Roadmap](#-roadmap) for the full punch list.

---

## 🔀 Cypress → Playwright migration

This repo is mid-migration from Cypress to Playwright — both suites live
side by side on purpose (the coexistence is part of the proof, not a
mess to clean up). Full rationale and end-state target:
[docs/SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md](docs/SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md).
Line-by-line comparison for the scenario migrated so far: [MIGRATION.md](MIGRATION.md).

| | Cypress (`cypress/`) | Playwright (`playwright/`) |
| --- | --- | --- |
| Role | Historical baseline — kept, not removed | Migration target |
| Sign-in smoke scenario (`JIRA-101`) | ✅ Implemented | ✅ Implemented |
| Payment smoke scenario | ✅ Implemented | ⬜ Not migrated yet |
| Pattern | App Actions ([ADR 0001](docs/adr/0001-app-actions-vs-page-objects.md)) | Page Object Model + `test.extend` fixtures |
| Selectors | `cy.getByTestId()` custom command | `page.getByTestId()`, `testIdAttribute: "data-test"` |
| Reporting | Mochawesome (`reports/mochawesome/`) | Playwright HTML Report (`reports/playwright-html/`) |
| Run command | `npm run test:smoke` | `npm run pw:test:smoke` |

Next steps: Playwright CLI (`codegen`/`init-agents`) on an uncovered
scenario, then a Playwright MCP session documented in
`mcp-sessions/MCP-SESSION.md`, then wiring both suites into one CI
workflow before the eventual Cypress switch-off.

---

## 🎯 Test targets

This repo runs against **two independent SUTs**, on purpose — one gated
behind Docker (RWA, the main showroom target), one that needs zero setup
(automationexercise.com), so a recruiter can run `npm run pw:test:ae`
against the internet without cloning submodules or booting a container.
Both are wired as separate Playwright **projects** in `playwright.config.ts`
(`rwa-chromium` / `automationexercise-chromium`), each with its own
`baseURL` and `testIdAttribute`.

| Layer        | Target                                                                                                                                                                                                  | Why                                                                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI + API** | [cypress-realworld-app](https://github.com/cypress-io/cypress-realworld-app) (RWA), Cypress's own reference application for a payment app (users, contacts, transactions, notifications, bank accounts) | Real, non-trivial app with backend state — a more credible showroom than a static demo site. Vendored as a pinned git submodule (`vendor/cypress-realworld-app`), run via a Docker image this repo builds (RWA ships neither a `Dockerfile` nor a `docker-compose.yml` of its own) |
| **UI + API** | [automationexercise.com](https://automationexercise.com), a public e-commerce demo site with a full account/cart/checkout journey and a documented REST API (`/api_list`, 14 scenarios)                 | Playwright-only second target: no local Docker stack needed, a live, third-party site with real network latency — a different kind of proof than a vendored SUT, and the one covered by this repo's `@smoke` UI + API suites end to end                                          |

> RWA selectors use its own `data-test` convention (not `data-cy`), verified by reading the vendored source. See [ADR 0002](docs/adr/0002-rwa-as-sut-custom-docker-image.md). automationexercise.com selectors use its own `data-qa` convention, the attribute the site itself adds for automation practice.

---

## 🧪 Test suites

### Cypress + Playwright, against RWA

| Suite          | Tag           | Scope                                                                             | Trigger                            | Status         |
| -------------- | ------------- | --------------------------------------------------------------------------------- | ---------------------------------- | -------------- |
| **Smoke**      | `@smoke`      | Critical path only (sign in, send a payment)                                      | Every push / PR / manual           | ✅ Implemented |
| **Regression** | `@regression` | Full functional coverage (contacts, notifications, bank accounts, negative cases) | Nightly (cron) / manual            | ⬜ Roadmap     |
| **API**        | `@api`        | `cy.request()` against RWA's REST endpoints, no UI                                | Every push, in parallel with smoke | ⬜ Roadmap     |

Suite selection uses [`@cypress/grep`](https://github.com/cypress-io/cypress-grep) — tags live on the `describe`/`it` block itself (`{ tags: '@smoke' }`), run with `cypress run --env grepTags=@smoke`. See [ADR 0003](docs/adr/0003-deterministic-seed-and-tagging-strategy.md).

### Playwright, against automationexercise.com

| Suite         | Tag              | Scope                                                                                                                                                                                                                                        | Files                                                                      | Status         |
| ------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------- |
| **UI smoke**  | `@smoke`         | Account lifecycle (register, logout, log back in, delete) and cart/checkout (add product, checkout, pay, order confirmation)                                                                                                                | `playwright/tests/automationexercise/account.spec.ts`, `checkout.spec.ts`   | ✅ Implemented |
| **API smoke** | `@smoke` `@api`  | The 14 documented scenarios on `/api_list`: products/brands list + wrong-verb rejections, search with/without param, login verify (valid, invalid, missing param, wrong verb), full create-verify-read-update-delete account chain          | `playwright/tests/automationexercise/api.spec.ts`                           | ✅ Implemented |

Tags live in the test title (`test.describe("... @smoke")`), same convention as the RWA Playwright suite (see [MIGRATION.md](MIGRATION.md)) — run with `npm run pw:test:ae:smoke` / `npm run pw:test:ae:api`, or `--grep` directly.

---

## 🏗️ Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                     cypress-ticket-to-report Pipeline                 │
│                                                                        │
│   ┌──────────────┐     ┌────────────────────┐     ┌────────────────┐ │
│   │  Jira Ticket │────▶│ Cypress TS specs    │────▶│ cypress-realworld│ │
│   │  (tickets/)  │     │ + App Actions       │     │ -app (Docker)   │ │
│   └──────────────┘     │ (@smoke/@regression/│     └────────┬────────┘ │
│                        │  @api tags)         │              │          │
│                        └──────────┬──────────┘              │          │
│                                   │                          │          │
│   ┌──────────────┐     ┌─────────▼─────────┐     ┌──────────▼───────┐ │
│   │ Slack alert  │◀────│ Mochawesome       │◀────│  K8s Job / CI/CD  │ │
│   │ (on failure) │     │ (GitHub Pages)    │     │ (GitHub Actions)  │ │
│   └──────────────┘     └───────────────────┘     └───────────────────┘ │
│                                                                        │
│   🐳 Dockerized (SUT + runner) — orchestrated on Kubernetes           │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 📓 Architecture Decision Records

Non-trivial choices are written down as ADRs rather than left implicit in the code — see [`docs/adr/`](docs/adr/):

| ADR                                                              | Decision                                                                                                                                      |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [0001](docs/adr/0001-app-actions-vs-page-objects.md)             | App Actions over classic Page Objects, and why                                                                                                |
| [0002](docs/adr/0002-rwa-as-sut-custom-docker-image.md)          | RWA as SUT via a custom Docker image + submodule, and the `localhost`-hardcoded-API discovery that shaped the Docker Compose network topology |
| [0003](docs/adr/0003-deterministic-seed-and-tagging-strategy.md) | Deterministic seed data via RWA's `/testData/*` backdoor, and `@cypress/grep` tagging                                                         |

---

## 📁 Repository structure

```
cypress-ticket-to-report/
├── cypress/
│   ├── e2e/
│   │   ├── smoke/           # @smoke — critical path
│   │   ├── regression/      # @regression (roadmap)
│   │   └── api/              # @api (roadmap)
│   ├── support/
│   │   ├── app-actions/      # auth.actions.ts, transaction.actions.ts, db.actions.ts
│   │   ├── commands.ts       # getByTestId / getByTestIdLike
│   │   ├── e2e.ts
│   │   └── types.ts
│   └── screenshots/, videos/  # gitignored, on failure only
├── playwright/                 # Migration target — see MIGRATION.md
│   ├── tests/
│   │   ├── login.spec.ts       # RWA, JIRA-101, @smoke
│   │   └── automationexercise/ # second SUT, Playwright-only — account.spec.ts, checkout.spec.ts, api.spec.ts (@smoke)
│   ├── pages/
│   │   ├── login.page.ts       # RWA Page Object Model
│   │   └── automationexercise/ # login/signup, account-info, nav, products, cart, checkout, payment
│   ├── fixtures/
│   │   ├── api.ts               # RWA — test.extend, replaces App Actions
│   │   └── automationexercise/ # api.ts (14 documented REST scenarios), test-data.ts, types.ts
│   └── features/                # Gherkin mirror, documentation only (both SUTs)
├── vendor/
│   └── cypress-realworld-app/ # SUT, git submodule (pinned commit)
├── docker/
│   ├── rwa.Dockerfile         # builds the SUT (RWA ships none)
│   └── rwa-entrypoint.sh
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   └── SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md  # v2 spec, migration brief
├── tickets/                    # Simulated Jira ticket(s) for traceability
├── k8s/                        # Kubernetes Job manifests (pending RWA update)
├── .github/workflows/          # GitHub Actions pipelines (pending RWA update)
├── Dockerfile                  # Cypress test-runner image
├── docker-compose.yml          # rwa + cypress services
├── cypress.config.ts
├── playwright.config.ts
├── MIGRATION.md                # Cypress → Playwright comparison, scenario by scenario
├── tsconfig.json
└── eslint.config.mjs
```

---

## 🚀 Running locally

```bash
git clone --recurse-submodules git@github.com:kallitests/cypress-ticket-to-report.git
cd cypress-ticket-to-report
npm install

npm run sut:up            # docker compose up -d --build rwa
npm run sut:wait           # waits for the SUT to be ready (seeded + serving)

npm run cy:open            # interactive mode
npm run test:smoke         # headless smoke suite

npx playwright install --with-deps chromium   # once, after npm install
npm run pw:test:rwa:smoke  # Playwright equivalent against RWA, headless
```

Already cloned without submodules? Run `git submodule update --init` first.

The automationexercise.com suite needs none of the above — no submodule, no Docker, no local SUT to boot:

```bash
npm install
npx playwright install --with-deps chromium   # once, after npm install

npm run pw:test:ae:smoke   # UI smoke: account lifecycle + cart/checkout
npm run pw:test:ae:api     # API smoke: the 14 documented /api_list scenarios
npm run pw:test:ae         # both, full automationexercise-chromium project
```

---

## 🐳 Running with Docker

```bash
docker compose up --build          # boots the SUT, then runs the smoke suite
# or target another suite directly:
docker compose run --rm cypress npx cypress run --env grepTags=@regression
```

See [ADR 0002](docs/adr/0002-rwa-as-sut-custom-docker-image.md) for why the `cypress` service uses `network_mode: "service:rwa"` instead of a regular bridge network.

---

## 📦 Building & pushing the Docker image (GitHub Container Registry)

The `.github/workflows/docker-build.yml` workflow builds the image from the `Dockerfile` (the Cypress test-runner, pinned to the same `cypress` version as `package.json`) and pushes it to **GitHub Container Registry (GHCR)** on every push to `main` that touches the Cypress code, or on manual trigger.

| Detail        | Value                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Image path    | `ghcr.io/<owner>/<repo>` (all lowercase — GHCR requires it; `github.repository` is used automatically) |
| Tags produced | `latest` and the short commit SHA                                                                      |
| Auth          | No extra secret needed — uses the built-in `GITHUB_TOKEN` with `packages: write` permission            |

**Before it can push successfully**, make sure:

- the repository's package visibility allows it (Settings → Actions → General → Workflow permissions → "Read and write permissions")
- the image name in `k8s/test-job-smoke.yaml` / `k8s/test-job-regression.yaml` matches your actual `ghcr.io/<owner>/<repo>:latest` path (replace the `OWNER` placeholder)

---

## ☸️ Running on Kubernetes (Kind / minikube)

```bash
kind create cluster
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/test-job-smoke.yaml
kubectl logs -f job/cypress-smoke-tests -n qa-poc
```

> ⚠️ The manifests under `k8s/` still reference the pre-pivot setup and haven't been updated for RWA yet (tracked in the roadmap below) — they need a Job for the SUT image alongside the existing Cypress runner Job before this works again.
>
> Note: Kind/minikube run locally and cannot pull a **private** GHCR image without an `imagePullSecret`. For the Loom demo, either make the package public (Package settings → Change visibility) or add a pull secret referencing a GHCR personal access token.

---

## 🚨 Alerting & Reporting

| Feature       | Details                                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slack**     | Configure the `SLACK_WEBHOOK_URL` repository secret to receive a notification on test failure _(webhook call not yet re-wired into a workflow since the RWA pivot — roadmap)_                                 |
| **Reporting** | Mochawesome HTML report generated on every run (`cypress-mochawesome-reporter`), to be uploaded as a GitHub Actions artifact and published to GitHub Pages on the nightly regression run _(workflow pending)_ |

---

## 📌 Roadmap

**Immediate (this POC):**

- [ ] `@regression` suite (contacts, notifications, bank accounts, negative cases) + `@api` suite (`cy.request()` + schema validation)
- [ ] Rewrite `.github/workflows/` as `pr-smoke.yml` (smoke + api, on push/PR) and `nightly-regression.yml` (regression, nightly cron + manual, Mochawesome → GitHub Pages, Slack on failure, auto-filed GitHub issue on nightly failure)
- [ ] `cypress-axe` accessibility checks on sign-in and dashboard
- [ ] `docs/user-stories/`, `docs/3-amigos-notes.md`, `docs/test-plan.md`, `docs/coverage-matrix.md`
- [ ] Minimal Postman/Bruno collection alongside the Cypress API tests
- [ ] `CONTRIBUTING.md`, `CODEOWNERS`, PR template
- [ ] Update `k8s/` manifests for the RWA-based setup
- [ ] README "Compétences démontrées" section mapping each item to a file/folder

**Cypress → Playwright migration** (see [MIGRATION.md](MIGRATION.md) and the [v2 spec](docs/SPEC-POC-SMOKE-TESTS-CICD-PLAYWRIGHT-MCP.md)):

- [x] V2: Playwright socle in parallel — sign-in scenario rewritten in Playwright/TypeScript, POM, `test.extend` fixtures, `MIGRATION.md` started
- [ ] V2: migrate the payment smoke scenario
- [ ] V3: Playwright CLI — `codegen` + `init-agents` on a new, uncovered scenario
- [ ] V4: Playwright MCP session (`@playwright/mcp` + Claude Code), test candidate reviewed and committed, documented in `mcp-sessions/MCP-SESSION.md`
- [ ] V5: both suites wired into the same CI workflow, Kubernetes manifests updated, GitHub Pages publishing the Playwright HTML Report, progressive switch-over to Playwright-only
- [ ] V6 (optional): real Jira Cloud + Xray integration, replacing `tickets/ticket-101.json`

**Later:**

- [ ] Add cross-browser execution (BrowserStack / Sauce Labs real device cloud)
- [ ] Add a lightweight load-testing scenario (k6 or Artillery) as a complementary pipeline stage

⭐ Star this repo to follow the progress.

---

_Built with 🧪 Cypress · 🎭 Playwright · 🟦 TypeScript · 🐳 Docker · ☸️ Kubernetes · ⚙️ GitHub Actions_
