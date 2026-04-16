"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { PROGRESS_DATA } from "@/lib/mapData";

// ─── Types ──────────────────────────────────────────────────────────────────

export type DynamicPointType =
  | "social"
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

export type ProgressCounts = Record<string, number>;

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
  dynamicPoints: DynamicPoint[];
  addDynamicPoint: (point: Omit<DynamicPoint, "id" | "addedAt">) => void;
  removeDynamicPoint: (id: string) => void;
  participants: ParticipantEntry[];
  addParticipant: (participant: Omit<ParticipantEntry, "id">) => void;
  removeParticipant: (id: string) => void;
  progressCounts: ProgressCounts;
  adjustProgress: (label: string, delta: number, total: number) => void;
  campParticipants: CampParticipant[];
  addCampParticipant: (participant: Omit<CampParticipant, "id" | "registeredAt">) => void;
  removeCampParticipant: (id: string) => void;
  updateCampParticipantStatus: (id: string, status: CampParticipant["status"]) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_POINTS = "geovisor_dynamic_points";
const STORAGE_KEY_PARTICIPANTS = "geovisor_participants";
const STORAGE_KEY_PROGRESS = "geovisor_progress_counts";
const STORAGE_KEY_CAMP_PARTICIPANTS = "geovisor_camp_participants";

const DEFAULT_PARTICIPANTS: ParticipantEntry[] = [
  { id: "default_p1", name: "Ana", role: "field", position: [4.535, -75.395] },
  { id: "default_p2", name: "Carlos", role: "office" },
];

const DEFAULT_PROGRESS_COUNTS: ProgressCounts = PROGRESS_DATA.reduce(
  (acc, item) => ({
    ...acc,
    [item.label]: item.current,
  }),
  {}
);

function clampProgress(value: number, total: number) {
  return Math.min(total, Math.max(0, Math.round(value)));
}

function normalizeProgressCounts(counts: ProgressCounts) {
  return PROGRESS_DATA.reduce<ProgressCounts>((acc, item) => {
    const value = Number(counts[item.label] ?? item.current);
    acc[item.label] = clampProgress(
      Number.isFinite(value) ? value : item.current,
      item.total
    );
    return acc;
  }, {});
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [dynamicPoints, setDynamicPoints] = useState<DynamicPoint[]>([]);
  const [participants, setParticipants] =
    useState<ParticipantEntry[]>(DEFAULT_PARTICIPANTS);
  const [progressCounts, setProgressCounts] = useState<ProgressCounts>(
    DEFAULT_PROGRESS_COUNTS
  );
  const [campParticipants, setCampParticipants] = useState<CampParticipant[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_POINTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setDynamicPoints(parsed);
      }
      const rawP = localStorage.getItem(STORAGE_KEY_PARTICIPANTS);
      if (rawP) {
        const parsed = JSON.parse(rawP);
        if (Array.isArray(parsed) && parsed.length > 0) setParticipants(parsed);
      }
      const rawProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (rawProgress) {
        const parsed = JSON.parse(rawProgress);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setProgressCounts(
            normalizeProgressCounts({
              ...DEFAULT_PROGRESS_COUNTS,
              ...(parsed as ProgressCounts),
            })
          );
        }
      }
      const rawCamp = localStorage.getItem(STORAGE_KEY_CAMP_PARTICIPANTS);
      if (rawCamp) {
        const parsed = JSON.parse(rawCamp);
        if (Array.isArray(parsed)) setCampParticipants(parsed);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist whenever state changes (after hydration)
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
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressCounts));
  }, [progressCounts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY_CAMP_PARTICIPANTS, JSON.stringify(campParticipants));
  }, [campParticipants, hydrated]);

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

  const adjustProgress = useCallback(
    (label: string, delta: number, total: number) => {
      setProgressCounts((prev) => {
        const current = prev[label] ?? 0;
        return {
          ...prev,
          [label]: clampProgress(current + delta, total),
        };
      });
    },
    []
  );

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
        dynamicPoints,
        addDynamicPoint,
        removeDynamicPoint,
        participants,
        addParticipant,
        removeParticipant,
        progressCounts,
        adjustProgress,
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
