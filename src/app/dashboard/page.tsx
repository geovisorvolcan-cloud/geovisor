"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MOCK_USER = {
  name: "Ana",
  status: "Active",
  location: "Santiago, Chile",
  volcanoAlert: "Yellow",
};

const AUTH_ROLE_KEY = "geovisor_auth_role";

export default function DashboardPage() {
  const router = useRouter();
  const [statusText, setStatusText] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [sosSent, setSosSent] = useState(false);

  // Format elapsed time as H:MM:SS
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60)
        .toString()
        .padStart(2, "0");
      const s = (elapsed % 60).toString().padStart(2, "0");
      setLastUpdate(`${h}:${m}:${s}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = () => {
    if (!statusText.trim()) return;
    setStatusText("");
    // In a real app, POST to backend
    alert(`Status updated: "${statusText}"`);
  };

  const handleSOS = () => {
    setSosSent(true);
    // In a real app, trigger emergency notification
    setTimeout(() => setSosSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Dashboard</h1>
          <p className="text-sm text-gray-500">Monitor your activity and safety status</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/map")}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <MapPinIcon />
            View Map
          </button>
          <button
            onClick={() => {
              localStorage.removeItem(AUTH_ROLE_KEY);
              router.push("/");
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Status Update */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Status Update</h2>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
            rows={3}
            placeholder="What are you doing at the moment? (e.g., Taking measurements at Station Alpha, Moving to next location, etc.)"
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
          />
          <div className="flex justify-end gap-3 mt-3">
            <button
              onClick={() => setStatusText("")}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Clear
            </button>
            <button
              onClick={handleUpdateStatus}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
            >
              <SendIcon />
              Update Status
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emergency SOS */}
          <section className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-500 text-lg">⚠</span>
              <h2 className="text-base font-semibold text-gray-900">Emergency SOS</h2>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Press the SOS button if you are in an emergency situation. This will immediately
              notify all emergency contacts and send your last known location.
            </p>
            <button
              onClick={handleSOS}
              disabled={sosSent}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition ${
                sosSent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 active:scale-95"
              }`}
            >
              <span className="text-base">⚠</span>
              {sosSent ? "SOS SIGNAL SENT" : "SEND SOS SIGNAL"}
            </button>
          </section>

          {/* Current Information */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Current Information</h2>
            <dl className="space-y-3">
              <InfoRow label="Status" value={MOCK_USER.status} valueColor="text-green-600" />
              <InfoRow label="Last Update" value={lastUpdate} mono />
              <InfoRow label="Location" value={MOCK_USER.location} />
              <InfoRow
                label="Volcano Alert"
                value={MOCK_USER.volcanoAlert}
                valueColor="text-orange-500"
              />
            </dl>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function InfoRow({
  label,
  value,
  valueColor,
  mono,
}: {
  label: string;
  value: string;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
      <dt className="text-sm text-gray-500">{label}:</dt>
      <dd className={`text-sm font-semibold ${valueColor ?? "text-gray-800"} ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
