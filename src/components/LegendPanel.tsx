"use client";

/**
 * Sidebar panel listing legend categories with color swatches and remove buttons.
 */

import { Trash2 } from "lucide-react";

import { AddLegendModal } from "@/components/AddLegendModal";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Sidebar panel showing all legend categories.
 *
 * Each entry displays a color swatch and name. A trash button removes the
 * category and unassigns it from all regions. The "Add category" button at
 * the bottom opens the AddLegendModal.
 *
 * @returns A `<aside>` sidebar listing legend items and an add-category trigger.
 */
export const LegendPanel = (): ReactElement => {
  const { legends, removeLegend } = useMapStore();

  return (
    <aside
      className="flex w-56 shrink-0 flex-col gap-3 overflow-y-auto border-r border-border bg-surface p-4"
      data-screenshot="legend-panel"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Legend
      </h2>
      <ul className="flex flex-col gap-1">
        {legends.map((legend) => (
          <li key={legend.id} className="flex items-center gap-2 rounded-md px-1 py-1">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: legend.color }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate text-sm text-foreground">{legend.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => {
                removeLegend(legend.id);
              }}
              aria-label={`Remove ${legend.name}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </li>
        ))}
      </ul>
      <AddLegendModal />
    </aside>
  );
};
