/**
 * Share URL encoding and decoding utilities.
 *
 * State is serialized as JSON, base64-encoded, then made URL-safe by replacing
 * the three base64 characters that are invalid in URLs (+, /, =) with (-_, ~).
 * The encoded value is stored in the `s` query parameter: /share?s=...
 *
 * No server involvement — all encoding and decoding is client-side.
 */

import type { MapState } from "@/types";

/**
 * Maximum supported share URL length in characters.
 * URLs longer than this are likely to be rejected by browsers or servers.
 */
export const MAX_SHARE_URL_LENGTH = 2000;

/**
 * The share URL prefix used when computing total URL length.
 */
const SHARE_URL_PREFIX = "/share?s=";

/**
 * Converts standard base64 to URL-safe base64 by replacing +, /, = with -, _, ~.
 *
 * @param b64 - Standard base64 string.
 * @returns URL-safe base64 string.
 */
const toUrlSafe = (b64: string): string =>
  b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "~");

/**
 * Converts URL-safe base64 back to standard base64.
 *
 * @param safe - URL-safe base64 string.
 * @returns Standard base64 string.
 */
const fromUrlSafe = (safe: string): string =>
  safe.replace(/-/g, "+").replace(/_/g, "/").replace(/~/g, "=");

/**
 * Encodes a MapState as a URL-safe base64 string for use in a share URL.
 *
 * @param state - The MapState to encode.
 * @returns URL-safe encoded string, suitable for the `s` query parameter.
 * @example
 * const encoded = encodeState(store.getState());
 * router.push(`/share?s=${encoded}`);
 */
export const encodeState = (state: MapState): string => {
  const json = JSON.stringify(state);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return toUrlSafe(b64);
};

/**
 * Decodes a URL-safe base64 string back into a MapState.
 *
 * @param encoded - URL-safe base64 string from the `s` query parameter.
 * @returns Decoded MapState, or null if decoding or parsing fails.
 * @example
 * const state = decodeState(searchParams.get("s") ?? "");
 * if (!state) return <ErrorPage />;
 */
export const decodeState = (encoded: string): MapState | null => {
  try {
    const b64 = fromUrlSafe(encoded);
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as MapState;
  } catch {
    return null;
  }
};

/**
 * Returns true if the encoded state would produce a share URL longer than the supported maximum.
 *
 * @param encoded - URL-safe base64 string from encodeState.
 * @returns True if the share URL exceeds MAX_SHARE_URL_LENGTH characters.
 * @example
 * if (isShareUrlTooLong(encoded)) {
 *   toast("State is too large to share. Try removing some notes.");
 * }
 */
export const isShareUrlTooLong = (encoded: string): boolean =>
  `${SHARE_URL_PREFIX}${encoded}`.length > MAX_SHARE_URL_LENGTH;
