Feature: Sign in

  # Mirror of the Gherkin intent behind cypress/e2e/smoke/login.cy.ts.
  # Not wired to a Cucumber runner on the Playwright side (no
  # @badeball/cypress-cucumber-preprocessor equivalent is used here) — kept
  # as documentation so the scenario reads the same on both sides of the
  # migration. See MIGRATION.md.

  Scenario: Sign in with valid credentials
    Given a seeded user exists
    When the user submits their username and password on the sign-in form
    Then they land on the authenticated app with their username in the sidenav

  Scenario: Sign in with an invalid password
    Given a seeded user exists
    When the user submits their username with a wrong password
    Then an explicit "Incorrect username or password." error is shown
