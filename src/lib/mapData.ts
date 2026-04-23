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

export const DATA_POINTS: DataPoint[] = [
  // ── GRAVIMETRIA ──────────────────────────────────────────────────────────
  { id: "GRAV01", position: [4.488373, -75.378695], type: "sgi_gravimetry", label: "GRAV01" },
  { id: "GRAV02", position: [4.486972, -75.381486], type: "sgi_gravimetry", label: "GRAV02" },
  { id: "GRAV03", position: [4.482683, -75.382333], type: "sgi_gravimetry", label: "GRAV03" },
  { id: "GRAV04", position: [4.489064, -75.389773], type: "sgi_gravimetry", label: "GRAV04" },
  { id: "GRAV05", position: [4.491753, -75.394164], type: "sgi_gravimetry", label: "GRAV05" },
  { id: "GRAV06", position: [4.488734, -75.394672], type: "sgi_gravimetry", label: "GRAV06" },
  { id: "GRAV07", position: [4.487487, -75.396565], type: "sgi_gravimetry", label: "GRAV07" },
  { id: "GRAV08", position: [4.478997, -75.394072], type: "sgi_gravimetry", label: "GRAV08" },
  { id: "GRAV09", position: [4.473522, -75.389281], type: "sgi_gravimetry", label: "GRAV09" },
  { id: "GRAV10", position: [4.471995, -75.388759], type: "sgi_gravimetry", label: "GRAV10" },
  { id: "GRAV11", position: [4.446883, -75.384339], type: "sgi_gravimetry", label: "GRAV11" },
  { id: "GRAV12", position: [4.472608, -75.380261], type: "sgi_gravimetry", label: "GRAV12" },
  { id: "GRAV13", position: [4.474810, -75.376263], type: "sgi_gravimetry", label: "GRAV13" },
  { id: "GRAV14", position: [4.496579, -75.400240], type: "sgi_gravimetry", label: "GRAV14" },
  { id: "GRAV15", position: [4.499696, -75.400997], type: "sgi_gravimetry", label: "GRAV15" },
  { id: "GRAV16", position: [4.501244, -75.395549], type: "sgi_gravimetry", label: "GRAV16" },
  { id: "GRAV17", position: [4.505535, -75.396194], type: "sgi_gravimetry", label: "GRAV17" },
  { id: "GRAV18", position: [4.505524, -75.400724], type: "sgi_gravimetry", label: "GRAV18" },
  { id: "GRAV20", position: [4.478377, -75.365305], type: "sgi_gravimetry", label: "GRAV20" },
  { id: "GRAV21", position: [4.480465, -75.366347], type: "sgi_gravimetry", label: "GRAV21" },
  { id: "GRAV22", position: [4.482235, -75.363010], type: "sgi_gravimetry", label: "GRAV22" },
  { id: "GRAV23", position: [4.487070, -75.366749], type: "sgi_gravimetry", label: "GRAV23" },
  { id: "GRAV24", position: [4.485507, -75.371391], type: "sgi_gravimetry", label: "GRAV24" },
  { id: "GRAV28", position: [4.456458, -75.354333], type: "sgi_gravimetry", label: "GRAV28" },
  { id: "GRAV32", position: [4.521918, -75.410110], type: "sgi_gravimetry", label: "GRAV32" },
];

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
