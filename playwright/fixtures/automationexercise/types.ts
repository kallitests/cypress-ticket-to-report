/**
 * Types for the automationexercise.com REST API — mirrors the shape of
 * `playwright/fixtures/rwa.types.ts` for the RWA suite: only the fields
 * this suite actually touches, kept as a small local contract rather than
 * `any`.
 */

/** Payload for API 11 (createAccount) / API 13 (updateAccount). */
export interface AeAccountPayload {
  name: string;
  email: string;
  password: string;
  title: "Mr" | "Mrs";
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

/** Generic envelope automationexercise's API returns on every response. */
export interface AeApiEnvelope<T = unknown> {
  responseCode: number;
  message?: string;
  products?: T;
  brands?: T;
  user?: T;
}
