import { Then } from "@badeball/cypress-cucumber-preprocessor";

// "Given I am on the Swag Labs login page" and
// "When I log in with username {string} and password {string}"
// are already defined in login-checkout.steps.js and are reused here
// by the cypress-cucumber-preprocessor step registry.

Then("I should see the error message {string}", (message) => {
  cy.get('[data-test="error"]').should("contain.text", message);
});
