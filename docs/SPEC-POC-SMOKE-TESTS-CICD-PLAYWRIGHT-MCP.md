# Spec Fonctionnelle & Technique — POC "Smoke Tests & Non-Régression : du ticket Jira au reporting, Cypress → Playwright/MCP"

**Auteur :** Khalid HAFID-MEDHEB
**Type de document :** Spécification fonctionnelle et technique (POC / Showroom) — à utiliser comme brief d'exécution pour Claude Cowork sur le repo local `cypress-ticket-to-report`
**Statut :** Draft v2 — intègre l'axe de migration Playwright/MCP

---

## 0. Instruction d'exécution (pour Claude Cowork)

Ce document sert de brief à exécuter sur le repository local `github.com/kallitests/cypress-ticket-to-report`. L'objectif n'est plus de démontrer un pipeline Cypress isolé, mais de **documenter et outiller une migration réelle Cypress → Playwright, jusqu'à des tests entièrement générés/maintenus via Playwright MCP**, avec preuves techniques vérifiables à chaque étape (commits, README, comparatifs, traces).

Ordre de traitement suggéré : auditer l'état actuel du repo (V0/V1 Cypress existant) → construire le socle Playwright en parallèle → documenter la migration pas à pas → intégrer Playwright MCP → produire les livrables de preuve (README comparatif, vidéo Loom, traces).

---

## 1. Contexte & objectif du POC

### 1.1 Pourquoi ce POC ?

Ce POC n'est pas un projet client : c'est un **showroom technique**, conçu pour être montré à un recruteur ou un client final sous forme de **vidéo Loom**, avec un **repository GitHub forkable**. L'objectif est de démontrer, en conditions réelles et en live, la capacité à **migrer un framework de test Cypress existant vers Playwright, jusqu'à l'exploitation de l'écosystème agentique MCP** — plutôt que de l'affirmer sur un CV.

### 1.2 Ce que le POC doit prouver

| Compétence démontrée | Preuve concrète dans le POC |
|---|---|
| Rédaction de scénarios de test à partir d'un besoin métier | Ticket Jira (ou équivalent) → scénario Gherkin |
| Automatisation Cypress existante (socle de départ, historique) | Smoke tests + tests de non-régression Cypress déjà exécutables |
| **Migration Cypress → Playwright** | Suite équivalente réécrite en Playwright/TypeScript, avec mapping documenté (sélecteurs, intercepts, fixtures) |
| **Playwright CLI** | Utilisation de `codegen` et `init-agents` pour accélérer la génération de specs, documentée avec avant/après |
| **Playwright MCP** | Session MCP (serveur officiel `@playwright/mcp`) connectée à Claude Code, exploration d'une page via arbre d'accessibilité, génération d'un test candidat committé |
| Intégration continue | Pipeline GitHub Actions déclenché sur push/PR, exécutant les deux suites (Cypress legacy + Playwright cible) puis, à terme, Playwright seul |
| Conteneurisation | Image Docker de l'environnement de test (Cypress puis Playwright) |
| Orchestration | Déploiement/exécution des tests via Kubernetes (Kind/minikube) |
| Alerting temps réel | Notification Slack en cas d'échec |
| Reporting qualité | Rapport HTML (Mochawesome → Playwright HTML Report/Trace Viewer) publié automatiquement |
| Traçabilité exigences ↔ tests | Lien ticket Jira ↔ scénario ↔ résultat d'exécution, maintenu à travers la migration |

### 1.3 Format de démonstration (Loom)

Le recruteur doit pouvoir, en **moins de 7 minutes** :
1. Voir un ticket Jira avec un besoin fonctionnel.
2. Voir le scénario Gherkin correspondant, écrit à la main.
3. Voir le test Cypress historique (socle de départ).
4. Voir le test équivalent en Playwright, et le diff/mapping documenté.
5. Voir une session Playwright MCP générer un test candidat à partir de l'exploration de la page.
6. Voir le pipeline GitHub Actions s'exécuter (Cypress + Playwright) dans un conteneur Docker/K8s.
7. Recevoir une alerte Slack en cas d'échec simulé.
8. Consulter le rapport de test généré automatiquement (Playwright HTML Report).

---

## 2. Périmètre fonctionnel

### 2.1 In scope

