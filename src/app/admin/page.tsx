"use client";

import { useState, useCallback, useEffect, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAppContext, DynamicPointType } from "@/lib/appContext";
import { useAuth } from "@/lib/authContext";
import { PROGRESS_DATA, VOLCANO_ALERT } from "@/lib/mapData";
import ProgressAdjustItem from "@/components/ProgressAdjustItem";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type TeamOption = { value: DynamicPointType; label: string };
const TEAM_OPTIONS: TeamOption[] = [
  { value: "gidco", label: "GIDCO (Magnetotelluric)" },
  {
    value: "uis_geophysics",
    label: "UIS Geophysics Team (Magnetotelluric)",
  },
  { value: "sgi_gravimetry", label: "SGI GEO (Gravimetry)" },
  { value: "sgi_magnetometry", label: "SGI GEO (Magnetometry)" },
  {
    value: "social",
    label: "Social and environmental characterization",
  },
];

const POINT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]*$/;

type PendingParticipant = {
  role: "field" | "office";
  name: string;
  emergencyContact?: {
    name: string;
    affiliation: string;
    phone: string;
  };
};

function parsePosition(latValue: string, lngValue: string) {
  const rawLatitude = latValue.trim();
  const rawLongitude = lngValue.trim();

  if (!rawLatitude) return { error: "Latitude is required." };
  if (!rawLongitude) return { error: "Longitude is required." };

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { error: "Latitude must be a number between -90 and 90." };
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { error: "Longitude must be a number between -180 and 180." };
  }

  return { position: [latitude, longitude] as [number, number] };
}

