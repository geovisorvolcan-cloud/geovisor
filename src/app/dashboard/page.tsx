"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRouteForRole } from "@/lib/auth";
import { useAuth } from "@/lib/authContext";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated || !user) {
      router.replace("/");
      return;
    }

    router.replace(getRouteForRole(user.role));
  }, [isAuthenticated, ready, router, user]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-gray-500">
      Redirecting...
    </div>
  );
}
