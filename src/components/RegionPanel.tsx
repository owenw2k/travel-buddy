"use client";

/**
 * Floating callout panel for assigning a legend category to a map region.
 * Anchored at the coordinates where the user clicked on the map.
 */

import { MapPin, X } from "lucide-react";

import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/** Width of the panel in pixels — used to center it on the click point. */
const PANEL_WIDTH = 240;

/** Props for the RegionPanel component. */
type Props = {
  /** GeoJSON region identifier corresponding to a key in the store's regions map. */
  regionId: string;
  /** Human-readable region name shown in the panel header. */
  regionName: string;
  /** Click coordinates relative to the map container, used to position the panel. */
  position: { x: number; y: number };
  /** Called when the user dismisses the panel. */
  onClose: () => void;
};

/**
 * Chip-based floating callout for assigning a legend to a map region.
 *
 * Positioned at the click coordinates inside the map container. A small
 * upward-pointing arrow connects the panel to the click point. Each legend
 * renders as a colored chip — clicking an unassigned chip assigns it; clicking
 * the currently assigned chip removes the assignment. Changes apply immediately
 * to the Zustand store (no Save/Cancel).
 *
 * Render with `key={regionId}` in the parent so React remounts with a clean
 * store read whenever the selected region changes.
 *
 * @param props - Region identity, click position, and close callback.
 * @returns A positioned floating callout panel for legend assignment.
 */
export const RegionPanel = ({ regionId, regionName, position, onClose }: Props): ReactElement => {
  const { legends, regions, assignRegion, unassignRegion } = useMapStore();
  const currentLegendId = regions[regionId]?.legendId ?? null;
  const currentLegend = legends.find((l) => l.id === currentLegendId);

  const handleLegendClick = (legendId: string) => {
    if (currentLegendId === legendId) {
      unassignRegion(regionId);
    } else {
      assignRegion(regionId, legendId);
    }
  };

  const left = Math.max(8, position.x - PANEL_WIDTH / 2);
  const top = Math.max(8, position.y);

  return (
    <div
      role="dialog"
      aria-label={regionName}
      style={{ left, top, width: PANEL_WIDTH }}
      className="animate-in fade-in slide-in-from-bottom-1 absolute z-10 rounded-2xl border border-border/60 bg-surface p-3 shadow-xl duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        aria-hidden="true"
        className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border/60 bg-surface"
      />
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <MapPin
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: currentLegend?.color ?? "var(--color-text-muted)" }}
            aria-hidden="true"
          />
          <h3 className="text-base font-semibold text-foreground">{regionName}</h3>
        </div>
        <button
          className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      {legends.length === 0 ? (
        <p className="text-xs text-muted-foreground">No legends yet — add one in the panel.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {legends.map((legend) => (
            <button
              key={legend.id}
              type="button"
              aria-pressed={currentLegendId === legend.id}
              aria-label={legend.name}
              onClick={() => handleLegendClick(legend.id)}
              className={`rounded-md px-3 py-1 text-sm font-medium text-white transition-opacity ${
                currentLegendId === legend.id
                  ? "opacity-100 ring-2 ring-white/50 ring-offset-1"
                  : "opacity-60 hover:opacity-90"
              }`}
              style={{ backgroundColor: legend.color }}
            >
              {legend.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
