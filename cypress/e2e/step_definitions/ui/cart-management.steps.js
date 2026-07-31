import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as {string} with {string} in the cart", (username, productName) => {
  cy.loginAs(username, "secret_sauce");
  const slug = productName.toLowerCase().replace(/\s+/g, "-");
  cy.get(`[data-test="add-to-cart-${slug}"]`).click();
});

When("I remove {string} from the cart", (productName) => {
  const slug = productName.toLowerCase().replace(/\s+/g, "-");
  cy.get(`[data-test="remove-${slug}"]`).click();
});

Then("the cart badge should not be displayed", () => {
  cy.get('[data-test="shopping-cart-badge"]').should("not.exist");
});
