"use client";

/**
 * Fallback page shown to users on non-Chromium browsers.
 *
 * Travel Buddy relies on Chromium-specific SVG and rendering APIs, so
 * Safari and Firefox are not supported. This component is the tone
 * reference for all error pages across the project: playful, travel-themed,
 * never shows technical details, always includes a way back.
 *
 * Detection lives in the page component (`isChromium()` from browser.ts).
 * This component is pure UI — no detection logic inside.
 */
import type { ReactElement } from "react";

/**
 * Full-page fallback for non-Chromium browsers.
 *
 * @returns A full-page error view with a humorous travel-themed message.
 */
export const NonChromiumFallback = (): ReactElement => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
    <div className="text-5xl" aria-hidden="true">
      🧭
    </div>
    <h1 className="text-3xl font-semibold text-foreground">Wrong browser, adventurer.</h1>
    <p className="max-w-md text-text-muted">
      Travel Buddy only runs in Chromium-based browsers: Chrome, Edge, Arc, or Brave. Looks like you
      wandered off the map.
    </p>
    <a
      href="https://www.google.com/chrome/"
      className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
    >
      Get Chrome
    </a>
  </main>
);
