"use client";

/**
 * Application header with the app title, map toggle, and dark mode toggle.
 */

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
 * - Dark mode toggle
 *
 * The map toggle buttons reflect the current `world` value from the Zustand
 * store. Clicking one calls `setWorld` to switch views; MapContainer reacts
 * to the store change and swaps the active map.
 *
 * @returns A sticky header rendered inside a `<header>` element.
 */
export const Header = (): ReactElement => {
  const { world, setWorld } = useMapStore();

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
      <DarkModeToggle />
    </header>
  );
};
