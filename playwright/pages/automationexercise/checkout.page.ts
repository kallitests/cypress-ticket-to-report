import type { Page, Locator } from "@playwright/test";

/** /checkout — order review + optional comment, before moving to payment. */
export class CheckoutPage {
  readonly page: Page;
  readonly addressReview: Locator;
  readonly orderReviewTable: Locator;
  readonly commentTextarea: Locator;
  readonly placeOrderLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addressReview = page.locator("#address_delivery");
    this.orderReviewTable = page.locator("#cart_info");
    this.commentTextarea = page.locator('textarea[name="message"]');
    this.placeOrderLink = page.getByRole("link", { name: "Place Order" });
  }
}
