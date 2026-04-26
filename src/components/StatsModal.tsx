"use client";

/**
 * Modal showing per-legend region assignment counts and progress bars.
 */

import { BarChart2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Header button that opens a stats modal breaking down how many regions
 * have been assigned to each legend category.
 *
 * Reads directly from the Zustand store — no props needed. The button
 * and dialog are co-located here so the open state stays local.
 *
 * @returns A ghost icon button that opens the stats dialog when clicked.
 */
export const StatsModal = (): ReactElement => {
  const { legends, regions } = useMapStore();
  const [open, setOpen] = useState(false);

  const assignedEntries = Object.values(regions).filter((r) => r.legendId);
  const total = assignedEntries.length;

  /** Count of assigned regions per legend id. */
  const countsByLegend = Object.fromEntries(legends.map((l) => [l.id, 0]));
  for (const entry of assignedEntries) {
    if (entry.legendId in countsByLegend) {
      countsByLegend[entry.legendId] = (countsByLegend[entry.legendId] ?? 0) + 1;
    }
  }

  const totalLabel =
    total === 0 ? "No regions marked yet." : `${total} region${total === 1 ? "" : "s"} marked`;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="View stats"
        onClick={() => setOpen(true)}
      >
        <BarChart2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stats</DialogTitle>
            <DialogDescription>{totalLabel}</DialogDescription>
          </DialogHeader>
          {legends.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No legend categories yet. Add some in the legend panel.
            </p>
          ) : (
            <ul className="flex flex-col gap-3 pt-1">
              {legends.map((legend) => {
                const count = countsByLegend[legend.id] ?? 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <li key={legend.id} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: legend.color }}
                      aria-hidden="true"
                    />
                    <span className="w-24 shrink-0 truncate text-sm text-foreground">
                      {legend.name}
                    </span>
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${legend.name} progress`}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: legend.color }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
