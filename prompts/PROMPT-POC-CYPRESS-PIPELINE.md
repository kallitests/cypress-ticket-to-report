# Prompt — Construction d'un POC "Pipeline CI/CD Cypress" (showroom recruteur)

> **Comment utiliser ce prompt** : lance Claude Code **dans le dossier local `cypress-ticket-to-report`** (le repo existant), puis colle l'intégralité du contenu ci-dessous (à partir de "## Rôle"). L'agent doit avoir accès à Internet/Git pour cloner ou étudier `cypress-realworld-app`, et à Git en local pour committer dans le repo existant.

> **⚠️ Important : ce n'est PAS un repo à créer, c'est un repo EXISTANT à faire évoluer.** `cypress-ticket-to-report` contient déjà probablement une structure, un historique Git, peut-être déjà des tests. L'agent ne doit **jamais écraser aveuglément** l'existant : il doit d'abord l'auditer, puis adapter le plan ci-dessous à ce qui est déjà en place (réutiliser la config existante si elle est correcte, compléter plutôt que dupliquer, respecter les conventions déjà présentes dans le repo).

---

## Rôle

Tu es un ingénieur QA Automation senior, spécialiste Cypress et CI/CD, avec une double casquette d'architecte de framework de test et de DevOps. Tu vas construire un **POC (proof of concept) de pipeline de test automatisé complet**, destiné à servir de **repo showroom pour des recruteurs techniques**. La qualité, la structure et la lisibilité du repo comptent autant que le code lui-même : chaque recruteur qui l'ouvre doit comprendre en 5 minutes le niveau de séniorité du profil.

## Objectif du POC

Construire, dans mon repo GitHub, un framework Cypress complet qui automatise le **cycle de vie réel du test en entreprise** — du refinement au reporting — appliqué à l'application de démonstration officielle **cypress-realworld-app** (RWA) : https://github.com/cypress-io/cypress-realworld-app

