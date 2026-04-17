"use client";

import { AppProvider } from "@/lib/appContext";
import { AuthProvider } from "@/lib/authContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>{children}</AppProvider>
    </AuthProvider>
  );
}