function getPointTypeLabel(type: DynamicPointType) {
  if (type === "sgi_geo") return "SGI GEO (Magnetometry)";
  return TEAM_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { ready, isAuthenticated, user, logout } = useAuth();
  const {
    dynamicPoints,
    addDynamicPoint,
    removeDynamicPoint,
    participants,
    addParticipant,
    removeParticipant,
    updateParticipantRole,
    progressCounts,
    adjustProgress,
  } = useAppContext();

  // ── Add-point form ─────────────────────────────────────────────────────
  const [team, setTeam] = useState<DynamicPointType>("gidco");
  const [pointName, setPointName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [addPointError, setAddPointError] = useState("");
  const [addPointSuccess, setAddPointSuccess] = useState(false);

  // ── Participant panel state ─────────────────────────────────────────────
  const [fieldRemoveMode, setFieldRemoveMode] = useState(false);
  const [officeRemoveMode, setOfficeRemoveMode] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showAddOffice, setShowAddOffice] = useState(false);

  // ── Add-participant form (shared fields, reset on toggle) ───────────────
  const [pName, setPName] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactAffiliation, setEmergencyContactAffiliation] =
    useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [participantError, setParticipantError] = useState("");
  const [pendingParticipant, setPendingParticipant] =
    useState<PendingParticipant | null>(null);

  const fieldParticipants = participants.filter((p) => p.role === "field");
  const officeParticipants = participants.filter((p) => p.role === "office");
  const hasAdminAccess = ready && isAuthenticated && user?.role === "admin";

  // ── Clock ───────────────────────────────────────────────────────────────
  const [clock, setClock] = useState("");
  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (user?.role !== "admin") {
      router.replace("/map");
    }
  }, [isAuthenticated, ready, router, user]);

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

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddPoint = useCallback(() => {
    setAddPointError("");
    setAddPointSuccess(false);

    const name = pointName.trim();
    if (!name) return setAddPointError("Point name is required.");
    if (!POINT_NAME_PATTERN.test(name)) {
      return setAddPointError(
        "Name: use letters, numbers, spaces and '-' only."
      );
    }

    const parsed = parsePosition(lat, lng);
    if (parsed.error) return setAddPointError(parsed.error);

    addDynamicPoint({
      type: team,
      name,
      position: parsed.position!,
      description: description.trim() || undefined,
    });

    setPointName("");
    setLat("");
    setLng("");
    setDescription("");
    setAddPointSuccess(true);
    setTimeout(() => setAddPointSuccess(false), 2000);
  }, [team, pointName, lat, lng, description, addDynamicPoint]);

  const resetParticipantForm = useCallback(() => {
    setPName("");
    setEmergencyContactName("");
    setEmergencyContactAffiliation("");
    setEmergencyContactPhone("");
    setParticipantError("");
  }, []);

  const handleAddParticipant = useCallback(
    (role: "field" | "office") => {
      setParticipantError("");
      if (!pName.trim()) {
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

      const participant = {
        name: pName.trim(),
        role,
        emergencyContact: needsEmergencyContact
          ? {
              name: emergencyContactName.trim(),
              affiliation: emergencyContactAffiliation.trim(),
              phone: emergencyContactPhone.trim(),
            }
          : undefined,
      };

      if (role === "office") {
        addParticipant(participant);
        resetParticipantForm();
        setShowAddOffice(false);
        setPendingParticipant(null);
        return;
      }

      setPendingParticipant(participant);

      resetParticipantForm();
      if (role === "field") setShowAddField(false);
    },
    [
      addParticipant,
      pName,
      emergencyContactName,
      emergencyContactAffiliation,
      emergencyContactPhone,
      resetParticipantForm,
    ]
  );

  const handleMapPlacement = useCallback(
    (position: [number, number]) => {
      if (!pendingParticipant) return;

      addParticipant({
        ...pendingParticipant,
        position,
      });
      setPendingParticipant(null);
    },
    [pendingParticipant, addParticipant]
  );

  const handleRemoveParticipant = (id: string, role: "field" | "office") => {
    removeParticipant(id);
    if (role === "field") setFieldRemoveMode(false);
    if (role === "office") setOfficeRemoveMode(false);
  };

  const handleSwitchParticipantRole = useCallback(
    (id: string, role: "field" | "office") => {
      updateParticipantRole(id, role);
      setFieldRemoveMode(false);
      setOfficeRemoveMode(false);
      setShowAddField(false);
      setShowAddOffice(false);
      setPendingParticipant(null);
    },
    [updateParticipantRole]
  );

  const toggleAddField = () => {
    resetParticipantForm();
    setShowAddField((v) => !v);
    setShowAddOffice(false);
    setFieldRemoveMode(false);
    setOfficeRemoveMode(false);
    setPendingParticipant(null);
  };

  const toggleAddOffice = () => {
    resetParticipantForm();
    setShowAddOffice((v) => !v);
    setShowAddField(false);
    setFieldRemoveMode(false);
    setOfficeRemoveMode(false);
    setPendingParticipant(null);
  };

  if (!ready || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-sm text-gray-600">
        Checking administrator access...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-200">

      {/* ══════════════════ MAP AREA ══════════════════ */}
      <div className="relative flex-1 min-w-0">

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="mt-3 px-6 py-2 bg-white/85 backdrop-blur rounded-full shadow text-xl font-bold text-gray-800 pointer-events-auto">
            Geofield camp P8091
          </div>
          <div className="absolute right-4 mt-3 flex gap-2 pointer-events-auto items-center">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
              Admin Panel
            </span>
            <span className="text-xs text-gray-500 font-mono bg-white/70 px-2 py-1 rounded-full">
              Cerro Machín, Tolima, Colombia
            </span>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Left overlay column ── */}
        <div className="absolute top-14 left-4 z-10 flex flex-col gap-3 w-72" style={{ maxHeight: "calc(100vh - 6rem - 10rem)", overflowY: "auto" }}>

          {/* Volcano Alert */}
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-yellow-400 p-4">
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

        </div>

        {/* Add point + Map Legend – bottom left */}
        <div
          className="absolute bottom-6 left-4 z-10 flex w-72 flex-col gap-3 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 6rem)" }}
        >
          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="font-bold text-gray-900 text-sm mb-3">Add New Point</p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Label
                </label>
                <div className="flex items-center gap-2">
                  <PointTypeIcon type={team} animated />
                  <select
                    value={team}
                    onChange={(e) => setTeam(e.target.value as DynamicPointType)}
                    className="min-w-0 flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                  >
                    {TEAM_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Point name (alphanumeric)
                </label>
                <input
                  type="text"
                  value={pointName}
                  onChange={(e) => setPointName(e.target.value)}
                  placeholder="Point A1"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="4.49"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="-75.39"
                  className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="w-full resize-none text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                />
              </div>

              {addPointError && (
                <p className="text-red-500 text-xs">{addPointError}</p>
              )}
              {addPointSuccess && (
                <p className="text-green-600 text-xs font-medium">Point added to map.</p>
              )}

              <button
                onClick={handleAddPoint}
                className="w-full bg-orange-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-600 active:scale-95 transition"
              >
                Add point
              </button>

              {dynamicPoints.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Points List
                  </p>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {dynamicPoints.map((point) => {
                      const [latitude, longitude] = point.position;
                      return (
                        <div
                          key={point.id}
                          className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5"
                        >
                          <PointTypeIcon type={point.type} animated={false} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-gray-800">
                              {point.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {formatCoordinate(latitude)}, {formatCoordinate(longitude)}
                            </p>
                            <p className="truncate text-[10px] text-gray-400">
                              {getPointTypeLabel(point.type)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDynamicPoint(point.id)}
                            aria-label={`Remove ${point.name}`}
                            className="h-5 w-5 flex-shrink-0 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold hover:bg-gray-300 hover:text-gray-700"
                          >
                            x
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <p className="font-bold text-gray-900 text-sm mb-3">Map Legend</p>

            <div className="flex items-center gap-2 mb-1.5">
              <VolcanoMini />
              <span className="text-xs text-gray-700">Cerro Machín Volcano</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <ParticipantMini color="#EF4444" />
              <span className="text-xs text-gray-700">Field Participant</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <ParticipantMini color="#3B82F6" />
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

        {/* Help button */}
        <button className="absolute bottom-6 right-2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 font-bold text-sm hover:bg-gray-50 transition border border-gray-100">
          ?
        </button>

        {/* ── Add-participant floating panels (to the left of the right sidebar) ── */}
        {showAddField && (
          <div
            className="absolute z-20 bg-white rounded-xl shadow-2xl p-4 w-64 border border-gray-100"
            style={{ right: "21rem", top: "5.5rem" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm text-gray-900">Add Field Participant</p>
              <button onClick={() => { setShowAddField(false); resetParticipantForm(); }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <ParticipantForm
              pName={pName} setPName={setPName}
              emergencyContactName={emergencyContactName}
              setEmergencyContactName={setEmergencyContactName}
              emergencyContactAffiliation={emergencyContactAffiliation}
              setEmergencyContactAffiliation={setEmergencyContactAffiliation}
              emergencyContactPhone={emergencyContactPhone}
              setEmergencyContactPhone={setEmergencyContactPhone}
              participantError={participantError}
              showEmergencyContact
              accentColor="#EF4444"
              onAdd={() => handleAddParticipant("field")}
              onCancel={() => { setShowAddField(false); resetParticipantForm(); }}
            />
          </div>
        )}

        {showAddOffice && (
          <div
            className="absolute z-20 bg-white rounded-xl shadow-2xl p-4 w-64 border border-gray-100"
            style={{ right: "21rem", top: "11rem" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm text-gray-900">Add Office Participant</p>
              <button onClick={() => { setShowAddOffice(false); resetParticipantForm(); }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            <ParticipantForm
              pName={pName} setPName={setPName}
              emergencyContactName={emergencyContactName}
              setEmergencyContactName={setEmergencyContactName}
              emergencyContactAffiliation={emergencyContactAffiliation}
              setEmergencyContactAffiliation={setEmergencyContactAffiliation}
              emergencyContactPhone={emergencyContactPhone}
              setEmergencyContactPhone={setEmergencyContactPhone}
              participantError={participantError}
              showEmergencyContact={false}
              accentColor="#3B82F6"
              onAdd={() => handleAddParticipant("office")}
              onCancel={() => { setShowAddOffice(false); resetParticipantForm(); }}
            />
          </div>
        )}

        {pendingParticipant && (
          <div className="absolute top-14 right-4 z-20 bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs text-gray-600">
            click on the map to place {pendingParticipant.name}
          </div>
        )}

        {/* Satellite map */}
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

      {/* ══════════════════ RIGHT PANEL ══════════════════ */}
      <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">

        {/* Field participants */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Field participants</p>
          <div className="flex flex-wrap gap-2 items-center">
            {fieldParticipants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1 rounded-full bg-red-50 border border-red-100 px-1.5 py-1"
              >
                <button
                  onClick={() =>
                    fieldRemoveMode && handleRemoveParticipant(p.id, "field")
                  }
                  title={fieldRemoveMode ? `Remove ${p.name}` : p.name}
                  className={`bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full transition ${
                    fieldRemoveMode
                      ? "ring-2 ring-red-300 hover:bg-red-700 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  {p.name}
                </button>
                {!fieldRemoveMode && (
                  <button
                    type="button"
                    onClick={() => handleSwitchParticipantRole(p.id, "office")}
                    className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-red-600 border border-red-200 hover:bg-red-100 transition"
                  >
                    To office
                  </button>
                )}
              </div>
            ))}

            {/* + button */}
            <button
              onClick={toggleAddField}
              title="Add field participant"
              className={`w-7 h-7 rounded-full border border-gray-300 bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center transition hover:bg-gray-300 ${
                showAddField ? "ring-2 ring-gray-300" : ""
              }`}
            >
              +
            </button>
            {/* − button */}
            <button
              onClick={() => {
                setFieldRemoveMode((v) => !v);
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
          {fieldRemoveMode && (
            <p className="mt-2 text-gray-400" style={{ fontSize: "10px" }}>
              click on a participant to remove
            </p>
          )}
        </div>

        {/* Office participants */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-3">Office participants</p>
          <div className="flex flex-wrap gap-2 items-center">
            {officeParticipants.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-1.5 py-1"
              >
                <button
                  onClick={() =>
                    officeRemoveMode && handleRemoveParticipant(p.id, "office")
                  }
                  title={officeRemoveMode ? `Remove ${p.name}` : p.name}
                  className={`bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full transition ${
                    officeRemoveMode
                      ? "ring-2 ring-blue-300 hover:bg-blue-700 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  {p.name}
                </button>
                {!officeRemoveMode && (
                  <button
                    type="button"
                    onClick={() => handleSwitchParticipantRole(p.id, "field")}
                    className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
                  >
                    To field
                  </button>
                )}
              </div>
            ))}

            {/* + button */}
            <button
              onClick={toggleAddOffice}
              title="Add office participant"
              className={`w-7 h-7 rounded-full border border-gray-300 bg-gray-200 text-gray-700 text-sm font-bold flex items-center justify-center transition hover:bg-gray-300 ${
                showAddOffice ? "ring-2 ring-gray-300" : ""
              }`}
            >
              +
            </button>
            {/* − button */}
            <button
              onClick={() => {
                setOfficeRemoveMode((v) => !v);
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

        {/* Footer action */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={() => router.push("/map")}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition"
          >
            Open Read-Only Map
          </button>
        </div>
      </aside>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PointTypeIcon({
  type,
  animated = false,
}: {
  type: DynamicPointType;
  animated?: boolean;
}) {
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
        {animated && (
          <span
            className="absolute h-5 w-5 rounded-full animate-ping"
            style={{ backgroundColor: `${color}4d` }}
          />
        )}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="relative">
          <path d="M10 2.5L18 17H2L10 2.5Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  const color = type === "gidco" ? "#22C55E" : "#3B82F6";
  return (
    <span className="relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center">
      {animated && (
        <span
          className="absolute h-5 w-5 rounded-full animate-ping"
          style={{ backgroundColor: `${color}4d` }}
        />
      )}
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
  type: DynamicPointType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <PointTypeIcon type={type} animated />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

interface ParticipantFormProps {
  pName: string; setPName: (v: string) => void;
  emergencyContactName: string;
  setEmergencyContactName: (v: string) => void;
  emergencyContactAffiliation: string;
  setEmergencyContactAffiliation: (v: string) => void;
  emergencyContactPhone: string;
  setEmergencyContactPhone: (v: string) => void;
  participantError: string;
  showEmergencyContact: boolean;
  accentColor: string;
  onAdd: () => void;
  onCancel: () => void;
}

function ParticipantForm({
  pName, setPName,
  emergencyContactName, setEmergencyContactName,
  emergencyContactAffiliation, setEmergencyContactAffiliation,
  emergencyContactPhone, setEmergencyContactPhone,
  participantError,
  showEmergencyContact,
  accentColor, onAdd, onCancel,
}: ParticipantFormProps) {
  const inputCls =
    "w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1";

  return (
    <div className="space-y-2">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Participant name</label>
        <input
          type="text"
          value={pName}
          onChange={(e) => setPName(e.target.value)}
          placeholder="Full name"
          className={inputCls}
          style={{ "--tw-ring-color": accentColor } as CSSProperties}
        />
      </div>

      {showEmergencyContact && (
        <div className="pt-1 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-2">Emergency contact</p>
          <div className="space-y-1.5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Name of emergency contact
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Contact name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Filiation</label>
              <input
                type="text"
                value={emergencyContactAffiliation}
                onChange={(e) => setEmergencyContactAffiliation(e.target.value)}
                placeholder="Institution / team"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telephone</label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className={inputCls}
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
          disabled={!pName.trim()}
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
  );
}

function VolcanoMini() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,3 21,21 3,21" />
      <circle cx="12" cy="8" r="2" fill="#1f2937" stroke="none" />
    </svg>
  );
}

function ParticipantMini({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill={color} />
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
    </svg>
  );
}
