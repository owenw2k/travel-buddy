/**
 * Browser detection utilities for the Travel Buddy Chromium-only requirement.
 *
 * The map uses SVG APIs and browser features that only work reliably in Chromium.
 * Non-Chromium browsers (Safari, Firefox) receive a fallback page before any map loads.
 */

/**
 * Returns true if the current browser is Chromium-based.
 *
 * Detects Chrome, Edge (Edg/), Arc, Brave, and Opera (OPR/) via the user agent string.
 * Returns true on the server (SSR) so the fallback is only shown on the client.
 *
 * @returns True if Chromium-based or running server-side; false for Firefox or Safari.
 * @example
 * if (!isChromium()) {
 *   return <NonChromiumFallback />;
 * }
 */
export const isChromium = (): boolean => {
  if (typeof navigator === "undefined") {
    // SSR: don't block rendering — client will re-check after hydration.
    return true;
  }

  const ua = navigator.userAgent;

  if (/Firefox/i.test(ua)) {
    return false;
  }

  // Pure Safari: has "Safari" but not "Chrome" or "CriOS" (Chrome on iOS).
  if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
    return false;
  }

  return /Chrome|Chromium|Edg\/|OPR\//i.test(ua);
};
