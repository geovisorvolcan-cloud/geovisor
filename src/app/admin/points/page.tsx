"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicPointType } from "@/lib/appContext";
import { useAuth } from "@/lib/authContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type DataPointRow = {
  id: string;
  position: [number, number];
  type: DynamicPointType;
  label?: string;
  description?: string;
  acquired: boolean;
  createdAt?: string;
};

type SaveState = {
  savingIds: Set<string>;
  error: string;
  notice: string;
};

const TYPE_LABELS: Record<DynamicPointType, string> = {
  gidco: "MT - GIDCO",
  sgi_geo: "SGI GEO",
  sgi_gravimetry: "SGI GEO - GRAV",
  sgi_magnetometry: "SGI GEO - MAG",
  uis_geophysics: "MT - UIS",
};

const TYPE_OPTIONS: Array<{ value: "all" | DynamicPointType; label: string }> = [
  { value: "all", label: "All teams" },
  { value: "gidco", label: "MT - GIDCO" },
  { value: "uis_geophysics", label: "MT - UIS" },
  { value: "sgi_gravimetry", label: "SGI GEO - GRAV" },
  { value: "sgi_magnetometry", label: "SGI GEO - MAG" },
];

function normalizeType(type: string): DynamicPointType {
  if (type === "mt_acquisition") return "uis_geophysics";
  if (type === "sgi_geo") return "sgi_magnetometry";
  if (
    type === "gidco" ||
    type === "sgi_geo" ||
    type === "sgi_gravimetry" ||
    type === "sgi_magnetometry" ||
    type === "uis_geophysics"
  ) {
    return type;
  }
  return "sgi_magnetometry";
}

function normalizePoint(point: {
  id?: string;
  pointId?: string;
  position?: number[];
  type?: string;
  label?: string;
  description?: string;
  acquired?: boolean;
  createdAt?: string;
}): DataPointRow | null {
  const id = String(point.id ?? point.pointId ?? "").trim();
  if (!id || !Array.isArray(point.position) || point.position.length !== 2 || !point.type) return null;

  const [latitude, longitude] = point.position;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id,
    position: [latitude, longitude],
    type: normalizeType(point.type),
    label: point.label,
    description: point.description,
    acquired: Boolean(point.acquired),
    createdAt: point.createdAt,
  };
}

