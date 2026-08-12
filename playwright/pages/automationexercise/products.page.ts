import type { Page, Locator } from "@playwright/test";

/**
 * /products — the catalog grid. Only what the smoke path touches: add the
 * first product to the cart and follow the "Added!" modal through to the
 * cart. Search is exposed too since it's the other critical path a smoke
 * suite for an e-commerce site should cover.
 */
export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly productCards: Locator;
  readonly addedToCartModal: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLinkInModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator("#search_product");
    this.searchButton = page.locator("#submit_search");
    this.productCards = page.locator(".features_items .product-image-wrapper");
    this.addedToCartModal = page.locator("#cartModal");
    this.continueShoppingButton = page.locator("#cartModal .btn-success");
    this.viewCartLinkInModal = page.locator('#cartModal a[href="/view_cart"]');
  }

  async goto(): Promise<void> {
    await this.page.goto("/products");
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  /** Adds a product by its catalog position (0-based) and dismisses the modal via "View Cart". */
  async addProductToCartAndViewCart(index = 0): Promise<void> {
    await this.productCards.nth(index).hover();
    await this.productCards.nth(index).locator(".product-overlay .add-to-cart").click();
    await this.addedToCartModal.waitFor({ state: "visible" });
    await this.viewCartLinkInModal.click();
  }
}
