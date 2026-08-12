// Linked user story: add a product to the cart and place an order —
// automationexercise.com's Test Case 14 ("Place Order: Register while Checkout")
// simplified to the critical path only. Account setup/teardown goes through the
// `aeApi` fixture (API 11 / API 12) rather than the UI signup form, the same
// division of labour as RWA's `db` fixture: the API sets the world up, the UI
// test focuses on the one scenario it's actually there to prove.
import { test, expect } from "../../fixtures/automationexercise/api";
import { buildAccountPayload } from "../../fixtures/automationexercise/test-data";
import type { AeAccountPayload } from "../../fixtures/automationexercise/types";
import { LoginPage } from "../../pages/automationexercise/login.page";
import { ProductsPage } from "../../pages/automationexercise/products.page";
import { CartPage } from "../../pages/automationexercise/cart.page";
import { CheckoutPage } from "../../pages/automationexercise/checkout.page";
import { PaymentPage } from "../../pages/automationexercise/payment.page";

test.describe("Cart & checkout @smoke", () => {
  let account: AeAccountPayload;

  test.beforeEach(async ({ aeApi }) => {
    account = buildAccountPayload();
    const created = await aeApi.createAccount(account);
    expect(created.status()).toBe(200);
  });

  test.afterEach(async ({ aeApi }) => {
    const deleted = await aeApi.deleteAccount(account.email, account.password);
    expect(deleted.status()).toBe(200);
  });

  test("adds a product to the cart, checks out, and pays to reach an order confirmation", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const products = new ProductsPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    const payment = new PaymentPage(page);

    await loginPage.goto();
    await loginPage.login(account.email, account.password);

    await products.goto();
    await products.addProductToCartAndViewCart(0);

    await expect(cart.cartRows).toHaveCount(1);
    await cart.proceedToCheckoutButton.click();

    await expect(checkout.orderReviewTable).toBeVisible();
    await checkout.commentTextarea.fill("cypress-ticket-to-report Playwright smoke run");
    await checkout.placeOrderLink.click();

    await payment.payWithDummyCard();
    await expect(payment.orderConfirmationHeading).toBeVisible();
  });
});