export default function AdminPointsPage() {
  const router = useRouter();
  const { ready, isAuthenticated, user, token, logout } = useAuth();
  const hasAdminAccess = ready && isAuthenticated && user?.role === "admin";

  const [points, setPoints] = useState<DataPointRow[]>([]);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<"all" | DynamicPointType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "acquired" | "pending">("all");
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<SaveState>({
    savingIds: new Set(),
    error: "",
    notice: "",
  });

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }
    if (user?.role !== "admin") router.replace("/map");
  }, [isAuthenticated, ready, router, user]);

  const loadPoints = useCallback(async () => {
    if (!token || !hasAdminAccess) return;

    setLoading(true);
    setState((prev) => ({ ...prev, error: "", notice: "" }));

    try {
      let res = await fetch(`${API_URL}/api/admin/data-points`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        res = await fetch(`${API_URL}/api/map/data-points`);
      }

      const data = await res.json().catch(() => []);
      if (!res.ok || !Array.isArray(data)) {
        throw new Error(typeof data?.error === "string" ? data.error : "Could not load data points.");
      }

      setPoints(data.map(normalizePoint).filter((point): point is DataPointRow => Boolean(point)));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Could not load data points.",
      }));
    } finally {
      setLoading(false);
    }
  }, [hasAdminAccess, token]);

  useEffect(() => {
    void loadPoints();
  }, [loadPoints]);

  const filteredPoints = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return points.filter((point) => {
      const matchesQuery =
        !needle ||
        point.id.toLowerCase().includes(needle) ||
        (point.label ?? "").toLowerCase().includes(needle) ||
        (point.description ?? "").toLowerCase().includes(needle);
      const matchesTeam = teamFilter === "all" || point.type === teamFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "acquired" ? point.acquired : !point.acquired);

      return matchesQuery && matchesTeam && matchesStatus;
    });
  }, [points, query, statusFilter, teamFilter]);

  const acquiredCount = points.filter((point) => point.acquired).length;
  const pendingCount = points.length - acquiredCount;

  const setSaving = (id: string, saving: boolean) => {
    setState((prev) => {
      const savingIds = new Set(prev.savingIds);
      if (saving) savingIds.add(id); else savingIds.delete(id);
      return { ...prev, savingIds };
    });
  };

  const persistAcquired = useCallback(
    async (id: string, acquired: boolean) => {
      if (!token) throw new Error("Admin session is required. Sign in again.");

      const body = JSON.stringify({ acquired });
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let res = await fetch(`${API_URL}/api/admin/data-points/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers,
        body,
      });

      if (res.status === 404) {
        res = await fetch(`${API_URL}/api/admin/data-points/${encodeURIComponent(id)}/acquired`, {
          method: "PUT",
          headers,
          body,
        });
      }

      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save acquisition status.");
    },
    [token]
  );

  const toggleAcquired = useCallback(
    async (id: string, acquired: boolean) => {
      const previous = points.find((point) => point.id === id)?.acquired ?? false;

      setState((prev) => ({ ...prev, error: "", notice: "" }));
      setSaving(id, true);
      setPoints((prev) => prev.map((point) => (point.id === id ? { ...point, acquired } : point)));

      try {
        await persistAcquired(id, acquired);
        setState((prev) => ({
          ...prev,
          notice: `${id} saved as ${acquired ? "acquired" : "not acquired"}.`,
        }));
      } catch (err) {
        setPoints((prev) => prev.map((point) => (point.id === id ? { ...point, acquired: previous } : point)));
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Could not save acquisition status.",
        }));
      } finally {
        setSaving(id, false);
      }
    },
    [persistAcquired, points]
  );

  if (!ready || !hasAdminAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">
        Checking administrator access...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <h1 className="text-base font-semibold">Acquisition Control Panel</h1>
            <p className="text-xs text-slate-500">{points.length} points · {acquiredCount} acquired · {pendingCount} pending</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Map admin
            </button>
            <button
              type="button"
              onClick={() => router.push("/map")}
              className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Read-only map
            </button>
            <button
              type="button"
              onClick={() => { logout(); router.push("/"); }}
              className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-4">
        <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(220px,1fr)_180px_160px_auto]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search point, label, description"
            className="h-9 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
          />
          <select
            value={teamFilter}
            onChange={(event) => setTeamFilter(event.target.value as "all" | DynamicPointType)}
            className="h-9 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | "acquired" | "pending")}
            className="h-9 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
          >
            <option value="all">All status</option>
            <option value="acquired">Acquired</option>
            <option value="pending">Not acquired</option>
          </select>
          <button
            type="button"
            onClick={() => void loadPoints()}
            className="h-9 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {state.error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {state.error}
          </div>
        )}
        {state.notice && (
          <div className="mb-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {state.notice}
          </div>
        )}

        <div className="overflow-hidden rounded border border-slate-200 bg-white">
          <div className="max-h-[calc(100vh-13rem)] overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="w-32 border-b border-slate-200 px-3 py-2 font-semibold">Status</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-semibold">Point</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-semibold">Team</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-semibold">Coordinates</th>
                  <th className="border-b border-slate-200 px-3 py-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">Loading points...</td>
                  </tr>
                ) : filteredPoints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">No points found.</td>
                  </tr>
                ) : (
                  filteredPoints.map((point) => {
                    const saving = state.savingIds.has(point.id);
                    return (
                      <tr key={point.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="whitespace-nowrap px-3 py-2">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={point.acquired}
                              disabled={saving}
                              onChange={(event) => void toggleAcquired(point.id, event.target.checked)}
                              className="h-4 w-4 accent-emerald-600"
                              aria-label={`Mark ${point.id} as acquired`}
                            />
                            <span className={`text-xs font-semibold ${point.acquired ? "text-emerald-700" : "text-slate-500"}`}>
                              {saving ? "Saving" : point.acquired ? "Acquired" : "Pending"}
                            </span>
                          </label>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <div className="font-semibold text-slate-900">{point.label ?? point.id}</div>
                          <div className="text-xs text-slate-500">{point.id}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-slate-700">{TYPE_LABELS[point.type] ?? point.type}</td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-600">
                          {point.position[0].toFixed(5)}, {point.position[1].toFixed(5)}
                        </td>
                        <td className="max-w-xl px-3 py-2 text-xs leading-5 text-slate-600">
                          <span className="line-clamp-2">{point.description ?? ""}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
