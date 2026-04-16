// Cerro Machín Volcano – Colombia
export const VOLCANO_POSITION: [number, number] = [4.5188, -75.3802];

export const VOLCANO_ALERT = {
  level: "Yellow",
  status: "No important changes",
  description:
    "Active volcano with changes in the baseline behavior of monitored parameters.",
};

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
  // Social and environmental characterization (blue circles)
  { id: "se1", position: [4.540, -75.370], type: "social" },
  { id: "se2", position: [4.495, -75.345], type: "social" },

  // SGI GEO – Magnetometry (magenta) and Gravimetry (pink)
  { id: "sg1", position: [4.525, -75.385], type: "sgi_magnetometry" },
  { id: "sg2", position: [4.510, -75.360], type: "sgi_gravimetry" },

  // GIDCO – Magnetotelluric (green circles)
  { id: "gi1", position: [4.550, -75.375], type: "gidco" },
  { id: "gi2", position: [4.545, -75.355], type: "gidco" },
  { id: "gi3", position: [4.538, -75.400], type: "gidco" },
  { id: "gi4", position: [4.530, -75.345], type: "gidco" },
  { id: "gi5", position: [4.520, -75.410], type: "gidco" },
  { id: "gi6", position: [4.510, -75.390], type: "gidco" },
  { id: "gi7", position: [4.502, -75.370], type: "gidco" },
  { id: "gi8", position: [4.495, -75.355], type: "gidco" },
  { id: "gi9", position: [4.488, -75.390], type: "gidco" },
  { id: "gi10", position: [4.480, -75.365], type: "gidco" },
  { id: "gi11", position: [4.475, -75.395], type: "gidco" },
  { id: "gi12", position: [4.470, -75.370], type: "gidco" },

  // UIS Geophysics Team – Magnetotelluric acquisition (orange circles)
  { id: "mt1", position: [4.542, -75.390], type: "uis_geophysics" },
  { id: "mt2", position: [4.498, -75.360], type: "uis_geophysics" },

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
    current: 1,
    total: 99,
    color: "#3B82F6",
  },
  {
    label: "SGI GEO Magnetometry progress",
    current: 0,
    total: 50,
    color: "#D946EF",
  },
  {
    label: "SGI GEO Gravimetry progress",
    current: 0,
    total: 50,
    color: "#EC4899",
  },
  {
    label: "GIDCO progress",
    current: 12,
    total: 20,
    color: "#22C55E",
  },
  {
    label: "UIS Geophysics Team progress",
    current: 2,
    total: 10,
    color: "#F97316",
  },
];
