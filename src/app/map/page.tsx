"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { PARTICIPANTS, PROGRESS_DATA } from "@/lib/mapData";

// Leaflet must not be SSR-rendered
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const ALERT_LEVEL = "Watch";
const ALERT_DESCRIPTION = "Heightened unrest";

export default function MapPage() {
  const router = useRouter();

  const fieldParticipants = PARTICIPANTS.filter((p) => p.role === "field");
  const officeParticipants = PARTICIPANTS.filter((p) => p.role === "office");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-200">
      {/* ── Map area ── */}
      <div className="relative flex-1 min-w-0">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="mt-3 px-5 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-sm font-semibold text-gray-800 pointer-events-auto">
            Geofield camp P8091
          </div>
          <button
            onClick={() => router.push("/")}
            className="absolute right-4 mt-3 px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition pointer-events-auto"
          >
            Sign In
          </button>
        </div>

        {/* Volcano Alert card */}
        <div className="absolute top-14 left-4 z-10 w-56 bg-white rounded-xl shadow-lg border-l-4 border-orange-400 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-orange-500 text-lg">⚠</span>
            <span className="font-bold text-gray-900 text-sm">Volcano Alert</span>
          </div>
          <button className="mb-2 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg">
            {ALERT_LEVEL}
          </button>
          <p className="text-sm text-gray-600">{ALERT_DESCRIPTION}</p>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: <LastUpdated />
          </p>
        </div>

        {/* Map Legend card */}
        <div className="absolute bottom-6 left-4 z-10 bg-white rounded-xl shadow-lg p-4 w-56">
          <p className="font-bold text-gray-900 text-sm mb-3">Map Legend</p>

          <div className="flex items-center gap-2 mb-1.5">
            <VolcanoMiniIcon />
            <span className="text-xs text-gray-700">Cerro Machín Volcano</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <PinMiniIcon color="#EF4444" />
            <span className="text-xs text-gray-700">Field Participant</span>
          </div>

          <p className="text-xs font-semibold text-gray-500 mb-2">Data Points:</p>
          <LegendItem color="#3B82F6" label="Social & Environmental" />
          <LegendItem color="#7C3AED" label="SGI GEO (Magnetometry/Gravimetry)" />
          <LegendItem color="#22C55E" label="GIDCO (Magnetotelluric)" />
          <LegendItem color="#F97316" label="MT Acquisition (Magnetotelluric)" />
        </div>

        {/* Leaflet map */}
        <div className="absolute inset-0 z-0">
          <MapView />
        </div>
      </div>

      {/* ── Right side panel ── */}
      <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
        {/* Participants */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Field participants</p>
          <div className="flex flex-wrap gap-2">
            {fieldParticipants.map((p) => (
              <span
                key={p.name}
                className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Office participants</p>
          <div className="flex flex-wrap gap-2">
            {officeParticipants.map((p) => (
              <span
                key={p.name}
                className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Progress bars */}
        <div className="p-5 space-y-6 flex-1">
          {PROGRESS_DATA.map((item) => {
            const pct = Math.round((item.current / item.total) * 100);
            return (
              <ProgressItem
                key={item.label}
                label={item.label}
                current={item.current}
                total={item.total}
                pct={pct}
                color={item.color}
              />
            );
          })}
        </div>

        {/* Go to Dashboard */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            My Dashboard
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ── Helpers ── */

function LastUpdated() {
  return <span className="font-mono">0:41:49</span>;
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: color, border: "1.5px solid white", boxShadow: "0 0 0 1px #ccc" }}
      />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

function VolcanoMiniIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,3 21,21 3,21" />
      <circle cx="12" cy="8" r="2" fill="#1f2937" stroke="none" />
    </svg>
  );
}

function PinMiniIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
      <path d="M7 0C3.134 0 0 3.134 0 7c0 4.667 7 11 7 11s7-6.333 7-11C14 3.134 10.866 0 7 0z" fill={color} />
      <circle cx="7" cy="7" r="3" fill="white" />
    </svg>
  );
}

function ProgressItem({
  label,
  current,
  total,
  pct,
  color,
}: {
  label: string;
  current: number;
  total: number;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden">
        <div
          className={`h-full rounded-full flex items-center justify-end pr-2 ${color} transition-all`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        >
          {pct >= 10 && (
            <span className="text-white text-xs font-bold">{pct}%</span>
          )}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{current} / {total} points</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
