"use client";

import { useState } from "react";

interface ProgressAdjustItemProps {
  label: string;
  current: number;
  total: number;
  color: string;
  onAdjust: (delta: number) => void;
}

export default function ProgressAdjustItem({
  label,
  current,
  total,
  color,
  onAdjust,
}: ProgressAdjustItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("1");
  const boundedCurrent = Math.min(total, Math.max(0, current));
  const pct = total > 0 ? Math.round((boundedCurrent / total) * 100) : 0;
  const fillWidth = pct === 0 ? 0 : Math.max(pct, 2);

  const parsedAmount = Math.max(0, Math.round(Number(amount) || 0));
  const canApply = parsedAmount > 0;

  const adjust = (direction: 1 | -1) => {
    if (!canApply) return;
    onAdjust(parsedAmount * direction);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full text-left"
      >
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden">
          <div
            className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
            style={{
              width: `${fillWidth}%`,
              backgroundColor: color,
            }}
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
        <div className="mt-2 border border-gray-200 bg-gray-50 rounded-lg p-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Adjust points
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjust(-1)}
              disabled={!canApply}
              className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold border border-gray-300 hover:bg-gray-300 disabled:opacity-40"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              onClick={() => adjust(1)}
              disabled={!canApply}
              className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold border border-gray-300 hover:bg-gray-300 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
