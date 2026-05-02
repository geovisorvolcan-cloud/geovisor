"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { PROGRESS_DATA, DEFAULT_VOLCANO_ALERT_LEVEL, type VolcanoAlertLevel } from "@/lib/mapData";
export type { VolcanoAlertLevel };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Types ──────────────────────────────────────────────────────────────────

export type DynamicPointType =
  | "sgi_geo"
  | "sgi_magnetometry"
  | "sgi_gravimetry"
  | "gidco"
  | "uis_geophysics";

export interface DynamicPoint {
  id: string;
  type: DynamicPointType;
  name: string;
  position: [number, number];
  description?: string;
  addedAt: string;
  acquired?: boolean;
}

export interface ParticipantEntry {
  id: string;
  name: string;
  role: "field" | "office";
  position?: [number, number];
  emergencyContact?: {
    name: string;
    affiliation: string;
    phone: string;
  };
}

export type ProgressTotals = Record<string, number>;

export interface CampParticipant {
  id: string;
  fullName: string;
  idNumber: string;
  organization: string;
  role: string;
  phoneNumber: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  equipment: string[];
  checkInDate: string;
  checkOutDate: string;
  notes: string;
  status: "pending" | "checked_in" | "checked_out";
  registeredAt: string;
}

interface AppContextType {
  volcanoAlertLevel: VolcanoAlertLevel;
  setVolcanoAlertLevel: (level: VolcanoAlertLevel) => void;
  dynamicPoints: DynamicPoint[];
  addDynamicPoint: (point: Omit<DynamicPoint, "id" | "addedAt">) => void;
  removeDynamicPoint: (id: string) => void;
  updateDynamicPoint: (
    id: string,
    updates: Partial<Pick<DynamicPoint, "position" | "description" | "name" | "acquired">>
  ) => void;
  participants: ParticipantEntry[];
  addParticipant: (participant: Omit<ParticipantEntry, "id">) => void;
  removeParticipant: (id: string) => void;
  updateParticipantRole: (id: string, role: ParticipantEntry["role"]) => void;
  progressTotals: ProgressTotals;
  setProgressTotal: (label: string, total: number) => void;
  campParticipants: CampParticipant[];
  addCampParticipant: (participant: Omit<CampParticipant, "id" | "registeredAt">) => void;
  removeCampParticipant: (id: string) => void;
  updateCampParticipantStatus: (id: string, status: CampParticipant["status"]) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_POINTS = "geovisor_dynamic_points";
const STORAGE_KEY_PARTICIPANTS = "geovisor_participants";
const STORAGE_KEY_PROGRESS_TOTALS = "geovisor_progress_totals";
const STORAGE_KEY_CAMP_PARTICIPANTS = "geovisor_camp_participants";
const STORAGE_KEY_VOLCANO_ALERT = "geovisor_volcano_alert";

const DEFAULT_PARTICIPANTS: ParticipantEntry[] = [];

const DEFAULT_PROGRESS_TOTALS: ProgressTotals = PROGRESS_DATA.reduce(
  (acc, item) => ({ ...acc, [item.label]: item.total }),
  {}
);

function normalizeProgressTotals(stored: ProgressTotals): ProgressTotals {
  return PROGRESS_DATA.reduce<ProgressTotals>((acc, item) => {
    const value = Number(stored[item.label] ?? item.total);
    acc[item.label] = Number.isFinite(value) && value >= 0 ? Math.round(value) : item.total;
    return acc;
  }, {});
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const VALID_ALERT_LEVELS: VolcanoAlertLevel[] = ["green", "yellow", "orange", "red"];

export function AppProvider({ children }: { children: ReactNode }) {
  const [volcanoAlertLevel, setVolcanoAlertLevelState] = useState<VolcanoAlertLevel>(DEFAULT_VOLCANO_ALERT_LEVEL);
  const [dynamicPoints, setDynamicPoints] = useState<DynamicPoint[]>([]);
  const [participants, setParticipants] =
    useState<ParticipantEntry[]>(DEFAULT_PARTICIPANTS);
  const [progressTotals, setProgressTotalsState] = useState<ProgressTotals>(
    DEFAULT_PROGRESS_TOTALS
  );
  const [campParticipants, setCampParticipants] = useState<CampParticipant[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Poll backend for live participant positions every 10 seconds
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await fetch(`${API_URL}/api/map/participants`);
        if (!res.ok) return;
        const data: Array<{
          name: string;
          role: string;
          position?: number[];
          status: string;
          location: string;
        }> = await res.json();
        if (!Array.isArray(data)) return;
        setParticipants(
          data.map((p, i) => ({
            id: `live_${p.name}_${i}`,
            name: p.name,
            role: (p.role === "office" ? "office" : "field") as "field" | "office",
            position: Array.isArray(p.position) && p.position.length === 2
              ? (p.position as [number, number])
              : undefined,
          }))
        );
      } catch {
        // keep existing participants on network error
      }
    };

    fetchParticipants();
    const id = setInterval(fetchParticipants, 10_000);
    return () => clearInterval(id);
  }, []);

  // Fetch data points from backend API
  useEffect(() => {
    const fetchDataPoints = async () => {
      try {
        const res = await fetch(`${API_URL}/api/map/data-points`);
        if (!res.ok) return;
        const data: Array<{ id: string; position: number[]; type: string; label?: string; description?: string; acquired?: boolean }> = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;
        // Preserve acquired state from localStorage
        const savedRaw = localStorage.getItem(STORAGE_KEY_POINTS);
        const acquiredMap = new Map<string, boolean>();
        if (savedRaw) {
          try {
            const saved = JSON.parse(savedRaw);
            if (Array.isArray(saved)) saved.forEach((p: DynamicPoint) => acquiredMap.set(p.id, p.acquired ?? false));
          } catch { /* ignore */ }
        }
        const apiPoints: DynamicPoint[] = data
          .filter((p) => Array.isArray(p.position) && p.position.length === 2)
          .map((p) => ({
            id: p.id,
            type: (p.type === "mt_acquisition" ? "uis_geophysics" : p.type === "sgi_geo" ? "sgi_magnetometry" : p.type) as DynamicPointType,
            name: p.label ?? p.id,
            position: p.position as [number, number],
            description: p.description,
            addedAt: "2025-01-01T00:00:00.000Z",
            acquired: acquiredMap.has(p.id) ? acquiredMap.get(p.id)! : (p.acquired ?? false),
          }));
        setDynamicPoints(apiPoints);
      } catch { /* keep existing points on error */ }
    };
    fetchDataPoints();
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const rawAlert = localStorage.getItem(STORAGE_KEY_VOLCANO_ALERT);
      if (rawAlert && VALID_ALERT_LEVELS.includes(rawAlert as VolcanoAlertLevel)) {
        setVolcanoAlertLevelState(rawAlert as VolcanoAlertLevel);
      }
      const rawP = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (rawP) {
        const parsed = JSON.parse(rawP);
        if (Array.isArray(parsed) && parsed.length > 0) setParticipants(parsed);
      }
      const rawTotals = localStorage.getItem(STORAGE_KEY_PROGRESS_TOTALS);
      if (rawTotals) {
        const parsed = JSON.parse(rawTotals);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setProgressTotalsState(
            normalizeProgressTotals({ ...DEFAULT_PROGRESS_TOTALS, ...(parsed as ProgressTotals) })
          );
        }
      }
      const rawCamp = localStorage.getItem(STORAGE_KEY_CAMP_PARTICIPANTS);
      if (rawCamp) {
        const parsed = JSON.parse(rawCamp);
        if (Array.isArray(parsed)) setCampParticipants(parsed);
      }
      const rawPoints = localStorage.getItem(STORAGE_KEY_POINTS);
      if (rawPoints) {
        const parsed = JSON.parse(rawPoints);
        if (Array.isArray(parsed) && parsed.length > 0) setDynamicPoints(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_VOLCANO_ALERT, volcanoAlertLevel);
  }, [volcanoAlertLevel, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(dynamicPoints));
  }, [dynamicPoints, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
  }, [participants, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_PROGRESS_TOTALS, JSON.stringify(progressTotals));
  }, [progressTotals, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_CAMP_PARTICIPANTS, JSON.stringify(campParticipants));
  }, [campParticipants, hydrated]);

  const setVolcanoAlertLevel = useCallback((level: VolcanoAlertLevel) => {
    setVolcanoAlertLevelState(level);
  }, []);

  const addDynamicPoint = useCallback(
    (point: Omit<DynamicPoint, "id" | "addedAt">) => {
      const newPoint: DynamicPoint = {
        ...point,
        id: `dp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        addedAt: new Date().toISOString(),
      };
      setDynamicPoints((prev) => [...prev, newPoint]);
    },
    []
  );

  const removeDynamicPoint = useCallback((id: string) => {
    setDynamicPoints((prev) => prev.filter((point) => point.id !== id));
  }, []);

  const updateDynamicPoint = useCallback(
    (
      id: string,
      updates: Partial<Pick<DynamicPoint, "position" | "description" | "name" | "acquired">>
    ) => {
      setDynamicPoints((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const addParticipant = useCallback(
    (participant: Omit<ParticipantEntry, "id">) => {
      setParticipants((prev) => [
        ...prev,
        {
          ...participant,
          id: `part_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        },
      ]);
    },
    []
  );

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateParticipantRole = useCallback(
    (id: string, role: ParticipantEntry["role"]) => {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === id ? { ...participant, role } : participant
        )
      );
    },
    []
  );

  const setProgressTotal = useCallback((label: string, total: number) => {
    const clamped = Math.max(0, Math.round(total));
    setProgressTotalsState((prev) => ({ ...prev, [label]: clamped }));
  }, []);

  const addCampParticipant = useCallback(
    (participant: Omit<CampParticipant, "id" | "registeredAt">) => {
      setCampParticipants((prev) => [
        ...prev,
        {
          ...participant,
          id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          registeredAt: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  const removeCampParticipant = useCallback((id: string) => {
    setCampParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateCampParticipantStatus = useCallback(
    (id: string, status: CampParticipant["status"]) => {
      setCampParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        volcanoAlertLevel,
        setVolcanoAlertLevel,
        dynamicPoints,
        addDynamicPoint,
        removeDynamicPoint,
        updateDynamicPoint,
        participants,
        addParticipant,
        removeParticipant,
        updateParticipantRole,
        progressTotals,
        setProgressTotal,
        campParticipants,
        addCampParticipant,
        removeCampParticipant,
        updateCampParticipantStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
