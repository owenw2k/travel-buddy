"use client";

/**
 * Client-side map orchestrator: hydrates state and renders the active map.
 */

import dynamic from "next/dynamic";
import { useEffect } from "react";

import { MapErrorBoundary } from "@/components/MapErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Loading skeleton shown while the map component bundle and GeoJSON load.
 *
 * @returns An animated skeleton sized to fill the map container.
 */
const MapSkeleton = (): ReactElement => (
  <div className="h-full w-full p-4">
    <Skeleton className="h-full w-full rounded-lg" />
  </div>
);

/**
 * Dynamically imported world map — SSR disabled to prevent SVG hydration
 * mismatches from react-simple-maps.
 */
const WorldMap = dynamic(() => import("./WorldMap").then((m) => ({ default: m.WorldMap })), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * Dynamically imported US map — SSR disabled for the same reason as WorldMap.
 */
const AmericaMap = dynamic(() => import("./AmericaMap").then((m) => ({ default: m.AmericaMap })), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * Orchestrates the map view for Travel Buddy.
 *
 * On mount, loads the previously persisted state from IndexedDB via
 * `hydrate()`. Renders either the world map or the US states map based on
 * the `world` flag in the Zustand store.
 *
 * Both map components are loaded client-side only (ssr: false) to avoid
 * hydration mismatches caused by react-simple-maps SVG path calculations
 * that differ between server and browser environments.
 *
 * @returns The active map (world or US) in a full-height responsive container.
 */
export const MapContainer = (): ReactElement => {
  const { world, hydrate } = useMapStore();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: "var(--map-ocean)" }}
    >
      <MapErrorBoundary>{world ? <WorldMap /> : <AmericaMap />}</MapErrorBoundary>
    </div>
  );
};
