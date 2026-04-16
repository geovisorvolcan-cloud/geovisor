"use client";

import { AppProvider } from "@/lib/appContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
