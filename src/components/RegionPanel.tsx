"use client";

/**
 * Floating chip panel for assigning a legend category to a map region.
 * Anchored at the coordinates where the user clicked on the map.
 */

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
 * Chip-based floating panel for assigning a legend to a map region.
 *
 * Positioned at the click coordinates inside the map container. Each legend
 * renders as a colored chip — clicking an unassigned chip assigns it; clicking
 * the currently assigned chip removes the assignment. Changes apply immediately
 * to the Zustand store (no Save/Cancel).
 *
 * Render with `key={regionId}` in the parent so React remounts with a clean
 * store read whenever the selected region changes.
 *
 * @param props - Region identity, click position, and close callback.
 * @returns A positioned floating panel for legend assignment.
 */
export const RegionPanel = ({ regionId, regionName, position, onClose }: Props): ReactElement => {
  const { legends, regions, assignRegion, unassignRegion } = useMapStore();
  const currentLegendId = regions[regionId]?.legendId ?? null;

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
      className="absolute z-10 rounded-xl border border-border bg-surface p-3 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{regionName}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </Button>
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
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white transition-opacity ${
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