| Élément | Détail |
|---|---|
| Application sous test (UI) | Application de démonstration simple (ex. TodoMVC), déployée en local via Docker |
| Application sous test (API) | Mock API REST (json-server ou équivalent) exposant des endpoints CRUD |
| Types de tests couverts | Smoke tests (parcours critiques) + Tests de non-régression (fonctionnels) |
| Couche testée | UI (Cypress E2E puis Playwright) + API (Cypress `cy.request` puis Playwright `request` fixture) |
| **Migration** | Suite Cypress existante réécrite en Playwright, avec README comparatif documentant chaque équivalence technique |
| **Agentic (Playwright CLI/MCP)** | Génération de tests via `codegen`, `init-agents`, et session MCP connectée à Claude Code — tests candidats revus et committés |
| Traçabilité | 1 ticket Jira (ou fichier JSON simulant un ticket) ↔ 1 feature Gherkin ↔ 1 spec Cypress ↔ 1 spec Playwright équivalente |
| CI/CD | GitHub Actions (déclenchement sur push/PR + planifié), exécutant les deux suites en parallèle pendant la phase de transition |
| Conteneurisation | Dockerfile + docker-compose (app + tests Cypress + tests Playwright) |
| Orchestration | Manifests Kubernetes (Job/CronJob) pour exécuter les suites dans un cluster local (Kind/minikube) |
| Alerting | Webhook Slack (canal dédié) sur échec de run |
| Reporting | Mochawesome (Cypress) puis Playwright HTML Report/Trace Viewer, publiés en artifact GitHub Actions + GitHub Pages |

### 2.2 Out of scope (POC, pas un produit)

| Élément | Justification |
|---|---|
| Intégration Jira/Xray réelle (API complète) | Nécessite une instance Jira Cloud + licence Xray ; simulé par un fichier `ticket.json` en V1, réel en option ultérieure |
| Tests de charge/performance avancés | Hors périmètre du smoke/non-régression, mentionné comme évolution possible |
| Environnement Cloud managé (GKE/EKS) | Kind/minikube suffisant pour démontrer le principe d'orchestration |
| Multi-environnements (dev/staging/prod) | Un seul environnement de démo |
| Suppression prématurée de Cypress | Le socle Cypress est conservé jusqu'à la fin de la migration documentée, pas supprimé en cours de route — la coexistence temporaire fait partie de la preuve |

---

## 3. Architecture globale du pipeline (cible, fin de migration)

