"use client";

/**
 * Overlay zoom control buttons for the interactive map.
 */

import { Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

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

/**
 * A vertically stacked set of zoom control buttons rendered as a map overlay.
 *
 * Buttons are positioned absolutely in the bottom-left corner of the map
 * container. The component is purely presentational: callers own the zoom
 * state and pass callbacks for each action.
 *
 * @param props - Callbacks for zoom in, zoom out, and reset.
 * @returns Three icon buttons for map zoom control.
 */
export const ZoomControls = ({ onZoomIn, onZoomOut, onReset }: Props): ReactElement => (
  <div className="absolute bottom-4 left-4 flex flex-col gap-1">
    <Button variant="outline" size="icon" onClick={onZoomIn} aria-label="Zoom in">
      <Plus className="h-4 w-4" />
    </Button>
    <Button variant="outline" size="icon" onClick={onZoomOut} aria-label="Zoom out">
      <Minus className="h-4 w-4" />
    </Button>
    <Button variant="outline" size="icon" onClick={onReset} aria-label="Reset zoom">
      <RotateCcw className="h-4 w-4" />
    </Button>
  </div>
);
