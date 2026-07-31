# Récapitulatif — POC "cypress-ticket-to-report"

| Rubrique | Détail |
|---|---|
| **Nom du repo** | `cypress-ticket-to-report` |
| **Description (GitHub About)** | End-to-end QA automation showroom, 100% Cypress: from a Jira ticket to Gherkin BDD scenarios, UI/API smoke & regression tests, Dockerized execution, Kubernetes orchestration, GitHub Actions CI/CD, Slack alerting and Mochawesome reporting — fully forkable and runnable live. |
| **Pourquoi ce POC** | Ce n'est pas un projet client : c'est un **showroom** destiné à être montré en live (vidéo Loom + repo forkable) pour prouver une compétence rarement démontrée en un seul repo : la chaîne complète **ticket Jira → Gherkin → Cypress → Docker → Kubernetes → CI/CD GitHub Actions → Alerting Slack → Reporting Mochawesome**, avec traçabilité vers le ticket d'origine. |
| **Stack retenue (100% Cypress)** | Selenium/Karate volontairement écartés du POC pour ne pas mélanger les outils d'automatisation |
| **Target UI** | [saucedemo.com](https://www.saucedemo.com) — app de démo officielle Sauce Labs ("Swag Labs"), attributs `data-test` natifs → sélecteurs Cypress stables |
| **Target API** | [reqres.in](https://reqres.in) — sandbox REST publique, sans auth, endpoints CRUD réalistes |
| **Traçabilité Jira** | Simulée en V1 via `tickets/ticket-101.json` (pas de dépendance à une instance Jira réelle) ; intégration Jira/Xray réelle proposée en V2 optionnelle, non bloquante |
| **Scénarios Gherkin livrés (6, en anglais)** | Smoke UI (login + achat complet jusqu'à confirmation) · Regression UI (tri produits asc/desc, suppression panier, cas négatif `locked_out_user`) · Smoke API (health check `GET /users/2`) · Regression API (CRUD complet `POST`/`PUT`/`DELETE`) |
| **Fichiers de config Cypress** | `cypress.config.js` (cucumber-preprocessor + reporter Mochawesome) |
| **Conteneurisation** | `Dockerfile` basé sur l'image officielle `cypress/included` |
| **Orchestration Kubernetes** | 2 Jobs (`k8s/test-job-smoke.yaml`, `k8s/test-job-regression.yaml`), pensés pour Kind/minikube en local (suffisant pour démontrer l'orchestration, pas besoin de cloud managé) |
| **Pipeline CI/CD — `smoke.yml`** | Déclenché sur push/PR + manuel ; exécute la suite `@smoke` |
| **Pipeline CI/CD — `regression.yml`** | Déclenché en nightly (cron) + manuel ; exécute la suite `@regression` ; publie le rapport sur GitHub Pages |
| **Pipeline CI/CD — `docker-build.yml`** | Déclenché sur push `main` (si Dockerfile/package.json/cypress changent) + manuel ; build et push l'image sur **GHCR** avec tags `latest` + SHA court ; utilise le `GITHUB_TOKEN` intégré (aucun secret à créer pour cette étape) |
| **Alerting** | Slack, uniquement en cas d'échec (pas de bruit sur succès), via secret `SLACK_WEBHOOK_URL` |
| **Reporting** | Mochawesome (HTML) → artifact GitHub Actions + publication GitHub Pages sur le run nightly |
| **Validation effectuée** | Syntaxe JS validée avec esbuild, JSON et YAML validés — aucune erreur bloquante |
| **✅ Actions restantes avant de pousser sur GitHub** | 1) Remplacer `OWNER` par le vrai owner GitHub dans `k8s/test-job-smoke.yaml` et `test-job-regression.yaml` · 2) Ajouter le secret `SLACK_WEBHOOK_URL` dans les settings du repo · 3) Activer "Read and write permissions" (Settings → Actions → General) · 4) Rendre le package GHCR public après le premier build (sinon nécessite un `imagePullSecret` pour Kind/minikube en local) |
| **Prochaine étape proposée (non réalisée)** | Un workflow d'orchestration global `deploy-and-test.yml` : build l'image → déploie le Job K8s dans Kind directement depuis GitHub Actions → récupère les logs — pour que la démo Loom montre tout en un seul déclenchement |
