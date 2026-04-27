"use client";

/**
 * Sidebar panel listing legend categories with color swatches, inline edit, and remove buttons.
 *
 * On desktop (md+) it renders as a fixed left sidebar. On mobile it collapses
 * to a 48px bottom strip showing color swatch previews; tapping the strip
 * expands a scrollable drawer with the full legend list.
 */

import { Check, ChevronUp, Pencil, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

import { AddLegendModal } from "@/components/AddLegendModal";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/** Shared classes for the plain icon action buttons — no hover background box. */
const iconBtn = "flex h-6 w-6 shrink-0 items-center justify-center transition-colors";

/**
 * Sidebar / bottom-drawer panel showing all legend categories.
 *
 * Each entry displays a color swatch and name. Clicking the pencil icon
 * enters inline edit mode: the swatch dot becomes a clickable button that
 * opens a hidden color picker, and the name becomes a text input. Clicking
 * the trash button enters inline remove confirmation before calling
 * removeLegend. The "Add category" button at the bottom opens AddLegendModal.
 *
 * Only one row can be in edit or confirm mode at a time — entering either
 * state clears the other.
 *
 * @returns An `<aside>` that renders as a sidebar on desktop and a collapsible
 *   bottom drawer on mobile.
 */
export const LegendPanel = (): ReactElement => {
  const { legends, removeLegend, updateLegend } = useMapStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
      className={cn(
        "flex w-full shrink-0 flex-col border-t border-border bg-surface",
        "md:h-auto md:w-56 md:overflow-y-auto md:border-r md:border-t-0 md:p-4 md:gap-3",
        isOpen ? "h-72" : "h-12"
      )}
      data-screenshot="legend-panel"
    >
      {/* Mobile toggle strip — hidden on desktop */}
      <button
        type="button"
        className="flex h-12 shrink-0 items-center gap-2 px-3 md:hidden"
        aria-label={isOpen ? "Close legend" : "Open legend"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span className="text-sm font-semibold text-foreground">Legend</span>
        <div className="flex flex-1 items-center gap-1.5 overflow-hidden" aria-hidden="true">
          {legends.map((l) => (
            <span
              key={l.id}
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: l.color }}
            />
          ))}
        </div>
        <ChevronUp
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Desktop sidebar heading */}
      <h2 className="hidden border-b border-border pb-2 text-base font-semibold text-foreground md:block">
        Legend
      </h2>

      {/* Scrollable content: always visible on desktop, toggled on mobile */}
      <div
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 md:flex md:gap-1 md:p-0",
          isOpen ? "flex" : "hidden md:flex"
        )}
      >
        <ul className="flex flex-col gap-1">
          {legends.map((legend) => (
            <li
              key={legend.id}
              className="flex shrink-0 items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-background/70"
            >
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
                  <button
                    className={`${iconBtn} text-foreground hover:text-foreground/70`}
                    onClick={() => saveEdit(legend.id, legend.name)}
                    aria-label={`Save ${legend.name}`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    className={`${iconBtn} text-muted-foreground hover:text-foreground`}
                    onClick={cancelEdit}
                    aria-label="Cancel edit"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : confirmId === legend.id ? (
                <>
                  <span
                    className="h-5 w-5 shrink-0 rounded"
                    style={{ backgroundColor: legend.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate text-xs text-destructive">Remove?</span>
                  <button
                    className={`${iconBtn} text-destructive hover:text-destructive/70`}
                    onClick={() => {
                      removeLegend(legend.id);
                      setConfirmId(null);
                    }}
                    aria-label={`Confirm remove ${legend.name}`}
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    className={`${iconBtn} text-muted-foreground hover:text-foreground`}
                    onClick={() => setConfirmId(null)}
                    aria-label="Cancel"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="h-5 w-5 shrink-0 rounded"
                    style={{ backgroundColor: legend.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate text-sm text-foreground">{legend.name}</span>
                  <button
                    className={`${iconBtn} text-muted-foreground hover:text-foreground`}
                    onClick={() => startEdit(legend.id, legend.name, legend.color)}
                    aria-label={`Edit ${legend.name}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    className={`${iconBtn} text-muted-foreground hover:text-destructive`}
                    onClick={() => {
                      setConfirmId(legend.id);
                      setEditId(null);
                    }}
                    aria-label={`Remove ${legend.name}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        <AddLegendModal />
      </div>
    </aside>
  );
};
