"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAppContext, DynamicPointType, ParticipantEntry, VolcanoAlertLevel } from "@/lib/appContext";
import { useAuth } from "@/lib/authContext";
import { PROGRESS_DATA, VOLCANO_ALERT_LEVELS } from "@/lib/mapData";
import ProgressAdjustItem from "@/components/ProgressAdjustItem";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type TeamOption = { value: DynamicPointType; label: string };
const TEAM_OPTIONS: TeamOption[] = [
  { value: "gidco", label: "GIDCO (Magnetotelluric)" },
  { value: "uis_geophysics", label: "UIS Geophysics Team (Magnetotelluric)" },
  { value: "sgi_gravimetry", label: "SGI GEO (Gravimetry)" },
  { value: "sgi_magnetometry", label: "SGI GEO (Magnetometry)" },
];

const POINT_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 -]*$/;

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  position?: [number, number];
};

function parsePosition(latValue: string, lngValue: string) {
  const rawLatitude = latValue.trim();
  const rawLongitude = lngValue.trim();

  if (!rawLatitude) return { error: "Latitude is required." };
  if (!rawLongitude) return { error: "Longitude is required." };

  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
    return { error: "Latitude must be a number between -90 and 90." };

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
    return { error: "Longitude must be a number between -180 and 180." };

  return { position: [latitude, longitude] as [number, number] };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const { ready, isAuthenticated, user, token, logout } = useAuth();
  const {
    volcanoAlertLevel,
    setVolcanoAlertLevel,
    dynamicPoints,
    addDynamicPoint,
    removeDynamicPoint,
    updateDynamicPoint,
    progressTotals,
    setProgressTotal,
  } = useAppContext();

  const alertInfo = VOLCANO_ALERT_LEVELS[volcanoAlertLevel];

  // ── Add-point form ─────────────────────────────────────────────────────
  const [team, setTeam] = useState<DynamicPointType>("gidco");
  const [pointName, setPointName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [pointAcquired, setPointAcquired] = useState(false);
  const [addPointError, setAddPointError] = useState("");
  const [addPointSuccess, setAddPointSuccess] = useState(false);


  // ── Point-type visibility toggles ──────────────────────────────────────
  const [hiddenPointTypes, setHiddenPointTypes] = useState<Set<DynamicPointType>>(new Set());

  const togglePointType = useCallback((type: DynamicPointType) => {
    setHiddenPointTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  }, []);

  // ── Participants visibility toggles ────────────────────────────────────
  const [showParticipants, setShowParticipants] = useState(true);
  const [hiddenParticipantIds, setHiddenParticipantIds] = useState<Set<string>>(new Set());

  const toggleParticipantVisibility = useCallback((id: string) => {
    setHiddenParticipantIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // ── SGC bulletin (auto-scraped) ─────────────────────────────────────────
  type VolcanBulletin = {
    alertLevel: string;
    alertText: string;
    bulletinUrl: string;
    weekKey: string;
    scrapedAt: string;
  };
  const [sgcBulletin, setSgcBulletin] = useState<VolcanBulletin | null>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/volcan-bulletin/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSgcBulletin(d))
      .catch(() => {});
  }, []);

  const handleManualScrape = async () => {
    if (!token) return;
    setScrapeLoading(true);
    setScrapeError("");
    try {
      const res = await fetch(`${API_URL}/api/volcan-bulletin/scrape`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setScrapeError(data.error ?? "Scrape failed"); return; }
      setSgcBulletin(data.bulletin);
    } catch {
      setScrapeError("Network error.");
    } finally {
      setScrapeLoading(false);
    }
  };

  // ── Registered users (from backend) ────────────────────────────────────
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [usersError, setUsersError] = useState("");

  // ── Clock ───────────────────────────────────────────────────────────────
  const [clock, setClock] = useState("");

  const hasAdminAccess = ready && isAuthenticated && user?.role === "admin";

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) { router.replace("/"); return; }
    if (user?.role !== "admin") router.replace("/map");
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

  // Fetch registered users from backend
  useEffect(() => {
    if (!token || !hasAdminAccess) return;
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: RegisteredUser[]) => setRegisteredUsers(data))
      .catch(() => setUsersError("Could not load registered users."));
  }, [token, hasAdminAccess]);

  const fieldUsers = registeredUsers.filter((u) => u.role === "field");
  const officeUsers = registeredUsers.filter((u) => u.role === "office");

  // Convert backend users to ParticipantEntry[] for the map
  const mapParticipants: ParticipantEntry[] = registeredUsers.map((u) => ({
    id: u.id,
    name: u.name,
    role: (u.role as "field" | "office") ?? "field",
    position: Array.isArray(u.position) && u.position.length === 2
      ? [u.position[0], u.position[1]]
      : undefined,
  }));

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddPoint = useCallback(() => {
    setAddPointError("");
    setAddPointSuccess(false);

    const name = pointName.trim();
    if (!name) return setAddPointError("Point name is required.");
    if (!POINT_NAME_PATTERN.test(name))
      return setAddPointError("Name: use letters, numbers, spaces and '-' only.");

    const parsed = parsePosition(lat, lng);
    if (parsed.error) return setAddPointError(parsed.error);

    addDynamicPoint({ type: team, name, position: parsed.position!, description: description.trim() || undefined, acquired: pointAcquired });
    setPointName("");
    setLat("");
    setLng("");
    setDescription("");
    setPointAcquired(false);
    setAddPointSuccess(true);
    setTimeout(() => setAddPointSuccess(false), 2000);
  }, [team, pointName, lat, lng, description, pointAcquired, addDynamicPoint]);


  const handleSwitchUserRole = useCallback(
    async (userId: string, newRole: "field" | "office") => {
      try {
        const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        });
        if (!res.ok) return;
        setRegisteredUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } catch {
        // ignore
      }
    },
    [token]
  );

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
              onClick={() => router.push("/profile")}
              className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition"
            >
              Profile
            </button>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="px-3 py-1.5 bg-white/80 backdrop-blur rounded-full shadow text-xs font-medium text-gray-600 hover:bg-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Single left column: volcano alert on top, add-point + legend scrollable below ── */}
        <div className="absolute top-14 bottom-6 left-4 z-10 flex flex-col gap-3 w-72">

          {/* Volcano Alert – fixed height, admin-editable */}
          <div
            className="flex-shrink-0 bg-white rounded-xl shadow-lg border-l-4 p-4"
            style={{ borderColor: alertInfo.color }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚠</span>
              <span className="font-bold text-gray-900 text-sm">Volcano Alert</span>
            </div>

            {/* Level buttons */}
            <div className="flex gap-1.5 mb-3">
              {(["green", "yellow", "orange", "red"] as VolcanoAlertLevel[]).map((lvl) => {
                const info = VOLCANO_ALERT_LEVELS[lvl];
                const active = volcanoAlertLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setVolcanoAlertLevel(lvl)}
                    className="flex-1 py-1 rounded text-xs font-bold border-2 transition"
                    style={{
                      backgroundColor: active ? info.color : "transparent",
                      borderColor: info.color,
                      color: active ? "white" : info.color,
                    }}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-gray-800 font-semibold">{alertInfo.status}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{alertInfo.description}</p>
            <p className="text-xs text-gray-400 mt-1">
              Last updated: <span className="font-mono">{clock}</span>
            </p>

            {/* SGC Auto-scraped bulletin */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SGC Boletín Semanal</span>
                <button
                  type="button"
                  onClick={handleManualScrape}
                  disabled={scrapeLoading}
                  className="text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-50 transition"
                >
                  {scrapeLoading ? "Consultando…" : "Actualizar"}
                </button>
              </div>
              {scrapeError && (
                <p className="text-xs text-red-500 mb-1">{scrapeError}</p>
              )}
              {sgcBulletin ? (
                <div>
                  <p className="text-xs text-gray-700 leading-relaxed">{sgcBulletin.alertText}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {sgcBulletin.bulletinUrl && (
                      <a
                        href={sgcBulletin.bulletinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Ver boletín
                      </a>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {sgcBulletin.weekKey} · {new Date(sgcBulletin.scrapedAt).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">Sin datos aún. Haz clic en &quot;Actualizar&quot; para consultar.</p>
              )}
            </div>
          </div>

          {/* Scrollable: Add Point + Map Legend */}
          <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0">

            {/* Add New Point */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <p className="font-bold text-gray-900 text-sm mb-3">Add New Point</p>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Label</label>
                  <div className="flex items-center gap-2">
                    <PointTypeIcon type={team} animated />
                    <select
                      value={team}
                      onChange={(e) => setTeam(e.target.value as DynamicPointType)}
                      className="min-w-0 flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                    >
                      {TEAM_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Point name (alphanumeric)</label>
                  <input
                    type="text"
                    value={pointName}
                    onChange={(e) => setPointName(e.target.value)}
                    placeholder="Point A1"
                    className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
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
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
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
                  <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full resize-none text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pointAcquired}
                    onChange={(e) => setPointAcquired(e.target.checked)}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span className="text-xs font-medium text-gray-700">Acquired</span>
                  <span className="text-[10px] text-gray-400">(unchecked = characterized)</span>
                </label>

                {addPointError && <p className="text-red-500 text-xs">{addPointError}</p>}
                {addPointSuccess && <p className="text-green-600 text-xs font-medium">Point added to map.</p>}

                <button
                  onClick={handleAddPoint}
                  className="w-full bg-orange-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-600 active:scale-95 transition"
                >
                  Add point
                </button>

              </div>
            </div>

            {/* Map Legend */}
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
              <LegendPoint type="sgi_magnetometry" label="SGI GEO (Magnetometry)" />
              <LegendPoint type="sgi_gravimetry" label="SGI GEO (Gravimetry)" />
              <LegendPoint type="gidco" label="GIDCO (Magnetotelluric)" />
              <LegendPoint type="uis_geophysics" label="UIS Geophysics Team (Magnetotelluric)" />
            </div>

          </div>
        </div>

        {/* Help button */}
        <button className="absolute bottom-6 right-2 z-10 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 font-bold text-sm hover:bg-gray-50 transition border border-gray-100">
          ?
        </button>

        {/* Satellite map */}
        <div className="absolute inset-0 z-0">
          <MapView
            useSatellite={true}
            extraPoints={dynamicPoints}
            hiddenPointTypes={hiddenPointTypes}
            participantEntries={showParticipants ? mapParticipants.filter((p) => !hiddenParticipantIds.has(p.id)) : []}
            volcanoAlertLevel={volcanoAlertLevel}
            onToggleAcquired={(id, acquired) => updateDynamicPoint(id, { acquired })}
          />
        </div>
      </div>

      {/* ══════════════════ RIGHT PANEL ══════════════════ */}
      <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">

        {/* Participants header with map toggle */}
        <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Participants</p>
          <button
            type="button"
            onClick={() => setShowParticipants((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
              showParticipants
                ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                : "bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200"
            }`}
          >
            <span>{showParticipants ? "👁" : "🚫"}</span>
            {showParticipants ? "Visible on map" : "Hidden on map"}
          </button>
        </div>

        {/* Field participants */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Field participants</p>
            <span className="text-xs text-gray-400">{fieldUsers.length}</span>
          </div>
          {usersError && <p className="text-xs text-red-500 mb-2">{usersError}</p>}
          <div className="flex flex-wrap gap-2">
            {fieldUsers.map((u) => {
              const hidden = hiddenParticipantIds.has(u.id);
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-1 rounded-full border px-1.5 py-1 transition ${hidden ? "bg-gray-100 border-gray-200 opacity-50" : "bg-red-50 border-red-100"}`}
                >
                  <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full transition ${hidden ? "bg-gray-400" : "bg-red-500"}`}>
                    {u.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleParticipantVisibility(u.id)}
                    title={hidden ? "Show on map" : "Hide on map"}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white border border-gray-200 text-[10px] hover:bg-gray-100 transition"
                  >
                    {hidden ? "🚫" : "👁"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchUserRole(u.id, "office")}
                    className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-red-600 border border-red-200 hover:bg-red-100 transition"
                  >
                    To office
                  </button>
                </div>
              );
            })}
            {fieldUsers.length === 0 && (
              <p className="text-xs text-gray-400 italic">No field users registered.</p>
            )}
          </div>
        </div>

        {/* Office participants */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">Office participants</p>
            <span className="text-xs text-gray-400">{officeUsers.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {officeUsers.map((u) => {
              const hidden = hiddenParticipantIds.has(u.id);
              return (
                <div
                  key={u.id}
                  className={`flex items-center gap-1 rounded-full border px-1.5 py-1 transition ${hidden ? "bg-gray-100 border-gray-200 opacity-50" : "bg-blue-50 border-blue-100"}`}
                >
                  <span className={`text-white text-xs font-semibold px-3 py-1 rounded-full transition ${hidden ? "bg-gray-400" : "bg-blue-500"}`}>
                    {u.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleParticipantVisibility(u.id)}
                    title={hidden ? "Show on map" : "Hide on map"}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-white border border-gray-200 text-[10px] hover:bg-gray-100 transition"
                  >
                    {hidden ? "🚫" : "👁"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchUserRole(u.id, "field")}
                    className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-blue-600 border border-blue-200 hover:bg-blue-100 transition"
                  >
                    To field
                  </button>
                </div>
              );
            })}
            {officeUsers.length === 0 && (
              <p className="text-xs text-gray-400 italic">No office users registered.</p>
            )}
          </div>
        </div>

        {/* Point-type visibility toggles */}
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-2">Point types on map</p>
          <div className="space-y-1.5">
            {PROGRESS_DATA.map((item) => {
              const hidden = hiddenPointTypes.has(item.teamType);
              return (
                <button
                  key={item.teamType}
                  type="button"
                  onClick={() => togglePointType(item.teamType)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                    hidden
                      ? "bg-gray-100 border-gray-200 text-gray-400"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: hidden ? "#d1d5db" : item.color }}
                  />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  <span className="flex-shrink-0 text-[10px]">{hidden ? "🚫" : "👁"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Characterization section ── */}
        <div className="p-5 border-b border-gray-200 space-y-4">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Characterization</p>
          <AcqProgressBar
            label="Total Characterization"
            color="#3B82F6"
            acquired={dynamicPoints.filter((p) => !p.acquired).length}
            total={PROGRESS_DATA.reduce((sum, item) => sum + (progressTotals[item.label] ?? item.total), 0)}
          />
          {PROGRESS_DATA.map((item) => {
            const current = dynamicPoints.filter((p) => p.type === item.teamType && !p.acquired).length;
            const total = progressTotals[item.label] ?? item.total;
            const points = dynamicPoints.filter((p) => p.type === item.teamType);
            return (
              <ProgressAdjustItem
                key={item.label}
                label={item.label}
                current={current}
                total={total}
                color={item.color}
                points={points}
                onSetTotal={(newTotal) => setProgressTotal(item.label, newTotal)}
                onUpdatePoint={(id, updates) => updateDynamicPoint(id, updates)}
                onDeletePoint={(id) => removeDynamicPoint(id)}
              />
            );
          })}
        </div>

        {/* ── Acquisition section ── */}
        <div className="p-5 space-y-3 flex-1">
          {(() => {
            const plannedTotal = PROGRESS_DATA.reduce((sum, item) => sum + (progressTotals[item.label] ?? item.total), 0);
            return (
              <>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Acquisition</p>
                <AcqProgressBar
                  label="Total Acquisition"
                  color="#10B981"
                  acquired={dynamicPoints.filter((p) => p.acquired).length}
                  total={plannedTotal}
                />
                <AcqProgressBar
                  label="SGI GEO Acquisition – GRAV"
                  color="#EC4899"
                  acquired={dynamicPoints.filter((p) => p.type === "sgi_gravimetry" && p.acquired).length}
                  total={dynamicPoints.filter((p) => p.type === "sgi_gravimetry").length}
                />
                <AcqProgressBar
                  label="SGI GEO Acquisition – MAG"
                  color="#D946EF"
                  acquired={dynamicPoints.filter((p) => p.type === "sgi_magnetometry" && p.acquired).length}
                  total={dynamicPoints.filter((p) => p.type === "sgi_magnetometry").length}
                />
                <AcqProgressBar
                  label="MT Acquisition – UIS"
                  color="#F97316"
                  acquired={dynamicPoints.filter((p) => p.type === "uis_geophysics" && p.acquired).length}
                  total={dynamicPoints.filter((p) => p.type === "uis_geophysics").length}
                />
                <AcqProgressBar
                  label="MT Acquisition – GIDCO"
                  color="#22C55E"
                  acquired={dynamicPoints.filter((p) => p.type === "gidco" && p.acquired).length}
                  total={dynamicPoints.filter((p) => p.type === "gidco").length}
                />
              </>
            );
          })()}
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

function PointTypeIcon({ type, animated = false }: { type: DynamicPointType; animated?: boolean }) {
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

  if (type === "sgi_geo" || type === "sgi_magnetometry" || type === "sgi_gravimetry") {
    const color = type === "sgi_gravimetry" ? "#EC4899" : "#D946EF";
    return (
      <span className="relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center">
        {animated && (
          <span className="absolute h-5 w-5 rounded-full animate-ping" style={{ backgroundColor: `${color}4d` }} />
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
        <span className="absolute h-5 w-5 rounded-full animate-ping" style={{ backgroundColor: `${color}4d` }} />
      )}
      <span className="relative h-3.5 w-3.5 rounded-full border-2 border-white shadow" style={{ backgroundColor: color }} />
    </span>
  );
}

function AcqProgressBar({ label, color, acquired, total }: { label: string; color: string; acquired: number; total: number }) {
  const pct = total > 0 ? Math.round((acquired / total) * 100) : 0;
  const fillWidth = pct === 0 ? 0 : Math.max(pct, 2);
  return (
    <div>
      <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
      <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="h-full rounded-full flex items-center justify-end pr-1.5 transition-all"
          style={{ width: `${fillWidth}%`, backgroundColor: color }}
        >
          {pct >= 15 && <span className="text-white text-[10px] font-bold">{pct}%</span>}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>{acquired} / {total} points</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

function LegendPoint({ type, label }: { type: DynamicPointType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <PointTypeIcon type={type} animated />
      <span className="text-xs text-gray-600">{label}</span>
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
