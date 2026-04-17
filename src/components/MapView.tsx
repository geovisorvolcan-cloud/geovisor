"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VOLCANO_ALERT, VOLCANO_POSITION, DATA_POINTS } from "@/lib/mapData";
import {
  DynamicPoint,
  DynamicPointType,
  ParticipantEntry,
} from "@/lib/appContext";

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

function createParticipantIcon(color: string, label?: string) {
  const safeLabel = label ? escapeHtml(label) : "";
  // Concentric-rings style (like field radio / GPS tracker)
  const html = `<div style="position:relative;display:inline-flex;align-items:center;justify-content:center;">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="5" fill="${color}"/>
      <circle cx="16" cy="16" r="9.5" stroke="${color}" stroke-width="1.8" fill="none" opacity="0.65"/>
      <circle cx="16" cy="16" r="14" stroke="${color}" stroke-width="1.2" fill="none" opacity="0.3"/>
    </svg>
    ${
      safeLabel
        ? `<span style="position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);
              font-size:9px;font-weight:700;color:white;background:${color};
              padding:1px 5px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.3);">${safeLabel}</span>`
        : ""
    }
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -22],
  });
}

function createVolcanoIcon() {
  const html = `<div style="display:flex;align-items:center;justify-content:center;">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="22" fill="rgba(249,115,22,0.18)"/>
      <polygon points="22,6 38,36 6,36" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="22" cy="12" r="3" fill="white" stroke="#1f2937" stroke-width="2"/>
    </svg>
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -26],
  });
}

function normalizePointType(type: string): DynamicPointType {
  if (type === "mt_acquisition") return "uis_geophysics";
  if (type === "sgi_geo") return "sgi_magnetometry";
  if (
    type === "social" ||
    type === "sgi_magnetometry" ||
    type === "sgi_gravimetry" ||
    type === "gidco" ||
    type === "uis_geophysics"
  ) {
    return type;
  }
  return "social";
}

function createDynamicPointIcon(type: DynamicPointType) {
  const pulseStyle = `
    <style>
      @keyframes geovisor-point-pulse {
        0% { transform: translate(-50%, -50%) scale(0.65); opacity: 0.45; }
        70% { transform: translate(-50%, -50%) scale(1.45); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1.45); opacity: 0; }
      }
    </style>`;

  if (type === "uis_geophysics") {
    const html = `<div style="position:relative;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="11" fill="#F97316" stroke="white" stroke-width="2"/>
        <ellipse cx="14" cy="14" rx="4.5" ry="11" stroke="white" stroke-width="1.4" opacity="0.85"/>
        <path d="M4 14H24" stroke="white" stroke-width="1.4" opacity="0.85"/>
        <path d="M6.5 9.2H21.5M6.5 18.8H21.5" stroke="white" stroke-width="1.2" opacity="0.75"/>
      </svg>
    </div>`;
    return L.divIcon({
      html,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -18],
    });
  }

  if (type === "sgi_magnetometry" || type === "sgi_gravimetry" || type === "sgi_geo") {
    const color = type === "sgi_gravimetry" ? "#EC4899" : "#D946EF";
    const html = `${pulseStyle}<div style="position:relative;width:30px;height:30px;">
      <div style="position:absolute;left:50%;top:50%;width:24px;height:24px;border-radius:50%;background:${color};opacity:0.22;animation:geovisor-point-pulse 1.8s ease-out infinite;"></div>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute;left:0;top:0;">
        <path d="M15 4L27 25H3L15 4Z" fill="${color}" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </div>`;
    return L.divIcon({
      html,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -18],
    });
  }

  const color = type === "gidco" ? "#22C55E" : "#3B82F6";
  const html = `${pulseStyle}<div style="position:relative;width:28px;height:28px;">
    <div style="position:absolute;left:50%;top:50%;width:22px;height:22px;border-radius:50%;background:${color};opacity:0.24;animation:geovisor-point-pulse 1.8s ease-out infinite;"></div>
    <div style="position:absolute;left:50%;top:50%;width:14px;height:14px;border-radius:50%;transform:translate(-50%, -50%);background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

// ─── Dynamic type config ──────────────────────────────────────────────────────

