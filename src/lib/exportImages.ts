/**
 * Image export utilities for generating PNG snapshots of Travel Buddy map views.
 *
 * Uses html-to-image to capture off-screen React components as PNG blobs.
 * Each export is 1200x675 at 2x pixel ratio (2400x1350 actual pixels) for
 * high-resolution sharing on social platforms.
 */

import { toPng } from "html-to-image";

/** Output pixel ratio — 2x produces a crisp 2400x1350 image from a 1200x675 container. */
const PIXEL_RATIO = 2;

/**
 * Captures an HTML element as a high-resolution PNG blob.
 *
 * @param el - The element to capture. Must be visible in the DOM (not display:none).
 * @param width - Logical width in CSS pixels.
 * @param height - Logical height in CSS pixels.
 * @returns A PNG blob at 2x resolution.
 * @throws {Error} If html-to-image fails to render the element.
 * @example
 * const blob = await captureElement(divRef.current, 1200, 675);
 */
export const captureElement = async (
  el: HTMLElement,
  width: number,
  height: number
): Promise<Blob> => {
  const dataUrl = await toPng(el, {
    width,
    height,
    pixelRatio: PIXEL_RATIO,
    skipAutoScale: true,
  });

  const res = await fetch(dataUrl);
  return res.blob();
};

/**
 * Triggers a file download for a blob in the user's browser.
 *
 * @param blob - The blob to download.
 * @param filename - The suggested filename including extension, e.g. "travel-buddy-stats.png".
 * @example
 * downloadBlob(pngBlob, "travel-buddy-world.png");
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
