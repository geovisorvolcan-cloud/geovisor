"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VOLCANO_POSITION, DATA_POINTS, DataPointType } from "@/lib/mapData";

// Fix Leaflet's default icon path when bundled
function fixLeafletIcons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

// Color map per data type
const TYPE_CONFIG: Record<
  DataPointType,
  { color: string; shape: "circle" | "pin" | "volcano" | "sensor"; size: number }
> = {
  social: { color: "#3B82F6", shape: "circle", size: 12 },
  sgi_geo: { color: "#7C3AED", shape: "circle", size: 12 },
  gidco: { color: "#22C55E", shape: "circle", size: 13 },
  mt_acquisition: { color: "#F97316", shape: "circle", size: 13 },
  seismic_sensor: { color: "#F97316", shape: "sensor", size: 36 },
  field_participant: { color: "#EF4444", shape: "pin", size: 28 },
};

function createCircleIcon(color: string, size: number) {
  const html = `<div style="
    width:${size}px;height:${size}px;border-radius:50%;
    background:${color};border:2px solid white;
    box-shadow:0 1px 4px rgba(0,0,0,0.35);
  "></div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createPinIcon(color: string, label?: string) {
  const html = `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22s14-12.667 14-22C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
    </svg>
    ${label ? `<span style="position:absolute;top:6px;left:50%;transform:translateX(-50%);font-size:7px;font-weight:700;color:${color};white-space:nowrap;">${label}</span>` : ""}
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

function createVolcanoIcon() {
  const html = `<div style="display:flex;align-items:center;justify-content:center;">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="22" fill="rgba(249,115,22,0.15)"/>
      <polygon points="22,6 38,36 6,36" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="22" cy="12" r="3" fill="white" stroke="#1f2937" stroke-width="2"/>
    </svg>
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function createSensorIcon() {
  const html = `<div style="display:flex;align-items:center;justify-content:center;">
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="4" fill="#F97316"/>
      <circle cx="20" cy="20" r="10" stroke="#F97316" stroke-width="2" fill="none" opacity="0.5"/>
      <circle cx="20" cy="20" r="16" stroke="#F97316" stroke-width="1.5" fill="none" opacity="0.25"/>
    </svg>
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    fixLeafletIcons();

    const map = L.map(containerRef.current, {
      center: VOLCANO_POSITION,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Volcano marker
    L.marker(VOLCANO_POSITION, { icon: createVolcanoIcon() })
      .addTo(map)
      .bindPopup(
        `<div style="font-size:13px;padding:8px 12px;">
          <strong>Cerro Machín</strong><br/>
          <span style="color:#F97316;font-weight:600;">⚠ Watch – Heightened unrest</span>
        </div>`
      );

    // Data point markers
    DATA_POINTS.forEach((point) => {
      const cfg = TYPE_CONFIG[point.type];
      let icon: L.DivIcon;

      if (cfg.shape === "pin") {
        icon = createPinIcon(cfg.color, point.label);
      } else if (cfg.shape === "volcano") {
        icon = createVolcanoIcon();
      } else if (cfg.shape === "sensor") {
        icon = createSensorIcon();
      } else {
        icon = createCircleIcon(cfg.color, cfg.size);
      }

      const marker = L.marker(point.position, { icon }).addTo(map);
      if (point.label) {
        marker.bindTooltip(point.label, { permanent: false, direction: "top" });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
