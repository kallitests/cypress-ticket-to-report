# cypress-ticket-to-report

> End-to-end QA automation showroom, 100% Cypress: from a Jira ticket to Gherkin BDD scenarios, UI/API smoke & regression tests, Dockerized execution, Kubernetes orchestration, GitHub Actions CI/CD, Slack alerting and Mochawesome reporting — fully forkable and runnable live.

## POC — Smoke Tests & Non-Regression: from Jira Ticket to Reporting

**Showroom repository** demonstrating an end-to-end automated test pipeline, 100% Cypress, from a functional need (Jira ticket) to a published quality report — including Gherkin scenarios, CI/CD, containerization, orchestration and real-time alerting.

**Loom demo:** _[link to be added]_

---

## Why this repo?

This is not a client project — it's a **live showroom**. Anyone can fork this repository, run the pipeline, and see for themselves:

```
Jira ticket (tickets/ticket-101.json)
        │
        ▼
Gherkin scenario (.feature)
        │
        ▼
Cypress automation (UI + API)
        │
        ▼
Docker image (cypress/included)
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

## Test targets

| Layer | Target | Why |
|---|---|---|
| UI | [saucedemo.com](https://www.saucedemo.com) (Sauce Labs demo e-commerce app "Swag Labs") | Public, stable, built with `data-test` attributes — ideal for reliable Cypress selectors |
| API | [reqres.in](https://reqres.in) | Public REST sandbox with realistic CRUD endpoints, no auth required |

> Both are third-party public demo services. Selectors and endpoints are verified as of this writing but should be re-checked if either service changes its markup or contract.

## Test suites

| Suite | Tag | Scope | Trigger |
|---|---|---|---|
| Smoke | `@smoke` | Critical path only (login → checkout, API health check) | Every push / PR / manual |
| Regression | `@regression` | Full functional coverage (sorting, cart, negative login, API CRUD) | Nightly (cron) / manual |

## Repository structure

```
poc-smoke-tests-cicd/
├── cypress/
│   ├── e2e/
│   │   ├── features/
│   │   │   ├── smoke/            # UI smoke scenarios
│   │   │   ├── regression/       # UI regression scenarios
│   │   │   └── api/
│   │   │       ├── smoke/        # API smoke scenarios
│   │   │       └── regression/   # API regression scenarios
│   │   └── step_definitions/
│   │       ├── ui/
│   │       └── api/
│   ├── fixtures/
│   └── support/
├── tickets/                       # Simulated Jira ticket(s) for traceability
├── k8s/                            # Kubernetes Job manifests
├── .github/workflows/              # GitHub Actions pipelines
├── Dockerfile
├── docker-compose.yml
└── cypress.config.js
```

## Running locally

```bash
npm install
npm run cy:open          # interactive mode
npm run test:smoke       # headless smoke suite
npm run test:regression  # headless regression suite
```

## Running with Docker

```bash
docker compose up --build cypress-smoke
docker compose up --build cypress-regression
```

## Building & pushing the Docker image (GitHub Container Registry)

The `.github/workflows/docker-build.yml` workflow builds the image from the `Dockerfile` and pushes it to **GitHub Container Registry (GHCR)** on every push to `main` that touches the Cypress code, or on manual trigger.

- Image path: `ghcr.io/<owner>/<repo>` (all lowercase — GHCR requires it; `github.repository` is used automatically)
- Tags produced: `latest` and the short commit SHA
- No extra secret needed — it uses the built-in `GITHUB_TOKEN` with `packages: write` permission

**Before it can push successfully**, make sure the repository's package visibility allows it (Settings → Actions → General → Workflow permissions → "Read and write permissions"), and that the image name in `k8s/test-job-smoke.yaml` / `k8s/test-job-regression.yaml` matches your actual `ghcr.io/<owner>/<repo>:latest` path (replace the `OWNER` placeholder).

## Running on Kubernetes (Kind / minikube)

```bash
kind create cluster
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/test-job-smoke.yaml
kubectl logs -f job/cypress-smoke-tests -n qa-poc
```

> Note: Kind/minikube run locally and cannot pull a **private** GHCR image without an `imagePullSecret`. For the Loom demo, either make the package public (Package settings → Change visibility) or add a pull secret referencing a GHCR personal access token.

## Alerting & Reporting

- **Slack**: configure the `SLACK_WEBHOOK_URL` repository secret to receive a notification on test failure.
- **Reporting**: Mochawesome HTML report is generated on every run, uploaded as a GitHub Actions artifact, and published to GitHub Pages on the nightly regression run.

## Roadmap

- [ ] V2: replace `tickets/ticket-101.json` with a real Jira Cloud + Xray integration (REST API)
- [ ] V2: add cross-browser execution (BrowserStack / Sauce Labs real device cloud)
- [ ] V3: add a lightweight load-testing scenario (k6 or Artillery) as a complementary pipeline stage
