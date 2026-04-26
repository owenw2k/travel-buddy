"use client";

/**
 * Overlay zoom control buttons for the interactive map.
 */

import { Minus, Plus, RotateCcw } from "lucide-react";

import type { ReactElement } from "react";

/** Props for the ZoomControls component. */
type Props = {
  /** Called when the user clicks the zoom-in (+) button. */
  onZoomIn: () => void;
  /** Called when the user clicks the zoom-out (-) button. */
  onZoomOut: () => void;
  /** Called when the user clicks the reset button. */
  onReset: () => void;
};

/** Shared classes for each control button in the cluster. */
const clusterBtn =
  "flex h-9 w-9 items-center justify-center text-foreground/60 transition-colors hover:bg-background hover:text-foreground";

/**
 * A vertically grouped map navigation cluster rendered as a map overlay.
 *
 * The three controls (zoom in, zoom out, reset) are presented as a single
 * card unit with hairline dividers, positioned in the bottom-left corner of
 * the map container. Callers own the zoom state and pass callbacks for each
 * action.
 *
 * @param props - Callbacks for zoom in, zoom out, and reset.
 * @returns A grouped card of map zoom controls.
 */
export const ZoomControls = ({ onZoomIn, onZoomOut, onReset }: Props): ReactElement => (
  <div
    className="absolute bottom-4 left-4 flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md"
    data-screenshot="zoom-controls"
  >
    <button
      className={`${clusterBtn} border-b border-border`}
      onClick={onZoomIn}
      aria-label="Zoom in"
    >
      <Plus className="h-4 w-4" />
    </button>
    <button
      className={`${clusterBtn} border-b border-border`}
      onClick={onZoomOut}
      aria-label="Zoom out"
    >
      <Minus className="h-4 w-4" />
    </button>
    <button className={clusterBtn} onClick={onReset} aria-label="Reset zoom">
      <RotateCcw className="h-3.5 w-3.5" />
    </button>
  </div>
);
