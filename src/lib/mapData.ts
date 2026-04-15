// Cerro Machín Volcano – Colombia
export const VOLCANO_POSITION: [number, number] = [4.5188, -75.3802];

export type DataPointType =
  | "social"
  | "sgi_geo"
  | "gidco"
  | "mt_acquisition"
  | "seismic_sensor"
  | "field_participant";

export interface DataPoint {
  id: string;
  position: [number, number];
  type: DataPointType;
  label?: string;
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
  // Field participants (red pins)
  { id: "fp1", position: [4.535, -75.395], type: "field_participant", label: "Ana" },
  { id: "fp2", position: [4.505, -75.355], type: "field_participant" },
  { id: "fp3", position: [4.498, -75.408], type: "field_participant" },

  // Social & Environmental (blue circles)
  { id: "se1", position: [4.540, -75.370], type: "social" },
  { id: "se2", position: [4.495, -75.345], type: "social" },

  // SGI GEO – Magnetometry/Gravimetry (purple circles)
  { id: "sg1", position: [4.525, -75.385], type: "sgi_geo" },
  { id: "sg2", position: [4.510, -75.360], type: "sgi_geo" },

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

  // MT Acquisition (orange circles)
  { id: "mt1", position: [4.542, -75.390], type: "mt_acquisition" },
  { id: "mt2", position: [4.498, -75.360], type: "mt_acquisition" },

  // Seismic sensors (radio wave icon)
  { id: "ss1", position: [4.515, -75.415], type: "seismic_sensor" },
  { id: "ss2", position: [4.490, -75.380], type: "seismic_sensor" },
];

export const PARTICIPANTS: Participant[] = [
  {
    name: "Ana",
    role: "field",
    position: [4.535, -75.395],
    status: "active",
    lastUpdate: "0:42:53",
    location: "Santiago, Chile",
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
  { label: "Social and environmental characterization", current: 1, total: 99, color: "bg-purple-600" },
  { label: "SGI GEO progress", current: 5, total: 99, color: "bg-purple-600" },
  { label: "GIDCO progress", current: 12, total: 99, color: "bg-orange-500" },
  { label: "MT acquisition progress", current: 2, total: 10, color: "bg-orange-400" },
];
