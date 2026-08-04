// Linked ticket: JIRA-102
// Linked 3 Amigos notes: docs/3-amigos-notes.md ("send a payment")
import { dbActions } from "../../support/app-actions/db.actions";
import { authActions } from "../../support/app-actions/auth.actions";
import { transactionActions } from "../../support/app-actions/transaction.actions";

describe("Send a payment", { tags: "@smoke" }, () => {
  it("lets a logged-in user pay a contact and updates both balances", () => {
    dbActions.reseed();

    dbActions.getUsers().then(([sender, receiver]) => {
      authActions.loginByApi(sender.username);

      const payment = {
        receiverFirstName: receiver.firstName,
        amount: "25",
        description: "Smoke test payment",
      };
      transactionActions.sendPayment(payment);

      cy.getByTestId("alert-bar-success").should("be.visible").and("contain", "Transaction Submitted!");

      const expectedSenderBalance = sender.balance - Number(payment.amount) * 100;
      cy.getByTestIdLike("user-balance").should(
        "contain",
        (expectedSenderBalance / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
      );

      dbActions.getUsers().then((refreshedUsers) => {
        const refreshedReceiver = refreshedUsers.find((u) => u.id === receiver.id)!;
        expect(refreshedReceiver.balance).to.equal(receiver.balance + Number(payment.amount) * 100);
      });
    });
  });
});
