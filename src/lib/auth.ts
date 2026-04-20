export type AuthRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  createdAt: string;
}

export const AUTH_STORAGE_KEY_SESSION = "geovisor_auth_session";

export const SEEDED_ADMIN_EMAIL = "admin@geovisor.com";
export const SEEDED_ADMIN_PASSWORD = "admin1234";

export function getRouteForRole(role: AuthRole) {
  return role === "admin" ? "/admin" : "/map";
}