Le repo final doit être un **repo de test automation autonome** (pas un fork de l'appli), qui :
- utilise RWA comme **SUT** (System Under Test), démarrée via Docker Compose (RWA fournit son propre `docker-compose.yml` et ses scripts de seed) ;
- contient **mon propre framework de tests Cypress**, avec ma propre architecture, mes conventions, mes pipelines CI/CD.

## Priorité absolue : Smoke tests & Tests de non-régression

C'est le cœur de la démonstration. Le repo doit prouver une **stratégie de tagging et d'exécution ciblée** claire et professionnelle :

| Suite | Tag Cypress | Contenu | Durée cible | Déclenchement CI |
|---|---|---|---|---|
| **Smoke** | `@smoke` | 8 à 12 tests critiques uniquement (login, création de compte, envoi d'un paiement, visualisation du solde/transactions, logout) — les parcours "si ça casse, tout est cassé" | < 3-5 min | À **chaque push / chaque PR**, obligatoire avant merge |
| **Régression** | `@regression` | Suite E2E complète : tous les parcours fonctionnels, cas limites, erreurs, pagination, filtres, notifications, gestion des amis/contacts RWA | 15-30 min | Sur merge vers `main` + **exécution nocturne planifiée** (`schedule` GitHub Actions) |
| **API** | `@api` | Tests `cy.request()` purs, sans UI, sur les endpoints RWA | < 2 min | À chaque push (rapide, exécuté en parallèle du smoke) |

Utilise **`cypress-grep`** (ou `@cypress/grep`) pour piloter cette sélection via variables d'environnement (`--env grepTags=@smoke`). Documente cette stratégie explicitement dans le README avec un schéma/tableau — c'est l'élément que je veux le plus mettre en avant en entretien.

## Stack & contraintes techniques

- **Cypress** dernière version stable, en **TypeScript strict** (pas de JS).
- Design pattern **App Actions** (recommandé par l'équipe Cypress pour RWA) combiné à des **Page Objects légers** pour les éléments UI stables — documente ce choix dans une ADR (Architecture Decision Record).
- Sélecteurs exclusivement via `data-cy` / `data-test` (RWA les fournit déjà en grande partie).
- `custom commands` pour les actions récurrentes (login via API, seed de données, création de transaction).
- Gestion multi-environnements via `cypress.config.ts` + fichiers `cypress.env.*.json` (local, ci, staging).
- `cy.intercept()` pour au moins un scénario de mock (ex. simuler une erreur réseau) en plus des appels réels contre RWA.
- ESLint + Prettier + config Cypress-specific lint rules, avec un hook **husky** (pre-commit : lint + typecheck).
- Gestion des données de test : utilise les **scripts de seed** fournis par RWA (`yarn db:seed` / API interne) plutôt que des données codées en dur — documente la stratégie de seed dynamique.

## Étapes du cycle de vie à matérialiser dans le repo

Reproduis chacune des 10 étapes du tableau ci-dessous par un **artefact concret et versionné** (pas juste une mention dans le README) :

1. **Refinement / Ticket Jira** → crée un dossier `docs/user-stories/` avec 3-4 US rédigées au format Gherkin (Given/When/Then), avec une colonne "automatisable E2E vs manuel" et une estimation d'effort.
2. **Ateliers 3 Amigos** → un document `docs/3-amigos-notes.md` simulant les critères d'acceptation validés pour une des US (ex. "envoyer un paiement"), avec la liste des `data-cy` nécessaires et les mocks à prévoir.
3. **Stratégie de test & cas de test** → `docs/test-plan.md` (plan de test) + `docs/coverage-matrix.md` (matrice de couverture fonctionnelle, avec statut par module RWA : Auth, Transactions, Users, Notifications, Bank Accounts).
4. **Architecture & automatisation** → dossier `cypress/e2e/`, `cypress/support/` (custom commands, App Actions), `cypress/fixtures/`, `cypress.config.ts` propre et commenté.
5. **Tests API** → `cypress/e2e/api/` avec `cy.request()`, validation de schéma JSON (utilise `ajv` ou un simple assert de structure), README dédié expliquant le choix vs Postman/Bruno (ajoute une collection Bruno/Postman minimale en complément, dans `postman/` ou `bruno/`, pour montrer la polyvalence).
6. **Revue de code** → `.github/pull_request_template.md`, `CODEOWNERS`, règles de branche protégée documentées dans `CONTRIBUTING.md`, config ESLint stricte committée.
7. **Exécution & CI/CD** → workflows GitHub Actions (détail ci-dessous), exécution headless, parallélisation (`--parallel` ou matrix strategy), gestion des tests flaky via `retries` configurés dans `cypress.config.ts` (ex. 2 retries en CI, 0 en local).
8. **Gestion des anomalies** → active les captures d'écran/vidéos automatiques Cypress à l'échec (`screenshotOnRunFailure`, `video: true`), uploade-les en artefacts GitHub Actions, et ajoute un **workflow qui crée automatiquement une GitHub Issue** taguée `bug` + `flaky-candidate` quand un test échoue en régression nocturne (simule ainsi la traçabilité vers Jira/Xray).
9. **Reporting & KPI** → intègre **Mochawesome** (rapport HTML fusionné via `mochawesome-merge` + `mochawesome-report-generator`), publie le rapport sur **GitHub Pages** à chaque run de régression, et affiche un badge de statut + taux de succès dans le README.
10. **Amélioration continue** → `docs/adr/` (Architecture Decision Records numérotées), `CHANGELOG.md`, section "Roadmap / améliorations futures" dans le README (cross-browser BrowserStack, visual regression, a11y — voir ci-dessous).

## Éléments "bonus" à intégrer pour combler les manques identifiés dans l'offre

Implémente au moins les 3 premiers en profondeur (pas juste mentionnés), les autres peuvent rester en "roadmap documentée" si le temps manque :

- **`cypress-axe`** : au moins 2-3 tests d'accessibilité sur les pages critiques (login, dashboard).
- **Notification Slack/Discord sur échec pipeline** : webhook dans le workflow de régression nocturne (utilise un webhook de test/exemple si pas de vrai canal).
- **Environnement Docker** : `docker-compose.yml` orchestrant RWA + le runner Cypress, pour une reproductibilité totale (`docker compose up` → tests qui tournent).
- *(Roadmap uniquement si contrainte de temps)* : visual regression (`cypress-image-snapshot` ou Percy), cross-browser BrowserStack, sensibilisation OWASP Top 10.

## Pipeline CI/CD (GitHub Actions)

Crée deux workflows distincts dans `.github/workflows/` :

1. **`pr-smoke.yml`**
   - Déclenché sur `pull_request` vers `main`.
   - Démarre RWA via Docker Compose, attend qu'elle soit `healthy`.
   - Lance `@smoke` + `@api` en parallèle (jobs matrix).
   - Bloque le merge si échec (branch protection).
   - Upload des screenshots/vidéos en cas d'échec.

2. **`nightly-regression.yml`**
   - Déclenché sur `schedule` (cron nocturne) + `push` sur `main`.
   - Lance `@regression` complète avec parallélisation (matrix par module fonctionnel : auth, transactions, users, notifications).
   - Retries configurés pour absorber le flaky.
   - Génère et publie le rapport Mochawesome sur GitHub Pages.
   - Crée une Issue GitHub automatique en cas d'échec + notification Slack/Discord.

## Arborescence cible du repo

```
cypress-poc-pipeline/
├── .github/
│   ├── workflows/
│   │   ├── pr-smoke.yml
│   │   └── nightly-regression.yml
│   ├── ISSUE_TEMPLATE/bug_report.md
│   └── pull_request_template.md
├── cypress/
│   ├── e2e/
│   │   ├── smoke/
│   │   ├── regression/
│   │   └── api/
│   ├── support/
│   │   ├── app-actions/
│   │   ├── commands.ts
│   │   └── e2e.ts
│   ├── fixtures/
│   └── downloads/ (gitignore)
├── docker-compose.yml
├── docs/
│   ├── user-stories/
│   ├── 3-amigos-notes.md
│   ├── test-plan.md
│   ├── coverage-matrix.md
│   └── adr/
├── postman/ ou bruno/
├── cypress.config.ts
├── CONTRIBUTING.md
├── CODEOWNERS
├── CHANGELOG.md
└── README.md
```

## Roadmap de réalisation (à suivre par phases, avec un commit propre par phase)

0. **Audit de l'existant** (obligatoire avant toute modification) :
   - Explore l'arborescence actuelle de `cypress-ticket-to-report`, lis le `README.md`, le `package.json`, la config Cypress si elle existe, l'historique Git récent (`git log --oneline -20`).
   - Produis un court résumé (dans le chat, avant de coder) : ce qui existe déjà, ce qui est réutilisable tel quel, ce qui doit être migré/adapté, ce qui manque totalement par rapport au plan ci-dessous.
   - Propose un plan d'intégration (quels fichiers tu vas créer, lesquels tu vas modifier, lesquels tu laisses intacts) et **attends validation** avant de committer massivement si des fichiers existants doivent être significativement remaniés ou supprimés.
   - Si le repo a déjà un nom/une identité de projet différente de "POC Cypress showroom", adapte le README en conséquence plutôt que de le remplacer entièrement.

1. Setup repo (structure, TS, ESLint, Docker Compose avec RWA, `cypress.config.ts` minimal) — **en complétant l'existant, pas en repartant de zéro**.
2. Custom commands + App Actions + premiers tests smoke (login, paiement).
3. Workflow `pr-smoke.yml` fonctionnel et vert.
4. Suite de régression complète + tests API.
5. Workflow `nightly-regression.yml` + reporting Mochawesome + GitHub Pages.
6. Gestion des anomalies (issue auto) + notification Slack/Discord.
7. Documentation complète (docs/, ADR, coverage matrix) + a11y (`cypress-axe`).
8. README final "showroom" (voir section suivante) + relecture globale.

Committe et pousse à la fin de chaque phase avec un message clair (`feat(ci): add smoke workflow`, etc.), pour que l'historique Git lui-même serve de preuve de démarche professionnelle.

## Exigences pour le README (page d'accueil du showroom)

Le README est ce que le recruteur lira en premier. Il doit contenir :
- Un pitch en 3-4 lignes : quoi, pourquoi, sur quelle appli.
- Des badges (statut CI smoke, statut CI régression, lien vers le dernier rapport Mochawesome).
- Le schéma du cycle de vie (reprendre le tableau des 10 étapes, avec lien vers l'artefact correspondant dans le repo).
- La section "Stratégie smoke vs régression" mise en avant visuellement (tableau).
- Un GIF ou capture d'écran d'une exécution Cypress (headed) et du rapport Mochawesome.
- Une section "Compétences démontrées" qui mappe explicitement chaque item de l'offre d'origine à un dossier/fichier du repo (facilite la conversation en entretien).
- Instructions claires pour lancer le POC en local (`docker compose up`, `npm run test:smoke`, `npm run test:regression`).

## Contraintes de comportement pour l'agent

- **Ne crée pas un nouveau repo, ne réinitialise pas l'historique Git.** Tu travailles dans `cypress-ticket-to-report` tel qu'il existe, avec son historique.
- Commence toujours par la Phase 0 (audit) et attends mon feu vert avant tout remaniement lourd d'un fichier existant important (README, config CI existante, etc.). Les ajouts purs (nouveaux fichiers/dossiers) ne nécessitent pas de validation préalable.
- Avance phase par phase, commit à chaque étape avec des messages clairs, ne casse jamais la CI d'une phase précédente.
- Si RWA a évolué depuis la dernière connaissance (structure, scripts, sélecteurs `data-cy`), va vérifier directement dans le repo cloné plutôt que de supposer.
- Priorise la robustesse des smoke tests avant tout le reste : c'est la vitrine principale.
- Documente chaque choix d'architecture non trivial dans une ADR plutôt que juste dans le code.
- À la fin, fournis un résumé de ce qui a été implémenté vs mis en roadmap, pour que je puisse en parler précisément en entretien.