const DYNAMIC_LABEL: Record<DynamicPointType, string> = {
  social: "Social and environmental characterization",
  sgi_geo: "SGI GEO (Magnetometry)",
  sgi_magnetometry: "SGI GEO (Magnetometry)",
  sgi_gravimetry: "SGI GEO (Gravimetry)",
  gidco: "GIDCO (Magnetotelluric)",
  uis_geophysics: "UIS Geophysics Team (Magnetotelluric)",
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MapViewProps {
  useSatellite?: boolean;
  extraPoints?: DynamicPoint[];
  participantEntries?: ParticipantEntry[];
  onMapClick?: (position: [number, number]) => void;
  isPickingLocation?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapView({
  useSatellite = true,
  extraPoints = [],
  participantEntries = [],
  onMapClick,
  isPickingLocation = false,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dynMarkersRef = useRef<L.Marker[]>([]);
  const partMarkersRef = useRef<L.Marker[]>([]);

  // ── Initialize map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: VOLCANO_POSITION,
      zoom: 12,
      zoomControl: true,
    });

    if (useSatellite) {
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, DigitalGlobe",
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    }

    // Volcano marker
    L.marker(VOLCANO_POSITION, { icon: createVolcanoIcon() })
      .addTo(map)
      .bindPopup(
        `<div style="font-size:13px;padding:8px 12px;min-width:140px;">
          <strong style="display:block;margin-bottom:4px;">Cerro Machín</strong>
          <span style="color:#ca8a04;font-weight:700;">⚠ ${escapeHtml(
            VOLCANO_ALERT.level
          )} alert</span>
          <div style="color:#374151;margin-top:4px;">${escapeHtml(
            VOLCANO_ALERT.status
          )}</div>
          <div style="color:#6b7280;margin-top:4px;">${escapeHtml(
            VOLCANO_ALERT.description
          )}</div>
        </div>`
      );

    // Static data points (no field participants – those come from participantEntries)
    DATA_POINTS.forEach((point) => {
      const iconType = normalizePointType(point.type);
      const icon = createDynamicPointIcon(iconType);

      const marker = L.marker(point.position, { icon }).addTo(map);
      if (point.label) {
        marker.bindTooltip(escapeHtml(point.label), {
          permanent: false,
          direction: "top",
        });
      }
      if (point.description) {
        marker.bindPopup(
          `<div style="font-size:12px;padding:6px 10px;">
            ${point.label ? `<strong>${escapeHtml(point.label)}</strong><br/>` : ""}
            ${escapeHtml(point.description)}
          </div>`
        );
      }
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Dynamic (admin-added) points ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    dynMarkersRef.current.forEach((m) => map.removeLayer(m));
    dynMarkersRef.current = [];

    extraPoints.forEach((pt) => {
      const pointType = normalizePointType(pt.type);
      const typeLabel = DYNAMIC_LABEL[pointType] ?? pointType;
      const icon = createDynamicPointIcon(pointType);
      const added = new Date(pt.addedAt).toLocaleString();
      const [latitude, longitude] = pt.position;

      const popup = `
        <div style="font-size:12px;padding:8px 10px;min-width:150px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:3px;">${escapeHtml(pt.name)}</div>
          <div style="color:#6b7280;margin-bottom:4px;">${escapeHtml(typeLabel)}</div>
          <div style="color:#374151;margin-bottom:4px;">
            Lat ${formatCoordinate(latitude)}, Lng ${formatCoordinate(longitude)}
          </div>
          ${
            pt.description
              ? `<div style="color:#374151;margin-bottom:4px;">${escapeHtml(pt.description)}</div>`
              : ""
          }
          <div style="color:#9ca3af;font-size:10px;">Added: ${added}</div>
        </div>`;

      const marker = L.marker(pt.position, { icon }).addTo(map).bindPopup(popup);
      dynMarkersRef.current.push(marker);
    });
  }, [extraPoints]);

  // ── Participant markers ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    partMarkersRef.current.forEach((m) => map.removeLayer(m));
    partMarkersRef.current = [];

    participantEntries
      .filter((p) => p.role === "field" && p.position)
      .forEach((p) => {
        const color = p.role === "field" ? "#EF4444" : "#3B82F6";
        const icon = createParticipantIcon(color, p.name);
        const ec = p.emergencyContact;
        const [latitude, longitude] = p.position!;

        const ecHtml = ec
          ? `<div style="border-top:1px solid #e5e7eb;margin-top:6px;padding-top:6px;">
               <div style="font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;margin-bottom:3px;">Emergency Contact</div>
               <div style="font-weight:600;">${escapeHtml(ec.name)}</div>
               <div style="color:#6b7280;">${escapeHtml(ec.affiliation)}</div>
               <div style="color:#374151;">${escapeHtml(ec.phone)}</div>
             </div>`
          : "";

        const popup = `
          <div style="font-size:12px;padding:8px 10px;min-width:150px;">
            <div style="font-weight:700;font-size:13px;margin-bottom:2px;">${escapeHtml(p.name)}</div>
            <div style="color:${color};font-weight:600;margin-bottom:4px;">
              ${p.role === "field" ? "Field" : "Office"} Participant
            </div>
            <div style="color:#374151;margin-bottom:4px;">
              Lat ${formatCoordinate(latitude)}, Lng ${formatCoordinate(longitude)}
            </div>
            ${ecHtml}
          </div>`;

        const marker = L.marker(p.position!, { icon })
          .addTo(map)
          .bindPopup(popup);
        partMarkersRef.current.push(marker);
      });
  }, [participantEntries]);

  // ── Optional map click placement mode ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onMapClick) return;

    const handler = (event: L.LeafletMouseEvent) => {
      onMapClick([event.latlng.lat, event.latlng.lng]);
    };

    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onMapClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const container = map.getContainer();
    container.style.cursor = isPickingLocation ? "crosshair" : "";

    return () => {
      container.style.cursor = "";
    };
  }, [isPickingLocation]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
