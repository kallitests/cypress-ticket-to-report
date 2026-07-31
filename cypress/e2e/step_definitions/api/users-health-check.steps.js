import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I request the user with id {int}", function (id) {
  cy.request({
    method: "GET",
    url: `${Cypress.env("apiBaseUrl")}/users/${id}`,
    failOnStatusCode: false,
  }).as("apiResponse");
});

Then("the response status should be {int}", function (statusCode) {
  cy.get("@apiResponse").its("status").should("eq", statusCode);
});

Then("the response body should contain email {string}", function (email) {
  cy.get("@apiResponse").its("body.data.email").should("eq", email);
});
