// Cerro Machín Volcano – Colombia
export const VOLCANO_POSITION: [number, number] = [4.5188, -75.3802];

export type VolcanoAlertLevel = "green" | "yellow" | "orange" | "red";

export const VOLCANO_ALERT_LEVELS: Record<
  VolcanoAlertLevel,
  { label: string; color: string; borderColor: string; status: string; description: string }
> = {
  green: {
    label: "Green",
    color: "#16a34a",
    borderColor: "border-green-500",
    status: "Normal activity",
    description: "Volcano behaving within normal parameters. No eruption expected.",
  },
  yellow: {
    label: "Yellow",
    color: "#ca8a04",
    borderColor: "border-yellow-400",
    status: "No important changes",
    description: "Active volcano with changes in the baseline behavior of monitored parameters.",
  },
  orange: {
    label: "Orange",
    color: "#ea580c",
    borderColor: "border-orange-500",
    status: "Heightened activity",
    description: "Increased unrest. Eruption possible within days to weeks.",
  },
  red: {
    label: "Red",
    color: "#dc2626",
    borderColor: "border-red-500",
    status: "Eruption imminent or in progress",
    description: "Eruption imminent, in progress, or recently ended. Immediate action required.",
  },
};

export const DEFAULT_VOLCANO_ALERT_LEVEL: VolcanoAlertLevel = "yellow";

export type DataPointType =
  | "social"
  | "sgi_geo"
  | "sgi_magnetometry"
  | "sgi_gravimetry"
  | "gidco"
  | "mt_acquisition"
  | "uis_geophysics";

export interface DataPoint {
  id: string;
  position: [number, number];
  type: DataPointType;
  label?: string;
  description?: string;
}

export interface Participant {
  name: string;
  role: "field" | "office";
  position?: [number, number];
  status: "active" | "inactive";
  lastUpdate: string;
  location: string;
}

export const DATA_POINTS: DataPoint[] = [];

export const PARTICIPANTS: Participant[] = [
  {
    name: "Ana",
    role: "field",
    position: [4.535, -75.395],
    status: "active",
    lastUpdate: "0:42:53",
    location: "Cerro Machín",
  },
  {
    name: "Carlos",
    role: "office",
    status: "active",
    lastUpdate: "0:42:53",
    location: "Bogotá, Colombia",
  },
];

export const PROGRESS_DATA = [
  {
    label: "Social and environmental characterization",
    total: 99,
    color: "#3B82F6",
    teamType: "social" as const,
  },
  {
    label: "SGI GEO Magnetometry progress",
    total: 50,
    color: "#D946EF",
    teamType: "sgi_magnetometry" as const,
  },
  {
    label: "SGI GEO Gravimetry progress",
    total: 50,
    color: "#EC4899",
    teamType: "sgi_gravimetry" as const,
  },
  {
    label: "GIDCO progress",
    total: 20,
    color: "#22C55E",
    teamType: "gidco" as const,
  },
  {
    label: "UIS Geophysics Team progress",
    total: 10,
    color: "#F97316",
    teamType: "uis_geophysics" as const,
  },
];
