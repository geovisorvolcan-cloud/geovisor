"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import {
  SEEDED_ADMIN_EMAIL,
  SEEDED_ADMIN_PASSWORD,
  getRouteForRole,
} from "@/lib/auth";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
  const router = useRouter();
  const { ready, isAuthenticated, user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !isAuthenticated || !user) return;
    router.replace(getRouteForRole(user.role));
  }, [isAuthenticated, ready, router, user]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const result = await login({ email, password });
    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }

    setError("");
    router.push(getRouteForRole(result.user?.role ?? "user"));
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-gray-500">
        Checking access...
      </div>
    );
  }

  return (
    <AuthCard
      title="Geophysical Monitoring System"
      description="Sign in to access registered-user monitoring tools"
      footer={
        <>
          <button
            onClick={() => router.push("/register")}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Create Account
          </button>
          <button
            onClick={() => router.push("/map")}
            className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            View Public Map
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Admin access: {SEEDED_ADMIN_EMAIL} / {SEEDED_ADMIN_PASSWORD}
          </p>
        </>
      }
    >
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {error ? <p className="text-red-500 text-xs">{error}</p> : null}

        <button
          type="submit"
          className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          Sign In
        </button>
      </form>
    </AuthCard>
  );
}
