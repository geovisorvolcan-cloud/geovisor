"use client";

import { useState } from "react";
import { DynamicPoint } from "@/lib/appContext";

function parseCoord(val: string, min: number, max: number): number | null {
  const n = Number(val.trim());
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

interface ProgressAdjustItemProps {
  label: string;
  current: number;
  total: number;
  color: string;
  points: DynamicPoint[];
  onSetTotal: (newTotal: number) => void;
  onUpdatePoint: (id: string, updates: Partial<Pick<DynamicPoint, "position" | "description" | "acquired">>) => void;
  onDeletePoint: (id: string) => void;
}

export default function ProgressAdjustItem({
  label,
  current,
  total,
  color,
  points,
  onSetTotal,
  onUpdatePoint,
  onDeletePoint,
}: ProgressAdjustItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingTotal, setEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState(String(total));

  // per-point edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAcquired, setEditAcquired] = useState(false);
  const [editError, setEditError] = useState("");

  const boundedCurrent = Math.min(total, Math.max(0, current));
  const pct = total > 0 ? Math.round((boundedCurrent / total) * 100) : 0;
  const fillWidth = pct === 0 ? 0 : Math.max(pct, 2);

  const handleSaveTotal = () => {
    const parsed = Math.max(0, Math.round(Number(totalInput) || 0));
    onSetTotal(parsed);
    setTotalInput(String(parsed));
    setEditingTotal(false);
  };

  const startEdit = (point: DynamicPoint) => {
    setEditingId(point.id);
    setEditLat(String(point.position[0]));
    setEditLng(String(point.position[1]));
    setEditDesc(point.description ?? "");
    setEditAcquired(!!point.acquired);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const saveEdit = (id: string) => {
    const lat = parseCoord(editLat, -90, 90);
    const lng = parseCoord(editLng, -180, 180);
    if (lat === null) { setEditError("Latitude must be between -90 and 90."); return; }
    if (lng === null) { setEditError("Longitude must be between -180 and 180."); return; }
    onUpdatePoint(id, { position: [lat, lng], description: editDesc.trim() || undefined, acquired: editAcquired });
    cancelEdit();
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
      >
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <div
            className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
            style={{ width: `${fillWidth}%`, backgroundColor: color }}
          >
            {pct >= 10 && (
              <span className="text-white text-xs font-bold">{pct}%</span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{boundedCurrent} / {total} points</span>
          <span>{pct}%</span>
        </div>
      </button>

      {expanded && (
        <div className="mt-2 border border-gray-200 bg-gray-50 rounded-lg p-2 space-y-2">

          {/* Editable total */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 flex-1">Max points (total):</span>
            {editingTotal ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={totalInput}
                  onChange={(e) => setTotalInput(e.target.value)}
                  className="w-16 rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTotal();
                    if (e.key === "Escape") setEditingTotal(false);
                  }}
                />
                <button type="button" onClick={handleSaveTotal} className="text-xs font-semibold text-green-600 hover:text-green-800">✓</button>
                <button type="button" onClick={() => { setTotalInput(String(total)); setEditingTotal(false); }} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setTotalInput(String(total)); setEditingTotal(true); }}
                className="text-xs font-semibold text-gray-700 underline decoration-dotted hover:text-gray-900"
              >
                {total}
              </button>
            )}
          </div>

          {/* Points list with inline edit */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">
              Added points ({points.length})
            </p>
            {points.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No points added yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                {points.map((point) => (
                  <div key={point.id} className="rounded bg-white border border-gray-100 px-2 py-1.5">
                    {editingId === point.id ? (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-gray-800">{point.name}</p>
                        <div className="flex gap-1.5">
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 mb-0.5">Lat</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editLat}
                              onChange={(e) => setEditLat(e.target.value)}
                              className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] text-gray-400 mb-0.5">Lng</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editLng}
                              onChange={(e) => setEditLng(e.target.value)}
                              className="w-full text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-0.5">Description</label>
                          <textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            rows={2}
                            className="w-full resize-none text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                          />
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer pt-0.5">
                          <input
                            type="checkbox"
                            checked={editAcquired}
                            onChange={(e) => setEditAcquired(e.target.checked)}
                            className="w-3.5 h-3.5 accent-green-500"
                          />
                          <span className="text-xs text-gray-600 font-medium">Acquired</span>
                        </label>
                        {editError && <p className="text-red-500 text-[10px]">{editError}</p>}
                        <div className="flex gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() => saveEdit(point.id)}
                            className="flex-1 bg-orange-500 text-white text-[10px] font-bold py-1 rounded hover:bg-orange-600 transition"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="flex-1 bg-gray-100 text-gray-600 text-[10px] font-medium py-1 rounded hover:bg-gray-200 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => { onDeletePoint(point.id); cancelEdit(); }}
                            className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{point.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            {point.position[0].toFixed(5)}, {point.position[1].toFixed(5)}
                          </p>
                          {point.description && (
                            <p className="text-[10px] text-gray-400 truncate">{point.description}</p>
                          )}
                          <span
                            className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              point.acquired
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {point.acquired ? "Acquired" : "Characterized"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startEdit(point)}
                          className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-500 text-[10px] flex items-center justify-center hover:bg-blue-200 transition"
                          aria-label={`Edit ${point.name}`}
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
