import { decodeState, encodeState, isShareUrlTooLong, MAX_SHARE_URL_LENGTH } from "@/lib/share";

import { createLegend } from "../factories/createLegend";
import { createMapState } from "../factories/createMapState";

describe("encodeState / decodeState", () => {
  it("round-trips a minimal state", () => {
    const state = createMapState();
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("round-trips a state with regions and notes", () => {
    const legend = createLegend();
    const state = createMapState({
      legends: [legend],
      regions: {
        "US-CA": { legendId: legend.id, note: "Road trip 2024" },
        "US-NY": { legendId: "", note: "Want to visit" },
      },
    });
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("round-trips a state with unicode notes", () => {
    const state = createMapState({
      regions: { FR: { legendId: "", note: "Merci beaucoup éàü" } },
    });
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("produces a URL-safe string (no +, /, or =)", () => {
    const state = createMapState();
    const encoded = encodeState(state);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("returns null for an empty string", () => {
    expect(decodeState("")).toBeNull();
  });

  it("returns null for invalid base64", () => {
    expect(decodeState("!!!not-valid!!!")).toBeNull();
  });

  it("returns null for valid base64 that is not JSON", () => {
    const notJson = btoa("hello world").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "~");
    expect(decodeState(notJson)).toBeNull();
  });
});

describe("isShareUrlTooLong", () => {
  it("returns false for a short encoded state", () => {
    const state = createMapState();
    expect(isShareUrlTooLong(encodeState(state))).toBe(false);
  });

  it("returns true when the encoded state exceeds the URL length limit", () => {
    // Build a string longer than the limit
    const longEncoded = "a".repeat(MAX_SHARE_URL_LENGTH + 1);
    expect(isShareUrlTooLong(longEncoded)).toBe(true);
  });

  it("returns false when the total URL is exactly at the limit", () => {
    const prefix = "/share?s=";
    const encoded = "a".repeat(MAX_SHARE_URL_LENGTH - prefix.length);
    expect(isShareUrlTooLong(encoded)).toBe(false);
  });
});
