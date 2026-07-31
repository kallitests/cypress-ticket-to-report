# 🧪 cypress-ticket-to-report

> **End-to-end QA automation showroom, 100% Cypress.**
> From a Jira ticket to Gherkin BDD scenarios, UI/API smoke & regression tests, Dockerized execution, Kubernetes orchestration, GitHub Actions CI/CD, Slack alerting and Mochawesome reporting.

[![Status](https://img.shields.io/badge/status-POC-orange?style=flat-square)]()
[![Cypress](https://img.shields.io/badge/Cypress-e2e-17202C?style=flat-square&logo=cypress)](https://www.cypress.io)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-orchestration-326CE5?style=flat-square&logo=kubernetes)](https://kubernetes.io)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions)](https://github.com/features/actions)
[![Mochawesome](https://img.shields.io/badge/Reporting-Mochawesome-8A2BE2?style=flat-square)]()

---

## 🗺️ Table of Contents

- [Why this repo?](#-why-this-repo)
- [Test targets](#-test-targets)
- [Test suites](#-test-suites)
- [Architecture](#%EF%B8%8F-architecture)
- [Repository structure](#-repository-structure)
- [Running locally](#-running-locally)
- [Running with Docker](#-running-with-docker)
- [Building & pushing the Docker image](#-building--pushing-the-docker-image-github-container-registry)
- [Running on Kubernetes](#%EF%B8%8F-running-on-kubernetes-kind--minikube)
- [Alerting & Reporting](#-alerting--reporting)
- [Roadmap](#-roadmap)

---

## 💡 Why this repo?

This is not a client project — it's a **live showroom**. Anyone can fork this repository, run the pipeline, and see for themselves how a functional need (a Jira ticket) turns into a published, automated quality report.

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

**Loom demo:** _[link to be added]_

---

## 🎯 Test targets

| Layer | Target | Why |
|---|---|---|
| **UI** | [saucedemo.com](https://www.saucedemo.com) (Sauce Labs demo e-commerce app "Swag Labs") | Public, stable, built with `data-test` attributes — ideal for reliable Cypress selectors |
| **API** | [reqres.in](https://reqres.in) | Public REST sandbox with realistic CRUD endpoints, no auth required |

> Both are third-party public demo services. Selectors and endpoints are verified as of this writing but should be re-checked if either service changes its markup or contract.

---

## 🧪 Test suites

| Suite | Tag | Scope | Trigger |
|---|---|---|---|
| **Smoke** | `@smoke` | Critical path only (login → checkout, API health check) | Every push / PR / manual |
| **Regression** | `@regression` | Full functional coverage (sorting, cart, negative login, API CRUD) | Nightly (cron) / manual |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    cypress-ticket-to-report Pipeline                │
│                                                                     │
│   ┌──────────────┐     ┌───────────────┐     ┌──────────────────┐  │
│   │  Jira Ticket │────▶│ Gherkin (.feature)│─▶│ Cypress UI + API │  │
│   │  (tickets/)  │     │  BDD scenarios │     │ (smoke/regression)│  │
│   └──────────────┘     └───────────────┘     └────────┬─────────┘  │
│                                                        │            │
│   ┌──────────────┐     ┌───────────────┐     ┌────────▼─────────┐  │
│   │ Slack alert  │◀────│ Mochawesome   │◀────│  K8s Job / CI/CD │  │
│   │ (on failure) │     │ (GitHub Pages)│     │ (GitHub Actions) │  │
│   └──────────────┘     └───────────────┘     └──────────────────┘  │
│                                                                     │
│   🐳 Dockerized — orchestrated on Kubernetes (Kind / minikube)     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository structure

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
├── k8s/                           # Kubernetes Job manifests
├── .github/workflows/             # GitHub Actions pipelines
├── Dockerfile
├── docker-compose.yml
└── cypress.config.js
```

---

## 🚀 Running locally

```bash
npm install
npm run cy:open          # interactive mode
npm run test:smoke       # headless smoke suite
npm run test:regression  # headless regression suite
```

---

## 🐳 Running with Docker

```bash
docker compose up --build cypress-smoke
docker compose up --build cypress-regression
```

---

## 📦 Building & pushing the Docker image (GitHub Container Registry)

The `.github/workflows/docker-build.yml` workflow builds the image from the `Dockerfile` and pushes it to **GitHub Container Registry (GHCR)** on every push to `main` that touches the Cypress code, or on manual trigger.

| Detail | Value |
|---|---|
| Image path | `ghcr.io/<owner>/<repo>` (all lowercase — GHCR requires it; `github.repository` is used automatically) |
| Tags produced | `latest` and the short commit SHA |
| Auth | No extra secret needed — uses the built-in `GITHUB_TOKEN` with `packages: write` permission |

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

> Note: Kind/minikube run locally and cannot pull a **private** GHCR image without an `imagePullSecret`. For the Loom demo, either make the package public (Package settings → Change visibility) or add a pull secret referencing a GHCR personal access token.

---

## 🚨 Alerting & Reporting

| Feature | Details |
|---|---|
| **Slack** | Configure the `SLACK_WEBHOOK_URL` repository secret to receive a notification on test failure |
| **Reporting** | Mochawesome HTML report generated on every run, uploaded as a GitHub Actions artifact, and published to GitHub Pages on the nightly regression run |

---

## 📌 Roadmap

- [ ] V2: replace `tickets/ticket-101.json` with a real Jira Cloud + Xray integration (REST API)
- [ ] V2: add cross-browser execution (BrowserStack / Sauce Labs real device cloud)
- [ ] V3: add a lightweight load-testing scenario (k6 or Artillery) as a complementary pipeline stage

⭐ Star this repo to follow the progress.

---

*Built with 🧪 Cypress · 🐳 Docker · ☸️ Kubernetes · ⚙️ GitHub Actions*
