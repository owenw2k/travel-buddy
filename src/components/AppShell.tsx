"use client";

/**
 * Root client component: hydrates persisted map state and renders the full app layout.
 */

import { useEffect } from "react";

import { Header } from "@/components/Header";
import { LegendPanel } from "@/components/LegendPanel";
import { MapContainer } from "@/components/MapContainer";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Client-side app shell that loads persisted map state from storage on mount
 * and renders the full app layout (header, legend panel, map).
 *
 * The IndexedDB hydration runs in useEffect to avoid server/client mismatches:
 * storage APIs are browser-only.
 *
 * @returns The full app layout.
 */
export const AppShell = (): ReactElement => {
  useEffect(() => {
    useMapStore.getState().hydrate();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 flex-col-reverse overflow-hidden md:flex-row">
        <LegendPanel />
        <main className="min-h-0 flex-1 overflow-hidden">
          <MapContainer />
        </main>
      </div>
    </div>
  );
};
