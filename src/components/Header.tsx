"use client";

/**
 * Application header with the app title, map toggle, dark mode toggle, and clear-data action.
 */

import { Check, Trash2, X } from "lucide-react";
import { useState } from "react";

import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * The top application header bar.
 *
 * Contains:
 * - App title using the Fraunces heading font
 * - World / United States map toggle buttons
 * - Clear-data button with inline confirmation
 * - Dark mode toggle
 *
 * The map toggle buttons reflect the current `world` value from the Zustand
 * store. Clicking one calls `setWorld` to switch views; MapContainer reacts
 * to the store change and swaps the active map.
 *
 * The clear-data button uses a two-step inline confirm (same pattern as the
 * legend remove button) to guard against accidental data loss.
 *
 * @returns A sticky header rendered inside a `<header>` element.
 */
export const Header = (): ReactElement => {
  const { world, setWorld, clearData } = useMapStore();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClearConfirm = () => {
    clearData();
    setIsConfirming(false);
  };

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4"
      data-screenshot="header"
    >
      <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
        Travel Buddy
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant={world ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setWorld(true);
          }}
          aria-pressed={world}
        >
          World
        </Button>
        <Button
          variant={!world ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setWorld(false);
          }}
          aria-pressed={!world}
        >
          United States
        </Button>
      </div>
      <div className="flex items-center gap-2">
        {isConfirming ? (
          <>
            <span className="text-xs text-destructive">Clear all data?</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleClearConfirm}
              aria-label="Confirm clear all data"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setIsConfirming(false)}
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setIsConfirming(true)}
            aria-label="Clear all data"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <DarkModeToggle />
      </div>
    </header>
  );
};
