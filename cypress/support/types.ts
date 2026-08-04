/**
 * Minimal shape of the RWA models we actually touch from tests. Not meant to
 * be an exhaustive mirror of vendor/cypress-realworld-app/src/models — only
 * the fields App Actions and specs rely on.
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

export interface RwaTransaction {
  id: string;
  amount: number;
  description: string;
  senderId: string;
  receiverId: string;
  status: string;
}
