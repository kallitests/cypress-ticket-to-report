/// <reference types="cypress" />

/**
 * Selector strategy: RWA marks its stable, test-facing elements with
 * `data-test` (confirmed by reading vendor/cypress-realworld-app/src — the
 * app does NOT use `data-cy`, despite that being Cypress's more commonly
 * recommended attribute name elsewhere). These two commands are the single
 * place that convention lives, so the rest of the suite never hard-codes a
 * `[data-test=...]` selector directly.
 */
Cypress.Commands.add("getByTestId", (selector: string, ...args: unknown[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cy.get(`[data-test="${selector}"]`, ...(args as any));
});

Cypress.Commands.add("getByTestIdLike", (selector: string, ...args: unknown[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cy.get(`[data-test*="${selector}"]`, ...(args as any));
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getByTestId(selector: string, ...args: unknown[]): Chainable<JQuery<HTMLElement>>;
      getByTestIdLike(selector: string, ...args: unknown[]): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
