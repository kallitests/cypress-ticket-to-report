/**
 * App Actions for the "send a payment" journey — the single most important
 * user flow in this showroom (see docs/3-amigos-notes.md). Drives the real
 * UI rather than the API: this *is* the critical path smoke test is meant
 * to protect.
 */
export interface PaymentInput {
  receiverFirstName: string;
  amount: string;
  description: string;
}

export const transactionActions = {
  startNewTransaction(): void {
    cy.getByTestId("nav-top-new-transaction").click();
  },

  selectReceiver(receiverFirstName: string): void {
    cy.getByTestId("user-list-search-input").type(receiverFirstName, { force: true });
    cy.getByTestIdLike("user-list-item").contains(receiverFirstName).click({ force: true });
  },

  fillPaymentDetails(amount: string, description: string): void {
    cy.getByTestIdLike("amount-input").type(amount);
    cy.getByTestIdLike("description-input").type(description);
  },

  submitPayment(): void {
    cy.getByTestIdLike("submit-payment").click();
  },

  /** Composes the steps above into the one flow smoke tests care about. */
  sendPayment({ receiverFirstName, amount, description }: PaymentInput): void {
    transactionActions.startNewTransaction();
    transactionActions.selectReceiver(receiverFirstName);
    transactionActions.fillPaymentDetails(amount, description);
    transactionActions.submitPayment();
  },
};
