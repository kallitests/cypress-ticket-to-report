# 🧪 cypress-ticket-to-report

> **End-to-end QA automation showroom, 100% Cypress + TypeScript.**
> From a Jira ticket to a running critical-path smoke suite, exercised against a real application (not a toy demo site), Dockerized, orchestrated on Kubernetes, wired into GitHub Actions, alerting on Slack and reporting via Mochawesome.

[![Status](https://img.shields.io/badge/status-POC%20in%20progress-orange?style=flat-square)](<>)
[![Cypress](https://img.shields.io/badge/Cypress-TypeScript-17202C?style=flat-square&logo=cypress)](https://www.cypress.io)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-orchestration-326CE5?style=flat-square&logo=kubernetes)](https://kubernetes.io)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions)](https://github.com/features/actions)
[![Mochawesome](https://img.shields.io/badge/Reporting-Mochawesome-8A2BE2?style=flat-square)](<>)

---

## 🗺️ Table of Contents

- [Why this repo?](#-why-this-repo)
- [Status — what's live vs. in progress](#-status--whats-live-vs-in-progress)
- [Test target](#-test-target)
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

See the [Roadmap](#-roadmap) for the full punch list.

---

## 🎯 Test target

| Layer        | Target                                                                                                                                                                                                  | Why                                                                                                                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI + API** | [cypress-realworld-app](https://github.com/cypress-io/cypress-realworld-app) (RWA), Cypress's own reference application for a payment app (users, contacts, transactions, notifications, bank accounts) | Real, non-trivial app with backend state — a more credible showroom than a static demo site. Vendored as a pinned git submodule (`vendor/cypress-realworld-app`), run via a Docker image this repo builds (RWA ships neither a `Dockerfile` nor a `docker-compose.yml` of its own) |

> Selectors use RWA's own `data-test` convention (not `data-cy`), verified by reading the vendored source rather than assumed. See [ADR 0002](docs/adr/0002-rwa-as-sut-custom-docker-image.md) for why the SUT needs a slightly unusual Docker network setup.

---

## 🧪 Test suites

| Suite          | Tag           | Scope                                                                             | Trigger                            | Status         |
| -------------- | ------------- | --------------------------------------------------------------------------------- | ---------------------------------- | -------------- |
| **Smoke**      | `@smoke`      | Critical path only (sign in, send a payment)                                      | Every push / PR / manual           | ✅ Implemented |
| **Regression** | `@regression` | Full functional coverage (contacts, notifications, bank accounts, negative cases) | Nightly (cron) / manual            | ⬜ Roadmap     |
| **API**        | `@api`        | `cy.request()` against RWA's REST endpoints, no UI                                | Every push, in parallel with smoke | ⬜ Roadmap     |

Suite selection uses [`@cypress/grep`](https://github.com/cypress-io/cypress-grep) — tags live on the `describe`/`it` block itself (`{ tags: '@smoke' }`), run with `cypress run --env grepTags=@smoke`. See [ADR 0003](docs/adr/0003-deterministic-seed-and-tagging-strategy.md).

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
├── vendor/
│   └── cypress-realworld-app/ # SUT, git submodule (pinned commit)
├── docker/
│   ├── rwa.Dockerfile         # builds the SUT (RWA ships none)
│   └── rwa-entrypoint.sh
├── docs/
│   └── adr/                   # Architecture Decision Records
├── tickets/                    # Simulated Jira ticket(s) for traceability
├── k8s/                        # Kubernetes Job manifests (pending RWA update)
├── .github/workflows/          # GitHub Actions pipelines (pending RWA update)
├── Dockerfile                  # Cypress test-runner image
├── docker-compose.yml          # rwa + cypress services
├── cypress.config.ts
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
```

Already cloned without submodules? Run `git submodule update --init` first.

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

**Later:**

- [ ] V2: replace `tickets/ticket-101.json` with a real Jira Cloud + Xray integration (REST API)
- [ ] V2: add cross-browser execution (BrowserStack / Sauce Labs real device cloud)
- [ ] V3: add a lightweight load-testing scenario (k6 or Artillery) as a complementary pipeline stage

⭐ Star this repo to follow the progress.

---

_Built with 🧪 Cypress · 🟦 TypeScript · 🐳 Docker · ☸️ Kubernetes · ⚙️ GitHub Actions_
