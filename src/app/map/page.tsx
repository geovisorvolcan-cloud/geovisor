"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppContext } from "@/lib/appContext";
import { PROGRESS_DATA, VOLCANO_ALERT } from "@/lib/mapData";
import ProgressAdjustItem from "@/components/ProgressAdjustItem";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type PendingParticipant = {
  role: "field" | "office";
  name: string;
  emergencyContact?: {
    name: string;
    affiliation: string;
    phone: string;
  };
};

export default function MapPage() {
  const router = useRouter();
  const {
    dynamicPoints,
    participants,
    addParticipant,
    removeParticipant,
    progressCounts,
    adjustProgress,
  } = useAppContext();

  const fieldParticipants = participants.filter((p) => p.role === "field");
  const officeParticipants = participants.filter((p) => p.role === "office");
  const [fieldRemoveMode, setFieldRemoveMode] = useState(false);
  const [officeRemoveMode, setOfficeRemoveMode] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showAddOffice, setShowAddOffice] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactAffiliation, setEmergencyContactAffiliation] =
    useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [participantError, setParticipantError] = useState("");
  const [pendingParticipant, setPendingParticipant] =
    useState<PendingParticipant | null>(null);

  // Live clock
  const [clock, setClock] = useState("");
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
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const resetParticipantForm = () => {
    setParticipantName("");
    setEmergencyContactName("");
    setEmergencyContactAffiliation("");
    setEmergencyContactPhone("");
    setParticipantError("");
  };

  const handleAddParticipant = (role: "field" | "office") => {
    setParticipantError("");

    if (!participantName.trim()) {
      setParticipantError("Participant name is required.");
      return;
    }

    const needsEmergencyContact = role === "field";

    if (
      needsEmergencyContact &&
      (!emergencyContactName.trim() ||
        !emergencyContactAffiliation.trim() ||
        !emergencyContactPhone.trim())
    ) {
      setParticipantError("Complete the emergency contact rows.");
      return;
    }

    setPendingParticipant({
      name: participantName.trim(),
      role,
      emergencyContact: needsEmergencyContact
        ? {
            name: emergencyContactName.trim(),
            affiliation: emergencyContactAffiliation.trim(),
            phone: emergencyContactPhone.trim(),
          }
        : undefined,
    });

    resetParticipantForm();
    setShowAddField(false);
    setShowAddOffice(false);
  };

  const handleMapPlacement = (position: [number, number]) => {
    if (!pendingParticipant) return;

    addParticipant({
      ...pendingParticipant,
      position,
    });
    setPendingParticipant(null);
  };

  const handleRemoveParticipant = (id: string, role: "field" | "office") => {
    removeParticipant(id);
    if (role === "field") setFieldRemoveMode(false);
    if (role === "office") setOfficeRemoveMode(false);
  };

  const toggleAddField = () => {
    resetParticipantForm();
    setShowAddField((value) => !value);
    setShowAddOffice(false);
    setFieldRemoveMode(false);
    setOfficeRemoveMode(false);
    setPendingParticipant(null);
  };

  const toggleAddOffice = () => {
    resetParticipantForm();
    setShowAddOffice((value) => !value);
    setShowAddField(false);
    setFieldRemoveMode(false);
    setOfficeRemoveMode(false);
    setPendingParticipant(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-200">
      {/* ── Map area ── */}
      <div className="relative flex-1 min-w-0">

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="mt-3 px-6 py-2 bg-white/85 backdrop-blur rounded-full shadow text-xl font-bold text-gray-800 pointer-events-auto">
            Geofield camp P8091
          </div>
          <div className="absolute right-4 mt-3 flex gap-2 pointer-events-auto items-center">
            <span className="text-xs text-gray-500 font-mono bg-white/70 px-2 py-1 rounded-full">
              Cerro Machín, Tolima, Colombia
            </span>
            <button
              onClick={() => router.push("/")}
              className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Volcano Alert card */}
        <div className="absolute top-14 left-4 z-10 w-72 bg-white rounded-xl shadow-lg border-l-4 border-yellow-400 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-lg">⚠</span>
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

        {/* Map Legend card */}
        <div className="absolute bottom-6 left-4 z-10 bg-white rounded-xl shadow-lg p-4 w-72">
          <p className="font-bold text-gray-900 text-sm mb-3">Map Legend</p>

          <div className="flex items-center gap-2 mb-1.5">
            <VolcanoMiniIcon />
            <span className="text-xs text-gray-700">Cerro Machín Volcano</span>
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

        {/* Help */}
        <button className="absolute bottom-6 right-2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 font-bold text-sm hover:bg-gray-50 transition border border-gray-100">
          ?
        </button>

        {showAddField && (
          <ParticipantFormOverlay
            title="Add Field Participant"
            top="5.5rem"
            accentColor="#EF4444"
            participantName={participantName}
            setParticipantName={setParticipantName}
            emergencyContactName={emergencyContactName}
            setEmergencyContactName={setEmergencyContactName}
            emergencyContactAffiliation={emergencyContactAffiliation}
            setEmergencyContactAffiliation={setEmergencyContactAffiliation}
            emergencyContactPhone={emergencyContactPhone}
            setEmergencyContactPhone={setEmergencyContactPhone}
            participantError={participantError}
            showEmergencyContact
            onAdd={() => handleAddParticipant("field")}
            onCancel={() => {
              setShowAddField(false);
              resetParticipantForm();
            }}
          />
        )}

        {showAddOffice && (
          <ParticipantFormOverlay
            title="Add Office Participant"
            top="11rem"
            accentColor="#3B82F6"
            participantName={participantName}
            setParticipantName={setParticipantName}
            emergencyContactName={emergencyContactName}
            setEmergencyContactName={setEmergencyContactName}
            emergencyContactAffiliation={emergencyContactAffiliation}
            setEmergencyContactAffiliation={setEmergencyContactAffiliation}
            emergencyContactPhone={emergencyContactPhone}
            setEmergencyContactPhone={setEmergencyContactPhone}
            participantError={participantError}
            showEmergencyContact={false}
            onAdd={() => handleAddParticipant("office")}
            onCancel={() => {
              setShowAddOffice(false);
              resetParticipantForm();
            }}
          />
        )}

        {pendingParticipant && (
          <div className="absolute top-14 right-4 z-20 bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs text-gray-600">
            click on the map to place {pendingParticipant.name}
          </div>
        )}

        {/* Satellite map with dynamic points */}
        <div className="absolute inset-0 z-0">
          <MapView
            useSatellite={true}
            extraPoints={dynamicPoints}
            participantEntries={participants}
            onMapClick={pendingParticipant ? handleMapPlacement : undefined}
            isPickingLocation={Boolean(pendingParticipant)}
          />
        </div>
      </div>

      {/* ── Right side panel ── */}
      <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">

        {/* Field participants */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Field participants</p>
            <div className="flex gap-1.5">
              <button
                onClick={toggleAddField}
                title="Add field participant"
                className={`w-7 h-7 rounded-full border border-gray-300 bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center transition hover:bg-gray-300 ${
                  showAddField ? "ring-2 ring-gray-300" : ""
                }`}
              >
                +
              </button>
              <button
                onClick={() => {
                  setFieldRemoveMode((value) => !value);
                  setOfficeRemoveMode(false);
                  setShowAddField(false);
                  setShowAddOffice(false);
                  setPendingParticipant(null);
                }}
                title="Remove field participant"
                className={`w-7 h-7 rounded-full border border-gray-300 bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center transition hover:bg-gray-300 ${
                  fieldRemoveMode ? "ring-2 ring-gray-300" : ""
                }`}
              >
                -
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {fieldParticipants.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  fieldRemoveMode && handleRemoveParticipant(p.id, "field")
                }
                className={`bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full transition ${
                  fieldRemoveMode
                    ? "ring-2 ring-red-300 hover:bg-red-700"
                    : "cursor-default"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          {fieldRemoveMode && (
            <p className="mt-2 text-gray-400" style={{ fontSize: "10px" }}>
              click on a participant to remove
            </p>
          )}
        </div>

        {/* Office participants */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Office participants</p>
            <div className="flex gap-1.5">
              <button
                onClick={toggleAddOffice}
                title="Add office participant"
                className={`w-7 h-7 rounded-full border border-gray-300 bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center transition hover:bg-gray-300 ${
                  showAddOffice ? "ring-2 ring-gray-300" : ""
                }`}
              >
                +
              </button>
              <button
                onClick={() => {
                  setOfficeRemoveMode((value) => !value);
                  setFieldRemoveMode(false);
                  setShowAddOffice(false);
                  setShowAddField(false);
                  setPendingParticipant(null);
                }}
                title="Remove office participant"
                className={`w-7 h-7 rounded-full border border-gray-300 bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center transition hover:bg-gray-300 ${
                  officeRemoveMode ? "ring-2 ring-gray-300" : ""
                }`}
              >
                -
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {officeParticipants.map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  officeRemoveMode && handleRemoveParticipant(p.id, "office")
                }
                className={`bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full transition ${
                  officeRemoveMode
                    ? "ring-2 ring-blue-300 hover:bg-blue-700"
                    : "cursor-default"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          {officeRemoveMode && (
            <p className="mt-2 text-gray-400" style={{ fontSize: "10px" }}>
              click on a participant to remove
            </p>
          )}
        </div>

        {/* Progress bars */}
        <div className="p-5 space-y-5 flex-1">
          {PROGRESS_DATA.map((item) => {
            const current = progressCounts[item.label] ?? item.current;
            return (
              <ProgressAdjustItem
                key={item.label}
                label={item.label}
                current={current}
                total={item.total}
                color={item.color}
                onAdjust={(delta) =>
                  adjustProgress(item.label, delta, item.total)
                }
              />
            );
          })}
        </div>

        {/* Sign in to manage */}
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

type LegendPointType =
  | "social"
  | "sgi_geo"
  | "sgi_magnetometry"
  | "sgi_gravimetry"
  | "gidco"
  | "uis_geophysics";

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

function ParticipantFormOverlay({
  title,
  top,
  accentColor,
  participantName,
  setParticipantName,
  emergencyContactName,
  setEmergencyContactName,
  emergencyContactAffiliation,
  setEmergencyContactAffiliation,
  emergencyContactPhone,
  setEmergencyContactPhone,
  participantError,
  showEmergencyContact,
  onAdd,
  onCancel,
}: {
  title: string;
  top: string;
  accentColor: string;
  participantName: string;
  setParticipantName: (value: string) => void;
  emergencyContactName: string;
  setEmergencyContactName: (value: string) => void;
  emergencyContactAffiliation: string;
  setEmergencyContactAffiliation: (value: string) => void;
  emergencyContactPhone: string;
  setEmergencyContactPhone: (value: string) => void;
  participantError: string;
  showEmergencyContact: boolean;
  onAdd: () => void;
  onCancel: () => void;
}) {
  const inputClass =
    "w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400";

  return (
    <div
      className="absolute z-20 bg-white rounded-xl shadow-2xl p-4 w-64 border border-gray-100"
      style={{ right: "21rem", top }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-sm text-gray-900">{title}</p>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          x
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Participant name
          </label>
          <input
            type="text"
            value={participantName}
            onChange={(event) => setParticipantName(event.target.value)}
            placeholder="Full name"
            className={inputClass}
          />
        </div>

        {showEmergencyContact && (
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Emergency contact
            </p>
            <div className="space-y-1.5">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Name of emergency contact
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(event) =>
                    setEmergencyContactName(event.target.value)
                  }
                  placeholder="Contact name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Filiation
                </label>
                <input
                  type="text"
                  value={emergencyContactAffiliation}
                  onChange={(event) =>
                    setEmergencyContactAffiliation(event.target.value)
                  }
                  placeholder="Institution / team"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Telephone
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(event) =>
                    setEmergencyContactPhone(event.target.value)
                  }
                  placeholder="+57 300 000 0000"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {participantError && (
          <p className="text-red-500 text-xs">{participantError}</p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onAdd}
            disabled={!participantName.trim()}
            className="flex-1 text-white text-xs font-bold py-1.5 rounded-lg transition disabled:opacity-40"
            style={{ backgroundColor: accentColor }}
          >
            Add
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 text-xs font-medium py-1.5 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
