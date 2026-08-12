import { test as base, expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import type { AeAccountPayload } from "./types";

/**
 * `aeApi` fixture — automationexercise.com equivalent of the RWA `db`
 * fixture (`playwright/fixtures/api.ts`): a thin `test.extend` wrapper
 * around Playwright's `request` context, one method per documented
 * scenario on https://automationexercise.com/api_list (API 1 to API 14).
 *
 * Unlike RWA, there is no local seed/reset endpoint here — this is a public
 * third-party site, so `createAccount`/`deleteAccount` double as this
 * suite's own setup/teardown (see playwright/tests/automationexercise/api.spec.ts).
 */
export interface AeApiActions {
  getProductsList(): Promise<APIResponse>;
  postProductsList(): Promise<APIResponse>;
  getBrandsList(): Promise<APIResponse>;
  putBrandsList(): Promise<APIResponse>;
  searchProduct(searchTerm: string): Promise<APIResponse>;
  searchProductWithoutParam(): Promise<APIResponse>;
  verifyLogin(email: string, password: string): Promise<APIResponse>;
  verifyLoginWithoutEmail(password: string): Promise<APIResponse>;
  deleteVerifyLogin(): Promise<APIResponse>;
  createAccount(payload: AeAccountPayload): Promise<APIResponse>;
  deleteAccount(email: string, password: string): Promise<APIResponse>;
  updateAccount(payload: AeAccountPayload): Promise<APIResponse>;
  getUserDetailByEmail(email: string): Promise<APIResponse>;
}

function makeAeApiActions(request: APIRequestContext): AeApiActions {
  return {
    getProductsList: () => request.get("/api/productsList"),

    postProductsList: () => request.post("/api/productsList"),

    getBrandsList: () => request.get("/api/brandsList"),

    putBrandsList: () => request.put("/api/brandsList"),

    searchProduct: (search_product: string) =>
      request.post("/api/searchProduct", { form: { search_product } }),

    searchProductWithoutParam: () => request.post("/api/searchProduct"),

    verifyLogin: (email: string, password: string) =>
      request.post("/api/verifyLogin", { form: { email, password } }),

    verifyLoginWithoutEmail: (password: string) =>
      request.post("/api/verifyLogin", { form: { password } }),

    deleteVerifyLogin: () => request.delete("/api/verifyLogin"),

    createAccount: (payload: AeAccountPayload) =>
      request.post("/api/createAccount", { form: { ...payload } }),

    deleteAccount: (email: string, password: string) =>
      request.delete("/api/deleteAccount", { form: { email, password } }),

    updateAccount: (payload: AeAccountPayload) =>
      request.put("/api/updateAccount", { form: { ...payload } }),

    getUserDetailByEmail: (email: string) =>
      request.get("/api/getUserDetailByEmail", { params: { email } }),
  };
}

export const test = base.extend<{ aeApi: AeApiActions }>({
  aeApi: async ({ request }, use) => {
    await use(makeAeApiActions(request));
  },
});

export { expect };
