import type { AeAccountPayload } from "./types";

/**
 * automationexercise.com has no `/testData/seed` backdoor (see
 * docs/adr/0003 for the RWA equivalent) — it's a shared public site, so
 * every run must create its own throwaway account rather than rely on
 * fixture users, and clean it up afterwards (see each spec's `afterEach`).
 * A timestamp + random suffix keeps concurrent CI runs from colliding on
 * "Email Address already exist!".
 */
export function uniqueEmail(prefix = "qa-poc"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}@mailinator.com`;
}

export function buildAccountPayload(overrides: Partial<AeAccountPayload> = {}): AeAccountPayload {
  const email = overrides.email ?? uniqueEmail();
  return {
    name: "QA POC",
    email,
    password: "P@ssw0rd123!",
    title: "Mr",
    birth_date: "15",
    birth_month: "6",
    birth_year: "1990",
    firstname: "QA",
    lastname: "POC",
    company: "cypress-ticket-to-report",
    address1: "1 Rue de la Qualite",
    address2: "",
    country: "France",
    zipcode: "75001",
    state: "Ile-de-France",
    city: "Paris",
    mobile_number: "0600000000",
    ...overrides,
  };
}
