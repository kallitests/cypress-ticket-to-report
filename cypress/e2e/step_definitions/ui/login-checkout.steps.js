import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on the Swag Labs login page", () => {
  cy.visit("/");
});

When("I log in with username {string} and password {string}", (username, password) => {
  cy.get('[data-test="username"]').clear().type(username);
  cy.get('[data-test="password"]').clear().type(password, { log: false });
  cy.get('[data-test="login-button"]').click();
});

Then("I should see the products inventory page", () => {
  cy.url().should("include", "/inventory.html");
  cy.get(".inventory_list").should("be.visible");
});

When("I add {string} to the cart", (productName) => {
  const slug = productName.toLowerCase().replace(/\s+/g, "-");
  cy.get(`[data-test="add-to-cart-${slug}"]`).click();
});

When("I proceed to checkout", () => {
  cy.get('[data-test="shopping-cart-link"]').click();
  cy.get('[data-test="checkout"]').click();
});

When(
  "I fill in checkout information {string} {string} {string}",
  (firstName, lastName, postalCode) => {
    cy.get('[data-test="firstName"]').type(firstName);
    cy.get('[data-test="lastName"]').type(lastName);
    cy.get('[data-test="postalCode"]').type(postalCode);
    cy.get('[data-test="continue"]').click();
  }
);

When("I finish the checkout", () => {
  cy.get('[data-test="finish"]').click();
});

Then("I should see the order confirmation message {string}", (message) => {
  cy.get(".complete-header").should("contain.text", message);
});
