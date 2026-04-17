export type AuthRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  createdAt: string;
}

export interface StoredAuthAccount extends AuthUser {
  password: string;
}

export const AUTH_STORAGE_KEY_ACCOUNTS = "geovisor_auth_accounts";
export const AUTH_STORAGE_KEY_SESSION = "geovisor_auth_session";

export const SEEDED_ADMIN_EMAIL = "admin@geovisor.com";
export const SEEDED_ADMIN_PASSWORD = "admin1234";

export function getRouteForRole(role: AuthRole) {
  return role === "admin" ? "/admin" : "/map";
}

export function toAuthUser(account: StoredAuthAccount): AuthUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    createdAt: account.createdAt,
  };
}
