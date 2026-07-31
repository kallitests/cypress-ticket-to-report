/**
 * Custom command to log in to Swag Labs (saucedemo.com) without
 * repeating the login flow in every step definition file.
 */
Cypress.Commands.add("loginAs", (username, password) => {
  cy.visit("/");
  cy.get('[data-test="username"]').clear().type(username);
  cy.get('[data-test="password"]').clear().type(password, { log: false });
  cy.get('[data-test="login-button"]').click();
  cy.url().should("include", "/inventory.html");
});