```
[Ticket Jira / ticket.json]
        |  (besoin fonctionnel + criteres d'acceptation)
        v
[Scenario Gherkin] (.feature)
        |
        +----------------------------+
        v                            v
[Automatisation Cypress]     [Automatisation Playwright]
   (socle historique,           (cible de migration,
   conserve en reference)       TypeScript, POM, fixtures)
        |                            |
        |                            +--> [Playwright CLI] (codegen, init-agents)
        |                            |
        |                            +--> [Playwright MCP] (@playwright/mcp + Claude Code)
        |                                  -> exploration, generation de tests candidats
        |                                  -> revue humaine -> commit
        |                            |
        +-------------+--------------+
                       v
        [Conteneurisation Docker] (image de test + app sous test)
                       |
                       v
        [Orchestration Kubernetes] (Job K8s executant le conteneur de test)
                       |
                       v
        [CI/CD GitHub Actions] (declenchement push/PR + planifie)
                       |
                       +--> [Alerting Slack] (si echec : resume + lien vers le run)
                       |
                       v
        [Reporting] (Playwright HTML Report/Trace Viewer -> artifact + GitHub Pages)
                       |
                       v
        [Tracabilite] (lien retour vers le ticket Jira/ticket.json dans le rapport)
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

### 4.2 Étape 2 — Scénario Gherkin (inchangé à travers la migration)

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
| Fichier | `cypress/e2e/features/todo-add.feature` (conservé), miroir `playwright/features/todo-add.feature` |
| Type de test | Smoke test |
| Lien traçabilité | `JIRA-101` (référencé en commentaire dans les deux implémentations) |

### 4.3 Étape 3 — Automatisation Cypress (socle historique, ne pas supprimer)

| Élément | Détail |
|---|---|
| Step definitions | `cypress/e2e/step_definitions/todo-add.steps.js` |
| Preprocessor | `@badeball/cypress-cucumber-preprocessor` |
| Type de sélecteurs | `data-cy` |
| Tests API associés | `cy.request()` sur `POST /todos` |
| Rôle dans le POC | Référence de départ pour la preuve de migration — reste dans le repo, ne pas le retirer |

### 4.4 Étape 4 — Migration vers Playwright

| Élément | Détail |
|---|---|
| Fichier équivalent | `playwright/tests/todo-add.spec.ts` |
| Sélecteurs | `data-cy` conservés en transition, migration progressive vers `data-testid`/rôles ARIA documentée |
| Fixtures | `test.extend` en remplacement des custom commands Cypress |
| Tests API associés | Fixture `request` de Playwright sur `POST /todos`, en remplacement de `cy.request()` |
| Mocking réseau | `page.route()` en remplacement de `cy.intercept()` |
| **Livrable clé** | `MIGRATION.md` : tableau comparatif ligne à ligne Cypress → Playwright pour ce scénario précis, avec explication de chaque choix technique |

### 4.5 Étape 5 — Playwright CLI

| Élément | Détail |
|---|---|
| Codegen | `npx playwright codegen <url-app-demo>` pour générer un premier jet de script sur un second scénario (ex. suppression de tâche) |
| init-agents | `npx playwright init-agents` pour initialiser le pattern Planner/Generator/Healer sur le projet |
| **Livrable clé** | Commit dédié montrant le script généré par codegen, puis sa version refactorée (POM, assertions propres) — les deux versions restent visibles dans l'historique Git pour la preuve |

### 4.6 Étape 6 — Playwright MCP

| Élément | Détail |
|---|---|
| Serveur MCP | `@playwright/mcp` (dernière version stable), connecté à Claude Code en local |
| Session de démonstration | Exploration de l'application TodoMVC via arbre d'accessibilité, génération d'un test candidat sur un scénario non encore couvert (ex. suppression de toutes les tâches) |
| Gestion de session | Configuration `storageState` documentée pour éviter la ré-authentification si l'appli de démo intègre un login |
| Revue humaine | Le test généré par l'agent MCP est relu, ajusté (POM, assertions), puis committé — jamais mergé sans revue |
| **Livrable clé** | `MCP-SESSION.md` : capture de la session (prompts envoyés, outils MCP appelés, test généré brut vs test final committé) |

### 4.7 Étape 7 — Exécution & CI/CD (période de coexistence)

| Déclencheur | Suite exécutée | Fréquence |
|---|---|---|
| `push` / `pull_request` sur `main` | Smoke tests Cypress (`@smoke`) + Smoke tests Playwright équivalents | À chaque commit |
| `schedule` (cron GitHub Actions) | Suite complète Cypress + Playwright (`@regression`) | Nightly |
| `workflow_dispatch` | Suite au choix (Cypress seul / Playwright seul / les deux) | Déclenchement manuel (démo live) |
| **Jalon de bascule** | Une fois la couverture Playwright ≥ couverture Cypress sur le périmètre du POC, le workflow Cypress passe en `continue-on-error` puis est retiré, documenté dans `MIGRATION.md` | Fin de POC |

### 4.8 Étape 8 — Alerting (inchangé)

| Condition | Canal | Contenu du message |
|---|---|---|
| Échec d'un ou plusieurs tests | Slack (webhook) | Nom du run, framework (Cypress/Playwright), nombre de tests échoués, lien direct vers le rapport et vers le run GitHub Actions |
| Succès | Aucune notification | Éviter le bruit |

### 4.9 Étape 9 — Reporting

| Outil | Rôle |
|---|---|
| Mochawesome (phase Cypress) | Rapport HTML détaillé pendant la période de coexistence |
| Playwright HTML Report / Trace Viewer (cible) | Rapport enrichi avec traces d'exécution complètes (DOM, réseau, console) — remplace Mochawesome en fin de migration |
| GitHub Actions artifact | Stockage du rapport à chaque run |
| GitHub Pages | Publication du dernier rapport en ligne (URL stable, consultable par le recruteur) |
| (Optionnel) Xray/Jira | Remontée des résultats dans le ticket Jira d'origine |

---

## 5. Spec technique

### 5.1 Stack technique retenue

| Composant | Choix | Justification |
|---|---|---|
| Application UI de démo | TodoMVC (ou équivalent React/Vue léger) | Open-source, simple, rapide à conteneuriser |
| Mock API | `json-server` | Zéro backend à coder, endpoints REST CRUD instantanés |
| Framework de test (socle historique) | Cypress + `cypress-cucumber-preprocessor` | Référence de départ, preuve de compétence Cypress |
| **Framework de test (cible)** | **Playwright + TypeScript** | Cible de migration — cross-browser natif, sharding, MCP |
| **Agentic** | **Playwright CLI (codegen, init-agents) + Playwright MCP (@playwright/mcp) + Claude Code** | Cœur différenciant du POC v2 |
| CI/CD | GitHub Actions | Gratuit, standard du marché, YAML lisible pour le recruteur |
| Conteneurisation | Docker + docker-compose | Reproductibilité de l'environnement de test |
| Orchestration | Kubernetes (Kind ou minikube) | Démontre la capacité à exécuter les tests "à l'échelle" |
| Alerting | Slack Incoming Webhook | Configuration rapide, gratuite |
| Reporting | Mochawesome (transition) → Playwright HTML Report (cible) + GitHub Pages | Rapport visuel, hébergé gratuitement, lien partageable |
| Traçabilité | `ticket.json` (V1) / Jira Cloud + Xray (option ultérieure) | Sans dépendance externe payante |

### 5.2 Structure du repository (mise à jour)

```
cypress-ticket-to-report/
├── app/                          # Application sous test (TodoMVC + json-server)
│   ├── Dockerfile
│   └── docker-compose.yml
├── cypress/                      # Socle historique — conservé, non supprimé
│   ├── e2e/
│   │   ├── features/
│   │   └── step_definitions/
│   ├── fixtures/
│   └── support/
├── playwright/                   # Cible de migration
│   ├── tests/
│   ├── features/                 # Miroir Gherkin des specs Cypress migrées
│   ├── fixtures/
│   ├── pages/                    # Page Object Model
│   └── playwright.config.ts
├── mcp-sessions/                  # Preuves de sessions Playwright MCP
│   ├── MCP-SESSION.md
│   └── generated-tests-raw/       # Tests bruts générés par l'agent, avant revue
├── reports/                       # Rapports générés (gitignored, publiés en artifact)
├── k8s/
│   ├── test-job.yaml
│   └── namespace.yaml
├── tickets/
│   └── ticket-101.json
├── .github/
│   └── workflows/
│       ├── smoke.yml              # Exécute Cypress + Playwright smoke en parallèle
│       └── regression.yml         # Idem, suite complète nightly
├── cypress.config.js
├── playwright.config.ts
├── package.json
├── MIGRATION.md                   # Tableau comparatif Cypress → Playwright, décisions techniques
└── README.md                      # Présentation du POC + lien vidéo Loom + statut de migration
```

### 5.3 Pipeline GitHub Actions — étapes détaillées (période de coexistence)

| # | Étape | Action |
|---|---|---|
| 1 | Checkout du code | `actions/checkout@v4` |
| 2 | Setup Node.js | `actions/setup-node@v4` |
| 3 | Build de l'image Docker (app + tests Cypress + tests Playwright) | `docker build` |
| 4 | Déploiement dans le cluster Kind/minikube | `kind create cluster` + `kubectl apply -f k8s/` |
| 5a | Exécution des tests Cypress | Job Kubernetes ou `cypress-io/github-action` |
| 5b | Exécution des tests Playwright | Job Kubernetes ou `microsoft/playwright-github-action` |
| 6 | Génération des rapports | `mochawesome-merge` (Cypress) + reporter HTML natif Playwright |
| 7 | Publication des rapports | Upload artifact + déploiement sur GitHub Pages (les deux rapports, ou fusion) |
| 8 | Notification Slack (si échec) | `slackapi/slack-github-action`, précise le framework concerné |

### 5.4 Manifest Kubernetes (principe, inchangé)

| Ressource | Rôle |
|---|---|
| `Namespace` | Isoler l'environnement de test (`qa-poc`) |
| `Job` | Exécuter le conteneur de test (Cypress ou Playwright) une seule fois par run |
| `ConfigMap` (optionnel) | Injecter la configuration (base URL, variables d'environnement) |
| `Secret` (optionnel) | Stocker le webhook Slack et, si besoin, le `storageState` Playwright |

---

## 6. Roadmap de réalisation (mise à jour)

| Phase | Contenu | Objectif |
|---|---|---|
| **V0 — Socle local (déjà fait)** | App TodoMVC + json-server en Docker Compose, scénario Gherkin, tests Cypress qui passent en local | Valider la chaîne de bout en bout sans CI/CD |
| **V1 — CI/CD Cypress (déjà fait)** | GitHub Actions (smoke + regression), reporting Mochawesome, alerting Slack | POC "démontrable" en Loom — état de départ |
| **V2 — Socle Playwright en parallèle** | Réécriture des specs existantes en Playwright/TypeScript, POM, fixtures ; `MIGRATION.md` initié | Prouver la maîtrise Playwright sur un existant Cypress réel |
| **V3 — Playwright CLI** | Utilisation de `codegen` et `init-agents` sur un nouveau scénario non couvert | Prouver la maîtrise de l'outillage agentique de base |
| **V4 — Playwright MCP** | Session MCP connectée à Claude Code, génération d'un test candidat, revue et commit, documentation dans `MCP-SESSION.md` | Prouver la maîtrise de l'écosystème agentique complet — cœur différenciant |
| **V5 — Orchestration & bascule** | Ajout Kubernetes (Kind), Job de test pour les deux frameworks, publication GitHub Pages, bascule progressive du workflow vers Playwright seul | Démontrer l'industrialisation et la fin de la migration |
| **V6 — Traçabilité avancée (optionnel)** | Intégration Jira Cloud + Xray réelle | Aller plus loin si le temps le permet, non bloquant pour le showroom |

---

## 7. Script de démonstration Loom (storyboard, mis à jour)

| Minute | Séquence | Message clé pour le recruteur |
|---|---|---|
| 0:00–0:30 | Présentation du contexte : "Voici un ticket Jira type" | Comprendre le besoin métier avant d'écrire du code |
| 0:30–1:00 | Affichage du fichier `.feature` (Gherkin) | Traduction directe du besoin en scénario testable |
| 1:00–1:45 | Affichage côte à côte du test Cypress historique et de son équivalent Playwright, avec `MIGRATION.md` ouvert | Preuve de migration réelle, pas une simple affirmation |
| 1:45–2:30 | Démonstration live d'une session Playwright MCP : exploration de la page, génération d'un test candidat via Claude Code | Maîtrise de l'écosystème agentique, différenciant clé |
| 2:30–3:15 | Déclenchement du workflow GitHub Actions (`workflow_dispatch`) exécutant Cypress + Playwright | Pipeline CI/CD reproductible, coexistence maîtrisée |
| 3:15–4:00 | Vue sur l'exécution du Job Kubernetes en direct (logs) | Maîtrise Docker/K8s |
| 4:00–4:30 | Simulation d'un échec de test → notification Slack en direct | Alerting temps réel opérationnel |
| 4:30–5:30 | Ouverture du rapport Playwright (HTML Report/Trace Viewer) publié sur GitHub Pages | Reporting qualité exploitable, traces d'exécution complètes |
| 5:30–6:30 | Retour sur `MIGRATION.md` : état d'avancement de la bascule Cypress → Playwright | Vision stratégique de la migration, pas seulement l'exécution |
| 6:30–7:00 | Conclusion : "Le repo est public, forkable, avec le README et l'historique complet de la migration" | Invitation à vérifier par soi-même — crédibilité maximale |

---

## 8. Critères de succès du POC (mis à jour)

| Critère | Mesure |
|---|---|
| Reproductibilité | Un tiers peut forker le repo et faire tourner le pipeline (Cypress et/ou Playwright) sans configuration manuelle complexe |
| Lisibilité | Un recruteur non technique comprend le scénario Gherkin et le rapport final |
| Bout en bout réel | Aucune étape "mockée en façade" — le pipeline s'exécute réellement, y compris la session MCP |
| **Preuve de migration** | `MIGRATION.md` documente au moins un scénario complet migré, avec justification technique de chaque choix |
| **Preuve agentique** | `MCP-SESSION.md` documente une session réelle (prompts, outils appelés, test généré brut vs final) |
| Durée de démo | ≤ 7 minutes en vidéo Loom |
| Différenciation | Mise en avant explicite de la chaîne complète et de la trajectoire de migration (Jira → Gherkin → Cypress → Playwright → Playwright CLI → Playwright MCP → Docker → K8s → Alerting → Reporting), rarement démontrée en un seul repo par les profils concurrents |

---

*Document destiné à cadrer la réalisation technique du POC v2 avant développement, à exécuter via Claude Cowork sur le repo local `cypress-ticket-to-report`. Les choix d'outils (TodoMVC, json-server, Kind) restent volontairement légers pour prioriser la vitesse de mise en œuvre et la lisibilité de la démonstration plutôt que la complexité applicative. Le socle Cypress n'est jamais supprimé brutalement : la coexistence documentée avec Playwright fait partie intégrante de la preuve de compétence.*
