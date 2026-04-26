"use client";

/**
 * Sidebar panel listing legend categories with color swatches, inline edit, and remove buttons.
 */

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

import { AddLegendModal } from "@/components/AddLegendModal";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Sidebar panel showing all legend categories.
 *
 * Each entry displays a color swatch and name. Clicking the pencil icon
 * enters inline edit mode: the swatch dot becomes a clickable button that
 * opens a hidden color picker, and the name becomes a text input. Clicking the trash button enters inline remove
 * confirmation before calling removeLegend. The "Add category" button at
 * the bottom opens the AddLegendModal.
 *
 * Only one row can be in edit or confirm mode at a time — entering either
 * state clears the other.
 *
 * @returns A `<aside>` sidebar listing legend items and an add-category trigger.
 */
export const LegendPanel = (): ReactElement => {
  const { legends, removeLegend, updateLegend } = useMapStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const startEdit = (id: string, name: string, color: string) => {
    setEditId(id);
    setEditName(name);
    setEditColor(color);
    setConfirmId(null);
  };

  const saveEdit = (id: string, originalName: string) => {
    updateLegend(id, { name: editName.trim() || originalName, color: editColor });
    setEditId(null);
  };

  const cancelEdit = () => setEditId(null);

  /** Ref to the hidden color input — only one row is ever in edit mode at a time. */
  const colorInputRef = useRef<HTMLInputElement>(null);

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
            {editId === legend.id ? (
              <>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="sr-only"
                  aria-label={`Color for ${legend.name}`}
                  tabIndex={-1}
                />
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="h-5 w-5 shrink-0 cursor-pointer rounded ring-offset-1 hover:ring-2 hover:ring-border"
                  style={{ backgroundColor: editColor }}
                  aria-label={`Change color for ${legend.name}`}
                />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveEdit(legend.id, legend.name);
                    }
                    if (e.key === "Escape") {
                      cancelEdit();
                    }
                  }}
                  className="min-w-0 flex-1 rounded border border-border bg-background px-1 py-0.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                  aria-label="Legend name"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-foreground"
                  onClick={() => saveEdit(legend.id, legend.name)}
                  aria-label={`Save ${legend.name}`}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground"
                  onClick={cancelEdit}
                  aria-label="Cancel edit"
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            ) : confirmId === legend.id ? (
              <>
                <span
                  className="h-5 w-5 shrink-0 rounded"
                  style={{ backgroundColor: legend.color }}
                  aria-hidden="true"
                />
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
                <span
                  className="h-5 w-5 shrink-0 rounded"
                  style={{ backgroundColor: legend.color }}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate text-sm text-foreground">{legend.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => startEdit(legend.id, legend.name, legend.color)}
                  aria-label={`Edit ${legend.name}`}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    setConfirmId(legend.id);
                    setEditId(null);
                  }}
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
