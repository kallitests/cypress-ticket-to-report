# Spec Fonctionnelle & Technique — POC "Smoke Tests & Non-Régression : du ticket Jira au reporting"

**Auteur :** Khalid HAFID-MEDHEB
**Type de document :** Spécification fonctionnelle et technique (POC / Showroom)
**Statut :** Draft v1

---

## 1. Contexte & objectif du POC

### 1.1 Pourquoi ce POC ?

Ce POC n'est pas un projet client : c'est un **showroom technique**, conçu pour être montré à un recruteur ou un client final sous forme de **vidéo Loom**, avec un **repository GitHub forkable**. L'objectif est de démontrer, en conditions réelles et en live, la maîtrise de bout en bout d'un pipeline de test automatisé moderne — plutôt que de l'affirmer sur un CV.

### 1.2 Ce que le POC doit prouver

| Compétence démontrée | Preuve concrète dans le POC |
|---|---|
| Rédaction de scénarios de test à partir d'un besoin métier | Ticket Jira (ou équivalent) → scénario Gherkin |
| Automatisation Cypress (E2E, API) | Smoke tests + tests de non-régression exécutables |
| Intégration continue | Pipeline GitHub Actions déclenché sur push/PR |
| Conteneurisation | Image Docker de l'environnement de test |
| Orchestration | Déploiement/exécution des tests via Kubernetes (Kind/minikube) |
| Alerting temps réel | Notification Slack en cas d'échec |
| Reporting qualité | Rapport HTML (Mochawesome/Allure) publié automatiquement |
| Traçabilité exigences ↔ tests | Lien ticket Jira ↔ scénario ↔ résultat d'exécution |

### 1.3 Format de démonstration (Loom)

Le recruteur doit pouvoir, en **moins de 5 minutes** :
1. Voir un ticket Jira avec un besoin fonctionnel.
2. Voir le scénario Gherkin correspondant, écrit à la main.
3. Déclencher (ou voir déclenché) le pipeline GitHub Actions.
4. Voir les tests s'exécuter dans un conteneur Docker/K8s.
5. Recevoir une alerte Slack en cas d'échec simulé.
6. Consulter le rapport de test généré automatiquement.

---

## 2. Périmètre fonctionnel

### 2.1 In scope

| Élément | Détail |
|---|---|
| Application sous test (UI) | Application de démonstration simple (ex. TodoMVC), déployée en local via Docker |
| Application sous test (API) | Mock API REST (json-server ou équivalent) exposant des endpoints CRUD |
| Types de tests couverts | Smoke tests (parcours critiques) + Tests de non-régression (fonctionnels) |
| Couche testée | UI (Cypress E2E) + API (Cypress `cy.request` ou Postman/Newman) |
| Traçabilité | 1 ticket Jira (ou fichier JSON simulant un ticket) ↔ 1 feature Gherkin ↔ 1 spec Cypress |
| CI/CD | GitHub Actions (déclenchement sur push/PR + planifié) |
| Conteneurisation | Dockerfile + docker-compose (app + tests) |
| Orchestration | Manifests Kubernetes (Job/CronJob) pour exécuter la suite dans un cluster local (Kind/minikube) |
| Alerting | Webhook Slack (canal dédié) sur échec de run |
| Reporting | Mochawesome (HTML) publié en artifact GitHub Actions + GitHub Pages |

### 2.2 Out of scope (POC, pas un produit)

| Élément | Justification |
|---|---|
| Intégration Jira/Xray réelle (API complète) | Nécessite une instance Jira Cloud + licence Xray ; simulé par un fichier `ticket.json` en V1, réel en V2 (optionnel) |
| Tests de charge/performance avancés | Hors périmètre du smoke/non-régression, mentionné comme évolution possible |
| Environnement Cloud managé (GKE/EKS) | Kind/minikube suffisant pour démontrer le principe d'orchestration |
| Multi-environnements (dev/staging/prod) | Un seul environnement de démo |

---

## 3. Architecture globale du pipeline

```
[Ticket Jira / ticket.json]
        │  (besoin fonctionnel + critères d'acceptation)
        ▼
[Scénario Gherkin] (.feature — Given/When/Then)
        │
        ▼
[Automatisation Cypress] (cypress-cucumber-preprocessor)
   ├── Smoke tests (parcours critiques)
   └── Tests de non-régression
        │
        ▼
[Conteneurisation Docker] (image de test + app sous test)
        │
        ▼
[Orchestration Kubernetes] (Job K8s exécutant le conteneur de test)
        │
        ▼
[CI/CD GitHub Actions] (déclenchement push/PR + planifié, build image, run K8s Job)
        │
        ├──► [Alerting Slack] (si échec : résumé + lien vers le run)
        │
        ▼
[Reporting] (Mochawesome → artifact + publication GitHub Pages)
        │
        ▼
[Traçabilité] (lien retour vers le ticket Jira/ticket.json dans le rapport)
```

---

