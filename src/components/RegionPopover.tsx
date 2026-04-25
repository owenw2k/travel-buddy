"use client";

/**
 * Non-blocking floating card for assigning a legend and note to a map region.
 */

import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/** Props for the RegionPopover component. */
type Props = {
  /** GeoJSON region identifier corresponding to a key in the store's regions map. */
  regionId: string;
  /** Human-readable region name shown as the card title. */
  regionName: string;
  /** Called when the user saves or dismisses the card. */
  onClose: () => void;
};

/**
 * A small floating card anchored to the bottom-right of the map container.
 *
 * Unlike a modal dialog this card has no backdrop overlay — the map remains
 * fully interactive while it is open. Legend changes are applied immediately
 * to the Zustand store. The note is committed when the user clicks Save.
 *
 * Render with `key={regionId}` in the parent so React remounts with fresh
 * note state whenever the selected region changes.
 *
 * The SelectValue children explicitly render the swatch + name so that the
 * trigger displays correctly even when the legend ID is a UUID — Radix Select
 * cannot reliably extract display text from complex JSX children in SelectItem.
 *
 * @param props - Region identity and close callback.
 * @returns A positioned card for legend assignment and note editing.
 */
export const RegionPopover = ({ regionId, regionName, onClose }: Props): ReactElement => {
  const { legends, regions, assignRegion, unassignRegion, setRegionNote } = useMapStore();
  const [note, setNote] = useState(regions[regionId]?.note ?? "");

  const currentLegendId = regions[regionId]?.legendId || "none";
  const currentLegend = legends.find((l) => l.id === currentLegendId);

  const handleLegendChange = (value: string | null) => {
    if (!value || value === "none") {
      unassignRegion(regionId);
    } else {
      assignRegion(regionId, value);
    }
  };

  const handleSave = () => {
    setRegionNote(regionId, note);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label={regionName}
      className="absolute bottom-4 right-4 z-10 flex w-64 flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{regionName}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Select value={currentLegendId} onValueChange={handleLegendChange}>
        <SelectTrigger aria-label={`Assign legend to ${regionName}`}>
          <SelectValue placeholder="Assign a legend...">
            {currentLegend ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: currentLegend.color }}
                  aria-hidden="true"
                />
                {currentLegend.name}
              </span>
            ) : currentLegendId !== "none" ? null : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {legends.map((legend) => (
            <SelectItem key={legend.id} value={legend.id}>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: legend.color }}
                  aria-hidden="true"
                />
                {legend.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Add a note about this region..."
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
        }}
        aria-label={`Note for ${regionName}`}
        rows={3}
      />
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
};
