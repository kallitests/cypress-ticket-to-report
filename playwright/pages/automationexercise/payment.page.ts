import type { Page, Locator } from "@playwright/test";

/** /payment and the order-confirmation page it redirects to on submit. */
export class PaymentPage {
  readonly page: Page;
  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payButton: Locator;
  readonly orderConfirmationHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameOnCardInput = page.getByTestId("name-on-card");
    this.cardNumberInput = page.getByTestId("card-number");
    this.cvcInput = page.getByTestId("cvc");
    this.expiryMonthInput = page.getByTestId("expiry-month");
    this.expiryYearInput = page.getByTestId("expiry-year");
    this.payButton = page.getByTestId("pay-button");
    this.orderConfirmationHeading = page.getByText("Congratulations! Your order has been confirmed!");
  }

  async payWithDummyCard(): Promise<void> {
    await this.nameOnCardInput.fill("QA POC");
    await this.cardNumberInput.fill("4111111111111111");
    await this.cvcInput.fill("123");
    await this.expiryMonthInput.fill("12");
    await this.expiryYearInput.fill("2030");
    await this.payButton.click();
  }
}
