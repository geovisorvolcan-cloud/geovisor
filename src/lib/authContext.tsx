"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AUTH_STORAGE_KEY_SESSION, type AuthUser } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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
  token: string | null;
  login: (payload: LoginPayload) => Promise<AuthActionResult>;
  register: (payload: RegisterPayload) => Promise<AuthActionResult>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapRole(backendRole: string): "admin" | "user" {
  return backendRole === "admin" ? "admin" : "user";
}

function mapBackendUser(data: Record<string, unknown>): AuthUser {
  return {
    id: String(data.id ?? data._id ?? ""),
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    role: mapRole(String(data.role ?? "")),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEY_SESSION);
    if (!storedToken) {
      setReady(true);
      return;
    }

    fetch(`${API_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          setToken(storedToken);
          setUser(mapBackendUser(data));
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY_SESSION);
        }
      })
      .catch(() => localStorage.removeItem(AUTH_STORAGE_KEY_SESSION))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async ({ email, password }: LoginPayload): Promise<AuthActionResult> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Invalid email or password." };
      }

      const nextUser = mapBackendUser(data.user);
      setToken(data.token);
      setUser(nextUser);
      localStorage.setItem(AUTH_STORAGE_KEY_SESSION, data.token);
      return { ok: true, user: nextUser };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(async ({ name, email, password }: RegisterPayload): Promise<AuthActionResult> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Unable to create account." };
      }

      const nextUser = mapBackendUser(data.user);
      setToken(data.token);
      setUser(nextUser);
      localStorage.setItem(AUTH_STORAGE_KEY_SESSION, data.token);
      return { ok: true, user: nextUser };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY_SESSION);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        isAuthenticated: Boolean(user),
        user,
        token,
        login,
        register,
        logout,
        updateUser,
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
