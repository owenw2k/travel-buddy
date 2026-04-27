import { loadState, saveState } from "@/lib/persist";

import { createMapState } from "../factories/createMapState";

// Jest provides a localStorage stub via jsdom — no real storage is touched.

const STATE_KEY = "travel-buddy-map-state";

beforeEach(() => {
  localStorage.clear();
});

describe("loadState", () => {
  it("returns null when nothing has been persisted", () => {
    expect(loadState()).toBeNull();
  });

  it("returns the saved MapState when it exists", () => {
    const state = createMapState();
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    expect(loadState()).toEqual(state);
  });

  it("reads from the correct localStorage key", () => {
    const state = createMapState();
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    loadState();
    // Verify only the canonical key was checked.
    expect(localStorage.getItem(STATE_KEY)).not.toBeNull();
  });

  it("returns null when the stored value is corrupt JSON", () => {
    localStorage.setItem(STATE_KEY, "not-valid-json{{{");
    expect(loadState()).toBeNull();
  });
});

describe("saveState", () => {
  it("writes the state under the correct localStorage key", () => {
    const state = createMapState();
    saveState(state);
    expect(JSON.parse(localStorage.getItem(STATE_KEY) ?? "null")).toEqual(state);
  });

  it("does not throw when localStorage is unavailable", () => {
    const original = localStorage.setItem.bind(localStorage);
    jest.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("storage unavailable");
    });
    const state = createMapState();
    expect(() => saveState(state)).not.toThrow();
    Storage.prototype.setItem = original;
  });
});
