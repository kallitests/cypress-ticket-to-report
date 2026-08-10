/**
 * Mirror of cypress/support/types.ts — only the RWA fields the Playwright
 * suite actually touches. Kept as a separate copy (not a shared import)
 * deliberately: the two suites are meant to be independently readable
 * during the coexistence period, see MIGRATION.md.
 */
export interface RwaUser {
  id: string;
  uuid: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
}