## 4. Spec fonctionnelle détaillée

### 4.1 Étape 1 — Ticket & besoin fonctionnel

| Champ | Contenu |
|---|---|
| Source | Jira (ou `ticket.json` simulé si pas d'instance Jira disponible) |
| Exemple de user story | "En tant qu'utilisateur, je veux ajouter une tâche dans ma to-do list pour la retrouver plus tard." |
| Critères d'acceptation | La tâche apparaît dans la liste ; le compteur de tâches est incrémenté ; la tâche est persistée après rafraîchissement |
| Priorité | Critique (smoke test) |

### 4.2 Étape 2 — Scénario Gherkin

```gherkin
Feature: Gestion des tâches (Todo)

  Scenario: Ajout d'une nouvelle tâche
    Given l'utilisateur est sur la page d'accueil de l'application
    When il saisit "Préparer la démo Cypress" dans le champ de saisie
    And il valide l'ajout de la tâche
    Then la tâche "Préparer la démo Cypress" apparaît dans la liste
    And le compteur de tâches actives est incrémenté de 1
```

| Champ | Détail |
|---|---|
| Fichier | `cypress/e2e/features/todo-add.feature` |
| Type de test | Smoke test |
| Lien traçabilité | `JIRA-101` (référencé en commentaire dans le fichier `.feature`) |

### 4.3 Étape 3 — Automatisation Cypress

| Élément | Détail |
|---|---|
| Step definitions | `cypress/e2e/step_definitions/todo-add.steps.js` |
| Preprocessor | `@badeball/cypress-cucumber-preprocessor` |
| Type de sélecteurs | `data-cy` (bonnes pratiques Cypress, indépendant du DOM/CSS) |
| Tests API associés | Vérification en parallèle via `cy.request()` sur l'endpoint `POST /todos` du mock API |
| Suite de non-régression | Regroupe tous les scénarios `@regression` (tag Gherkin) exécutés à chaque run planifié (nightly) |
| Suite de smoke tests | Regroupe les scénarios `@smoke` exécutés à chaque push/PR (rapide, sous-ensemble critique) |

### 4.4 Étape 4 — Exécution & CI/CD

| Déclencheur | Suite exécutée | Fréquence |
|---|---|---|
| `push` / `pull_request` sur `main` | Smoke tests (`@smoke`) | À chaque commit |
| `schedule` (cron GitHub Actions) | Suite complète (`@regression`) | Nightly (ex. 2h du matin) |
| `workflow_dispatch` | Suite au choix | Déclenchement manuel (démo live) |

### 4.5 Étape 5 — Alerting

| Condition | Canal | Contenu du message |
|---|---|---|
| Échec d'un ou plusieurs tests | Slack (webhook) | Nom du run, nombre de tests échoués, lien direct vers le rapport et vers le run GitHub Actions |
| Succès | Aucune notification | Éviter le bruit (bonne pratique) |

### 4.6 Étape 6 — Reporting

| Outil | Rôle |
|---|---|
| Mochawesome | Génération du rapport HTML détaillé (statuts, captures d'écran des échecs) |
| GitHub Actions artifact | Stockage du rapport à chaque run |
| GitHub Pages | Publication du dernier rapport en ligne (URL stable, consultable par le recruteur) |
| (Optionnel V2) Xray/Jira | Remontée des résultats dans le ticket Jira d'origine pour boucler la traçabilité |

---

## 5. Spec technique

### 5.1 Stack technique retenue

| Composant | Choix | Justification |
|---|---|---|
| Application UI de démo | TodoMVC (ou équivalent React/Vue léger) | Open-source, simple, rapide à conteneuriser |
| Mock API | `json-server` | Zéro backend à coder, endpoints REST CRUD instantanés |
| Framework de test | Cypress + `cypress-cucumber-preprocessor` | Cœur de compétence à démontrer (BDD/Gherkin + E2E) |
| CI/CD | GitHub Actions | Gratuit, standard du marché, YAML lisible pour le recruteur |
| Conteneurisation | Docker + docker-compose | Reproductibilité de l'environnement de test |
| Orchestration | Kubernetes (Kind ou minikube) | Démontre la capacité à exécuter les tests "à l'échelle" |
| Alerting | Slack Incoming Webhook | Configuration rapide, gratuite |
| Reporting | Mochawesome + GitHub Pages | Rapport visuel, hébergé gratuitement, lien partageable |
| Traçabilité | `ticket.json` (V1) / Jira Cloud + Xray (V2 optionnel) | V1 sans dépendance externe payante |

### 5.2 Structure du repository

```
poc-smoke-tests-cicd/
├── app/                        # Application sous test (TodoMVC + json-server)
│   ├── Dockerfile
│   └── docker-compose.yml
├── cypress/
│   ├── e2e/
│   │   ├── features/           # Fichiers .feature (Gherkin)
│   │   └── step_definitions/   # Steps Cypress
│   ├── fixtures/                # Jeux de données de test
│   └── support/
├── reports/                     # Rapports Mochawesome générés (gitignored, publiés en artifact)
├── k8s/
│   ├── test-job.yaml            # Job Kubernetes exécutant la suite de tests
│   └── namespace.yaml
├── tickets/
│   └── ticket-101.json          # Simulation du ticket Jira (V1)
├── .github/
│   └── workflows/
│       ├── smoke.yml            # Workflow smoke tests (push/PR)
│       └── regression.yml       # Workflow non-régression (nightly + manuel)
├── cypress.config.js
├── package.json
└── README.md                    # Présentation du POC + lien vidéo Loom
```

### 5.3 Pipeline GitHub Actions — étapes détaillées

| # | Étape | Action |
|---|---|---|
| 1 | Checkout du code | `actions/checkout@v4` |
| 2 | Setup Node.js | `actions/setup-node@v4` |
| 3 | Build de l'image Docker (app + tests) | `docker build` |
| 4 | Déploiement dans le cluster Kind/minikube | `kind create cluster` + `kubectl apply -f k8s/` |
| 5 | Exécution des tests Cypress | Job Kubernetes ou `cypress-io/github-action` (selon la démo souhaitée) |
| 6 | Génération du rapport Mochawesome | `mochawesome-merge` + `marge` |
| 7 | Publication du rapport | Upload artifact + déploiement sur GitHub Pages |
| 8 | Notification Slack (si échec) | `slackapi/slack-github-action` |

### 5.4 Manifest Kubernetes (principe)

| Ressource | Rôle |
|---|---|
| `Namespace` | Isoler l'environnement de test (`qa-poc`) |
| `Job` | Exécuter le conteneur Cypress une seule fois par run et se terminer (adapté au CI, contrairement à un `Deployment`) |
| `ConfigMap` (optionnel) | Injecter la configuration Cypress (base URL, variables d'environnement) |
| `Secret` (optionnel) | Stocker le webhook Slack de façon sécurisée |

---

## 6. Roadmap de réalisation

| Phase | Contenu | Objectif |
|---|---|---|
| **V0 — Socle local** | App TodoMVC + json-server en Docker Compose, 1 scénario Gherkin, tests Cypress qui passent en local | Valider la chaîne de bout en bout sans CI/CD |
| **V1 — CI/CD** | Ajout GitHub Actions (smoke + regression), reporting Mochawesome, alerting Slack | POC "démontrable" en Loom |
| **V2 — Orchestration** | Ajout Kubernetes (Kind), Job de test, publication GitHub Pages | Démontrer la scalabilité/l'industrialisation |
| **V3 — Traçabilité avancée (optionnel)** | Intégration Jira Cloud + Xray réelle | Aller plus loin si le temps le permet, non bloquant pour le showroom |

---

## 7. Script de démonstration Loom (storyboard)

| Minute | Séquence | Message clé pour le recruteur |
|---|---|---|
| 0:00–0:30 | Présentation du contexte : "Voici un ticket Jira type" | Comprendre le besoin métier avant d'écrire du code |
| 0:30–1:00 | Affichage du fichier `.feature` (Gherkin) | Traduction directe du besoin en scénario testable, lisible par un non-technique |
| 1:00–2:00 | Déclenchement du workflow GitHub Actions (`workflow_dispatch`) | Pipeline CI/CD reproductible en un clic |
| 2:00–3:00 | Vue sur l'exécution du Job Kubernetes en direct (logs) | Maîtrise Docker/K8s, pas juste "j'ai lu la doc" |
| 3:00–3:30 | Simulation d'un échec de test → notification Slack en direct | Alerting temps réel opérationnel |
| 3:30–4:30 | Ouverture du rapport Mochawesome publié sur GitHub Pages | Reporting qualité exploitable par un PM/PO non technique |
| 4:30–5:00 | Conclusion : "Le repo est public, forkable, avec le README" | Invitation à vérifier par soi-même — crédibilité maximale |

---

## 8. Critères de succès du POC

| Critère | Mesure |
|---|---|
| Reproductibilité | Un tiers peut forker le repo et faire tourner le pipeline sans configuration manuelle complexe |
| Lisibilité | Un recruteur non technique comprend le scénario Gherkin et le rapport final |
| Bout en bout réel | Aucune étape "mockée en façade" — le pipeline s'exécute réellement (pas de captures d'écran statiques) |
| Durée de démo | ≤ 5 minutes en vidéo Loom |
| Différenciation | Mise en avant explicite de la chaîne complète (Jira → Gherkin → Cypress → Docker → K8s → Alerting → Reporting), rarement démontrée en un seul repo par les profils concurrents |

---

*Document destiné à cadrer la réalisation technique du POC avant développement. Les choix d'outils (TodoMVC, json-server, Kind) sont volontairement légers pour prioriser la vitesse de mise en œuvre et la lisibilité de la démonstration plutôt que la complexité applicative.*
