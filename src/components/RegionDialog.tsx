"use client";

/**
 * Dialog for assigning a legend category and note to a map region.
 */

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

/** Props for the RegionDialog component. */
type Props = {
  /** GeoJSON region identifier corresponding to a key in the store's regions map. */
  regionId: string;
  /** Human-readable region name shown in the dialog title. */
  regionName: string;
  /** Whether the dialog is currently open. */
  isOpen: boolean;
  /** Called when the user dismisses or saves the dialog. */
  onClose: () => void;
};

/**
 * Modal dialog for editing a map region's legend assignment and note.
 *
 * Note state is initialized from the store on mount. To reset note state
 * when the dialog opens for a different region, render this component with
 * `key={regionId}` in the parent — React's key prop remounts the component
 * with fresh state, which is cleaner than syncing via useEffect.
 *
 * Legend changes are applied immediately to the Zustand store. The note
 * is committed when the user clicks Save (or discarded on Cancel).
 *
 * @param props - Region identity, dialog visibility, and close callback.
 * @returns A shadcn Dialog for editing legend and note.
 */
export const RegionDialog = ({ regionId, regionName, isOpen, onClose }: Props): ReactElement => {
  const { legends, regions, assignRegion, unassignRegion, setRegionNote } = useMapStore();
  const [note, setNote] = useState(regions[regionId]?.note ?? "");

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const currentLegendId = regions[regionId]?.legendId || "none";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{regionName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Select value={currentLegendId} onValueChange={handleLegendChange}>
            <SelectTrigger aria-label={`Assign legend to ${regionName}`}>
              <SelectValue placeholder="Assign a legend..." />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
