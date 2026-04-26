"use client";

/**
 * Root client component: Chromium gate + full app layout.
 */

import { useEffect, useState } from "react";

import { Header } from "@/components/Header";
import { LegendPanel } from "@/components/LegendPanel";
import { MapContainer } from "@/components/MapContainer";
import { NonChromiumFallback } from "@/components/NonChromiumFallback";
import { isChromium } from "@/lib/browser";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Client-side app shell that gates the interactive map behind a Chromium check
 * and loads persisted map state from IndexedDB on mount.
 *
 * Both the Chromium detection and the IndexedDB hydration run in useEffect to
 * avoid server/client mismatches: `navigator` and IndexedDB are browser-only.
 *
 * Renders nothing visible (a transparent placeholder) until the browser check
 * completes, then shows either the full app layout (header + legend + map) or
 * the NonChromiumFallback page.
 *
 * @returns The full app layout for Chromium browsers; NonChromiumFallback otherwise.
 */
export const AppShell = (): ReactElement => {
  const [isChromiumBrowser, setIsChromiumBrowser] = useState<boolean | null>(null);

  useEffect(() => {
    void useMapStore.getState().hydrate();
  }, []);

  useEffect(() => {
    // Reading navigator.userAgent is a browser-side effect — must run after
    // mount to avoid SSR/client hydration mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsChromiumBrowser(isChromium());
  }, []);

  if (isChromiumBrowser === null) {
    return <div className="h-screen bg-background" aria-hidden="true" />;
  }

  if (!isChromiumBrowser) {
    return <NonChromiumFallback />;
  }

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
