"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_ROLE_KEY = "geovisor_auth_role";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    // Mock auth: admin emails go to admin panel, others to dashboard
    if (email.toLowerCase().includes("admin")) {
      localStorage.setItem(AUTH_ROLE_KEY, "admin");
      router.push("/admin");
    } else {
      localStorage.setItem(AUTH_ROLE_KEY, "viewer");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <VolcanoIcon />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
          Geophysical Monitoring System
        </h1>
        <p className="text-sm text-gray-500 text-center mb-7">
          Sign in to access your monitoring dashboard
        </p>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <button
          onClick={() => router.push("/map")}
          className="w-full mt-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          View Public Map
        </button>
        <p className="text-center text-xs text-gray-400 mt-1">
          Administrators sign in with an email containing admin.
        </p>
      </div>
    </div>
  );
}

function VolcanoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Mountain / volcano shape */}
      <polygon points="12,2 22,20 2,20" />
      {/* Crater opening */}
      <line x1="10" y1="8" x2="14" y2="8" />
    </svg>
  );
}
