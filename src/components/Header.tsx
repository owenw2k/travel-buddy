"use client";

/**
 * Application header with the app title, map toggle, stats modal, dark mode toggle, and clear-data action.
 */

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { DarkModeToggle } from "@/components/DarkModeToggle";
import { StatsModal } from "@/components/StatsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * The top application header bar.
 *
 * Contains:
 * - App title using the Fraunces heading font
 * - World / United States map toggle buttons
 * - Stats modal button showing per-legend region counts
 * - Clear-data button that opens a confirmation dialog before wiping all state
 * - Dark mode toggle
 *
 * The map toggle buttons reflect the current `world` value from the Zustand
 * store. Clicking one calls `setWorld` to switch views; MapContainer reacts
 * to the store change and swaps the active map.
 *
 * @returns A sticky header rendered inside a `<header>` element.
 */
export const Header = (): ReactElement => {
  const { world, setWorld, clearData } = useMapStore();
  const [isClearOpen, setIsClearOpen] = useState(false);

  const handleClearConfirm = () => {
    clearData();
    setIsClearOpen(false);
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
      <div className="flex items-center gap-1">
        <StatsModal />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Clear all data"
          onClick={() => setIsClearOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <AlertDialog open={isClearOpen} onOpenChange={setIsClearOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes all your legend categories and region assignments. It cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleClearConfirm}
              >
                Clear all data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DarkModeToggle />
      </div>
    </header>
  );
};
