/**
 * App Actions (see docs/adr/0001-app-actions-vs-page-objects.md) for
 * authentication. `loginByApi` bypasses the UI for test setup — the login
 * *form itself* is still covered end-to-end by cypress/e2e/smoke/login.cy.ts.
 */
export const authActions = {
  /**
   * Logs in through RWA's real `/login` endpoint (Passport local strategy)
   * and lands on the authenticated app. Session cookie scoping ignores the
   * port difference between the API (3001) and the app (3000) — see
   * cypress.config.ts.
   */
  loginByApi(
    username: string,
    password: string = Cypress.env("seedUserPassword") as string
  ): Cypress.Chainable {
    return cy
      .request("POST", `${Cypress.env("apiUrl")}/login`, { username, password })
      .then(() => cy.visit("/"));
  },

  logoutByUi(): void {
    cy.getByTestId("sidenav-signout").click();
  },
};
