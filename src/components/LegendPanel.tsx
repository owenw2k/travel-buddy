"use client";

/**
 * Sidebar panel listing legend categories with color swatches and remove buttons.
 */

import { Check, Trash2, X } from "lucide-react";
import { useState } from "react";

import { AddLegendModal } from "@/components/AddLegendModal";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Sidebar panel showing all legend categories.
 *
 * Each entry displays a color swatch and name. Clicking the trash button
 * enters an inline confirmation state — the item shows "Remove?" with confirm
 * and cancel buttons before calling removeLegend. The "Add category" button
 * at the bottom opens the AddLegendModal.
 *
 * @returns A `<aside>` sidebar listing legend items and an add-category trigger.
 */
export const LegendPanel = (): ReactElement => {
  const { legends, removeLegend } = useMapStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <aside
      className="flex w-full shrink-0 flex-row items-center gap-2 overflow-x-auto border-t border-border bg-surface p-3 md:w-56 md:flex-col md:items-stretch md:gap-3 md:overflow-x-visible md:overflow-y-auto md:border-r md:border-t-0 md:p-4"
      data-screenshot="legend-panel"
    >
      <h2 className="hidden text-sm font-semibold uppercase tracking-wider text-muted-foreground md:block">
        Legend
      </h2>
      <ul className="flex flex-row items-center gap-2 md:flex-col md:items-stretch md:gap-1">
        {legends.map((legend) => (
          <li key={legend.id} className="flex shrink-0 items-center gap-2 rounded-md px-1 py-1">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: legend.color }}
              aria-hidden="true"
            />
            {confirmId === legend.id ? (
              <>
                <span className="flex-1 truncate text-xs text-destructive">Remove?</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
                  onClick={() => {
                    removeLegend(legend.id);
                    setConfirmId(null);
                  }}
                  aria-label={`Confirm remove ${legend.name}`}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground"
                  onClick={() => setConfirmId(null)}
                  aria-label="Cancel"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 truncate text-sm text-foreground">{legend.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmId(legend.id)}
                  aria-label={`Remove ${legend.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
      <AddLegendModal />
    </aside>
  );
};
