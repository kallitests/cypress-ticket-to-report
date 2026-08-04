// Linked ticket: JIRA-101 (see tickets/ticket-101.json)
// Linked user story: docs/user-stories/US-01-login.md
import { dbActions } from "../../support/app-actions/db.actions";

describe("Sign in", { tags: "@smoke" }, () => {
  beforeEach(() => {
    dbActions.reseed();
    cy.visit("/");
  });

  it("logs a seeded user in with valid credentials", () => {
    dbActions.getUsers().then((users) => {
      const [user] = users;

      cy.getByTestId("signin-username").type(user.username);
      cy.getByTestId("signin-password").type(Cypress.env("seedUserPassword"), { log: false });
      cy.getByTestId("signin-submit").click();

      cy.getByTestId("sidenav-username").should("contain", user.username);
      cy.getByTestId("nav-personal-tab").should("be.visible");
    });
  });

  it("rejects an invalid password with an explicit error", () => {
    dbActions.getUsers().then(([user]) => {
      cy.getByTestId("signin-username").type(user.username);
      cy.getByTestId("signin-password").type("not-the-right-password", { log: false });
      cy.getByTestId("signin-submit").click();

      cy.getByTestId("signin-error").should("be.visible").and("contain", "Incorrect username or password.");
    });
  });
});
