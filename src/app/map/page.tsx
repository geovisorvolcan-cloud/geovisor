"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/appContext";
import { useAuth } from "@/lib/authContext";
import { PROGRESS_DATA, VOLCANO_ALERT } from "@/lib/mapData";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type LegendPointType =
  | "social"
  | "sgi_geo"
  | "sgi_magnetometry"
  | "sgi_gravimetry"
  | "gidco"
  | "uis_geophysics";

export default function MapPage() {
  const router = useRouter();
  const { dynamicPoints, participants, progressCounts } = useAppContext();
  const { ready, isAuthenticated, user, logout } = useAuth();
  const [clock, setClock] = useState("");
  const [sosSent, setSosSent] = useState(false);

  const fieldParticipants = participants.filter((participant) => participant.role === "field");
  const officeParticipants = participants.filter((participant) => participant.role === "office");
  const isAdmin = user?.role === "admin";
  const isRegisteredUser = user?.role === "user";

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSendSos = () => {
    if (!isRegisteredUser || sosSent) return;
    setSosSent(true);
    setTimeout(() => setSosSent(false), 5000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-200">
      <div className="relative flex-1 min-w-0">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="mt-3 px-6 py-2 bg-white/85 backdrop-blur rounded-full shadow text-xl font-bold text-gray-800 pointer-events-auto">
            Geofield camp P8091
          </div>
          <div className="absolute right-4 mt-3 flex gap-2 pointer-events-auto items-center">
            <span className="text-xs text-gray-500 font-mono bg-white/70 px-2 py-1 rounded-full">
              Cerro Machin, Tolima, Colombia
            </span>
            {ready && isAdmin ? (
              <>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
                  Administrator
                </span>
                <button
                  onClick={() => router.push("/admin")}
                  className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition"
                >
                  Admin Panel
                </button>
              </>
            ) : null}
            {ready && isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition"
              >
                Sign Out
              </button>
            ) : null}
            {ready && !isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push("/register")}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-full shadow text-xs font-semibold hover:bg-orange-600 transition"
                >
                  Register
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition"
                >
                  Sign In
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div
          className="absolute top-14 left-4 z-10 flex flex-col gap-3 w-72"
          style={{ maxHeight: "calc(100vh - 6rem - 10rem)", overflowY: "auto" }}
        >
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-yellow-400 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500 text-lg">!</span>
              <span className="font-bold text-gray-900 text-sm">Volcano Alert</span>
            </div>
            <div className="mb-2">
              <span className="inline-block bg-yellow-300 text-yellow-900 text-xs font-bold px-4 py-1 rounded-lg">
                {VOLCANO_ALERT.level}
              </span>
            </div>
            <p className="text-sm text-gray-800 font-semibold">{VOLCANO_ALERT.status}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {VOLCANO_ALERT.description}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Last updated: <span className="font-mono">{clock}</span>
            </p>
          </div>

          <AccessCard
            ready={ready}
            isAuthenticated={isAuthenticated}
            isAdmin={Boolean(isAdmin)}
            isRegisteredUser={Boolean(isRegisteredUser)}
            userName={user?.name ?? ""}
            sosSent={sosSent}
            onRegister={() => router.push("/register")}
            onSignIn={() => router.push("/")}
            onOpenAdmin={() => router.push("/admin")}
            onSendSos={handleSendSos}
          />
        </div>

        <div
          className="absolute bottom-6 left-4 z-10 flex w-72 flex-col gap-3 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 6rem)" }}
        >
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="font-bold text-gray-900 text-sm mb-3">Map Legend</p>

            <div className="flex items-center gap-2 mb-1.5">
              <VolcanoMiniIcon />
              <span className="text-xs text-gray-700">Cerro Machin Volcano</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <ParticipantMiniIcon color="#EF4444" />
              <span className="text-xs text-gray-700">Field Participant</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <ParticipantMiniIcon color="#3B82F6" />
              <span className="text-xs text-gray-700">Office Participant</span>
            </div>

            <p className="text-xs font-semibold text-gray-500 mb-2">Data Points:</p>
            <LegendPoint
              type="social"
              label="Social and environmental characterization"
            />
            <LegendPoint type="sgi_magnetometry" label="SGI GEO (Magnetometry)" />
            <LegendPoint type="sgi_gravimetry" label="SGI GEO (Gravimetry)" />
            <LegendPoint type="gidco" label="GIDCO (Magnetotelluric)" />
            <LegendPoint
              type="uis_geophysics"
              label="UIS Geophysics Team (Magnetotelluric)"
            />
          </div>
        </div>

        <div className="absolute inset-0 z-0">
          <MapView
            useSatellite={true}
            extraPoints={dynamicPoints}
            participantEntries={participants}
          />
        </div>
      </div>

      <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Field participants</p>
            <span className="text-xs text-gray-400">{fieldParticipants.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {fieldParticipants.map((participant) => (
              <span
                key={participant.id}
                className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {participant.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Office participants</p>
            <span className="text-xs text-gray-400">{officeParticipants.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {officeParticipants.map((participant) => (
              <span
                key={participant.id}
                className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {participant.name}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {PROGRESS_DATA.map((item) => {
            const current = progressCounts[item.label] ?? item.current;
            return (
              <ProgressSummaryItem
                key={item.label}
                label={item.label}
                current={current}
                total={item.total}
                color={item.color}
              />
            );
          })}
        </div>

        <div className="p-5 border-t border-gray-100">
          {ready && isAdmin ? (
            <button
              onClick={() => router.push("/admin")}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
            >
              Open Admin Panel
            </button>
          ) : null}
          {ready && isRegisteredUser ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold text-gray-700">Registered access</p>
              <p className="text-xs text-gray-500 mt-1">
                Signed in as {user?.name}. Map editing remains restricted to administrators.
              </p>
            </div>
          ) : null}
          {ready && !isAuthenticated ? (
            <button
              onClick={() => router.push("/register")}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
            >
              Register To Send Alerts
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function AccessCard({
  ready,
  isAuthenticated,
  isAdmin,
  isRegisteredUser,
  userName,
  sosSent,
  onRegister,
  onSignIn,
  onOpenAdmin,
  onSendSos,
}: {
  ready: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRegisteredUser: boolean;
  userName: string;
  sosSent: boolean;
  onRegister: () => void;
  onSignIn: () => void;
  onOpenAdmin: () => void;
  onSendSos: () => void;
}) {
  if (!ready) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4">
        <p className="text-sm font-semibold text-gray-900">Access</p>
        <p className="text-xs text-gray-500 mt-2">Checking current session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4">
        <p className="text-sm font-semibold text-gray-900">Public map access</p>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
          Visitors can view the map. Registered users can send emergency alerts, and only
          administrators can manage participants.
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onRegister}
            className="flex-1 rounded-lg bg-orange-500 text-white text-xs font-semibold py-2 hover:bg-orange-600 transition"
          >
            Register
          </button>
          <button
            onClick={onSignIn}
            className="flex-1 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold py-2 hover:bg-gray-50 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-400">
        <p className="text-sm font-semibold text-gray-900">Administrator session</p>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">
          Signed in as {userName}. Participant editing and field or office role changes are
          available only in the administrator panel.
        </p>
        <button
          onClick={onOpenAdmin}
          className="w-full mt-4 rounded-lg bg-gray-900 text-white text-xs font-semibold py-2 hover:bg-gray-700 transition"
        >
          Open Admin Panel
        </button>
      </div>
    );
  }

  if (isRegisteredUser) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 text-lg">!</span>
          <h2 className="text-sm font-semibold text-gray-900">Emergency Alert</h2>
        </div>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Signed in as {userName}. You can view the map and emit an SOS alert if an emergency
          occurs in the field.
        </p>
        <button
          onClick={onSendSos}
          disabled={sosSent}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-xs transition ${
            sosSent
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 active:scale-95"
          }`}
        >
          {sosSent ? "ALERT SENT" : "SEND SOS ALERT"}
        </button>
      </div>
    );
  }

  return null;
}

function ProgressSummaryItem({
  label,
  current,
  total,
  color,
}: {
  label: string;
  current: number;
  total: number;
  color: string;
}) {
  const boundedCurrent = Math.min(total, Math.max(0, current));
  const percent = total > 0 ? Math.round((boundedCurrent / total) * 100) : 0;
  const fillWidth = percent === 0 ? 0 : Math.max(percent, 2);

  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center justify-end pr-2"
          style={{
            width: `${fillWidth}%`,
            backgroundColor: color,
          }}
        >
          {percent >= 10 ? (
            <span className="text-white text-xs font-bold">{percent}%</span>
          ) : null}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>
          {boundedCurrent} / {total} points
        </span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}

function PointTypeIcon({ type }: { type: LegendPointType }) {
  if (type === "uis_geophysics") {
    return (
      <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" fill="#F97316" stroke="white" strokeWidth="1.5" />
          <ellipse cx="10" cy="10" rx="3.2" ry="8" stroke="white" strokeWidth="1" opacity="0.85" />
          <path d="M3 10H17" stroke="white" strokeWidth="1" opacity="0.85" />
          <path d="M5 6.8H15M5 13.2H15" stroke="white" strokeWidth="0.9" opacity="0.75" />
        </svg>
      </span>
    );
  }

  if (
    type === "sgi_geo" ||
    type === "sgi_magnetometry" ||
    type === "sgi_gravimetry"
  ) {
    const color = type === "sgi_gravimetry" ? "#EC4899" : "#D946EF";
    return (
      <span className="relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center">
        <span
          className="absolute h-5 w-5 rounded-full animate-ping"
          style={{ backgroundColor: `${color}4d` }}
        />
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="relative">
          <path d="M10 2.5L18 17H2L10 2.5Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  const color = type === "gidco" ? "#22C55E" : "#3B82F6";
  return (
    <span className="relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center">
      <span
        className="absolute h-5 w-5 rounded-full animate-ping"
        style={{ backgroundColor: `${color}4d` }}
      />
      <span
        className="relative h-3.5 w-3.5 rounded-full border-2 border-white shadow"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function LegendPoint({
  type,
  label,
}: {
  type: LegendPointType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <PointTypeIcon type={type} />
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

function ParticipantMiniIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill={color} />
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}
