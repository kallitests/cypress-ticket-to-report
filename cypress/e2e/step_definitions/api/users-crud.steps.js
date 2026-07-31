import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I create a user with name {string} and job {string}", function (name, job) {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiBaseUrl")}/users`,
    body: { name, job },
  }).as("apiResponse");
});

When("I update user id {int} with name {string} and job {string}", function (id, name, job) {
  cy.request({
    method: "PUT",
    url: `${Cypress.env("apiBaseUrl")}/users/${id}`,
    body: { name, job },
  }).as("apiResponse");
});

When("I delete user id {int}", function (id) {
  cy.request({
    method: "DELETE",
    url: `${Cypress.env("apiBaseUrl")}/users/${id}`,
    failOnStatusCode: false,
  }).as("apiResponse");
});

Then("the response body should contain name {string}", function (name) {
  cy.get("@apiResponse").its("body.name").should("eq", name);
});
