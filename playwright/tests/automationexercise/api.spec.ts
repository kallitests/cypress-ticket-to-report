// API-only suite, no browser — Playwright equivalent of a future
// cypress/e2e/api/ suite (see README "Test suites" roadmap row for @api).
// One test per scenario documented on https://automationexercise.com/api_list
// (API 1 through API 14), asserting the exact response code/message the
// site's own docs promise — this is what makes it a smoke suite for the API
// itself: if any of these drift, the public contract broke.
import { test, expect } from "../../fixtures/automationexercise/api";
import { buildAccountPayload } from "../../fixtures/automationexercise/test-data";

test.describe("REST API @smoke @api", () => {
  test("API 1: GET productsList returns 200 with a products list", async ({ aeApi }) => {
    const res = await aeApi.getProductsList();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
  });

  test("API 2: POST productsList is rejected with 405", async ({ aeApi }) => {
    const res = await aeApi.postProductsList();
    const body = await res.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain("not supported");
  });

  test("API 3: GET brandsList returns 200 with a brands list", async ({ aeApi }) => {
    const res = await aeApi.getBrandsList();
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.brands)).toBe(true);
  });

  test("API 4: PUT brandsList is rejected with 405", async ({ aeApi }) => {
    const res = await aeApi.putBrandsList();
    const body = await res.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain("not supported");
  });

  test("API 5: POST searchProduct returns matching products", async ({ aeApi }) => {
    const res = await aeApi.searchProduct("top");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.responseCode).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test("API 6: POST searchProduct without search_product returns 400", async ({ aeApi }) => {
    const res = await aeApi.searchProductWithoutParam();
    const body = await res.json();
    expect(body.responseCode).toBe(400);
    expect(body.message).toContain("parameter is missing");
  });

  test("API 9: DELETE verifyLogin is rejected with 405", async ({ aeApi }) => {
    const res = await aeApi.deleteVerifyLogin();
    const body = await res.json();
    expect(body.responseCode).toBe(405);
    expect(body.message).toContain("not supported");
  });

  test("API 8: POST verifyLogin without email returns 400", async ({ aeApi }) => {
    const res = await aeApi.verifyLoginWithoutEmail("whatever-password");
    const body = await res.json();
    expect(body.responseCode).toBe(400);
    expect(body.message).toContain("parameter is missing");
  });

  test("API 10: POST verifyLogin with invalid credentials returns 404", async ({ aeApi }) => {
    const res = await aeApi.verifyLogin("does-not-exist@mailinator.com", "wrong-password");
    const body = await res.json();
    expect(body.responseCode).toBe(404);
    expect(body.message).toBe("User not found!");
  });

  test.describe("account lifecycle (API 11, 7, 14, 13, 12) — chained on one throwaway user", () => {
    test("creates, verifies, reads, updates and deletes an account end to end", async ({ aeApi }) => {
      const account = buildAccountPayload();

      // API 11: createAccount
      const created = await aeApi.createAccount(account);
      const createdBody = await created.json();
      expect(createdBody.responseCode).toBe(201);
      expect(createdBody.message).toBe("User created!");

      // API 7: verifyLogin with valid details
      const verified = await aeApi.verifyLogin(account.email, account.password);
      const verifiedBody = await verified.json();
      expect(verifiedBody.responseCode).toBe(200);
      expect(verifiedBody.message).toBe("User exists!");

      // API 14: getUserDetailByEmail
      const detail = await aeApi.getUserDetailByEmail(account.email);
      const detailBody = await detail.json();
      expect(detailBody.responseCode).toBe(200);
      expect(detailBody.user.email).toBe(account.email);

      // API 13: updateAccount
      const updated = await aeApi.updateAccount({ ...account, firstname: "QA-Updated" });
      const updatedBody = await updated.json();
      expect(updatedBody.responseCode).toBe(200);
      expect(updatedBody.message).toBe("User updated!");

      // API 12: deleteAccount
      const deleted = await aeApi.deleteAccount(account.email, account.password);
      const deletedBody = await deleted.json();
      expect(deletedBody.responseCode).toBe(200);
      expect(deletedBody.message).toBe("Account deleted!");
    });
  });
});
