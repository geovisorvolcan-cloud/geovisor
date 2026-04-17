"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_STORAGE_KEY_ACCOUNTS,
  AUTH_STORAGE_KEY_SESSION,
  SEEDED_ADMIN_EMAIL,
  SEEDED_ADMIN_PASSWORD,
  type AuthUser,
  type StoredAuthAccount,
  toAuthUser,
} from "@/lib/auth";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthActionResult {
  ok: boolean;
  error?: string;
  user?: AuthUser;
}

interface AuthContextType {
  ready: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (payload: LoginPayload) => AuthActionResult;
  register: (payload: RegisterPayload) => AuthActionResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createSeedAdmin(): StoredAuthAccount {
  return {
    id: "seed_admin",
    name: "System Administrator",
    email: SEEDED_ADMIN_EMAIL,
    password: SEEDED_ADMIN_PASSWORD,
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

function ensureSeedAdmin(accounts: StoredAuthAccount[]) {
  const hasAdmin = accounts.some(
    (account) => account.email === SEEDED_ADMIN_EMAIL && account.role === "admin"
  );

  if (hasAdmin) {
    return accounts;
  }

  return [createSeedAdmin(), ...accounts];
}

function readStoredAccounts() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY_ACCOUNTS);
    if (!raw) return ensureSeedAdmin([]);

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ensureSeedAdmin([]);

    const accounts = parsed.filter((value): value is StoredAuthAccount => {
      return (
        value &&
        typeof value === "object" &&
        typeof value.id === "string" &&
        typeof value.name === "string" &&
        typeof value.email === "string" &&
        typeof value.password === "string" &&
        (value.role === "admin" || value.role === "user") &&
        typeof value.createdAt === "string"
      );
    });

    return ensureSeedAdmin(
      accounts.map((account) => ({
        ...account,
        email: normalizeEmail(account.email),
      }))
    );
  } catch {
    return ensureSeedAdmin([]);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<StoredAuthAccount[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedAccounts = readStoredAccounts();
    setAccounts(storedAccounts);

    const sessionId = localStorage.getItem(AUTH_STORAGE_KEY_SESSION);
    if (sessionId) {
      const sessionAccount = storedAccounts.find((account) => account.id === sessionId);
      if (sessionAccount) {
        setUser(toAuthUser(sessionAccount));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY_SESSION);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(AUTH_STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts, ready]);

  useEffect(() => {
    if (!ready) return;

    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY_SESSION, user.id);
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY_SESSION);
  }, [ready, user]);

  const login = useCallback(
    ({ email, password }: LoginPayload): AuthActionResult => {
      const normalizedEmail = normalizeEmail(email);
      const account = accounts.find(
        (candidate) =>
          candidate.email === normalizedEmail && candidate.password === password
      );

      if (!account) {
        return {
          ok: false,
          error: "Invalid email or password.",
        };
      }

      const nextUser = toAuthUser(account);
      setUser(nextUser);
      return { ok: true, user: nextUser };
    },
    [accounts]
  );

  const register = useCallback(
    ({ name, email, password }: RegisterPayload): AuthActionResult => {
      const trimmedName = name.trim();
      const normalizedEmail = normalizeEmail(email);

      if (!trimmedName) {
        return { ok: false, error: "Full name is required." };
      }

      if (!normalizedEmail) {
        return { ok: false, error: "Email is required." };
      }

      if (password.trim().length < 6) {
        return {
          ok: false,
          error: "Password must be at least 6 characters.",
        };
      }

      if (accounts.some((account) => account.email === normalizedEmail)) {
        return {
          ok: false,
          error: "This email is already registered.",
        };
      }

      const account: StoredAuthAccount = {
        id: createId("auth"),
        name: trimmedName,
        email: normalizedEmail,
        password,
        role: "user",
        createdAt: new Date().toISOString(),
      };

      setAccounts((previous) => [...previous, account]);
      const nextUser = toAuthUser(account);
      setUser(nextUser);
      return { ok: true, user: nextUser };
    },
    [accounts]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        isAuthenticated: Boolean(user),
        user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
