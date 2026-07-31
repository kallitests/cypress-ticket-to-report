import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as {string}", (username) => {
  cy.loginAs(username, "secret_sauce");
});

When("I sort products by {string}", (sortOptionLabel) => {
  const valueMap = {
    "Name (A to Z)": "az",
    "Name (Z to A)": "za",
    "Price (low to high)": "lohi",
    "Price (high to low)": "hilo",
  };
  cy.get('[data-test="product-sort-container"]').select(valueMap[sortOptionLabel]);
});

Then("the products should be displayed in ascending price order", () => {
  cy.get(".inventory_item_price").then(($prices) => {
    const prices = [...$prices].map((el) => parseFloat(el.textContent.replace("$", "")));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).to.deep.equal(sorted);
  });
});

Then("the products should be displayed in descending price order", () => {
  cy.get(".inventory_item_price").then(($prices) => {
    const prices = [...$prices].map((el) => parseFloat(el.textContent.replace("$", "")));
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).to.deep.equal(sorted);
  });
});
