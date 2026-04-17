"use client";

import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
            <VolcanoIcon />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
          {title}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-7">
          {description}
        </p>

        {children}

        {footer ? <div className="mt-4">{footer}</div> : null}
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
      <polygon points="12,2 22,20 2,20" />
      <line x1="10" y1="8" x2="14" y2="8" />
    </svg>
  );
}
