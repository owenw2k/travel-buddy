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

import type { ReactElement } from "react";

/**
 * Client-side app shell that gates the interactive map behind a Chromium check.
 *
 * Detection runs after mount (useEffect) to avoid a server/client hydration
 * mismatch: `navigator` is not available during SSR, so checking on mount
 * ensures the initial render is always consistent.
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
      <div className="flex flex-1 overflow-hidden">
        <LegendPanel />
        <main className="flex-1 overflow-hidden">
          <MapContainer />
        </main>
      </div>
    </div>
  );
};
