import type { Page, Locator } from "@playwright/test";

/** /view_cart — the cart summary and the entry point into checkout. */
export class CartPage {
  readonly page: Page;
  readonly cartRows: Locator;
  readonly proceedToCheckoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartRows = page.locator("#cart_info_table tbody tr");
    this.proceedToCheckoutButton = page.getByText("Proceed To Checkout");
  }

  async goto(): Promise<void> {
    await this.page.goto("/view_cart");
  }
}
