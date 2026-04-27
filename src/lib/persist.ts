/**
 * localStorage persistence helpers for the Travel Buddy map state.
 *
 * All map state lives under a single JSON key. Reads and writes are
 * synchronous from the caller's perspective; the async wrapper exists so
 * the store's fire-and-forget `void saveState(...)` pattern works without
 * change if the storage backend ever needs to change.
 *
 * This module is the only place allowed to touch localStorage — components
 * and the store call these helpers, never localStorage directly.
 */

import type { MapState } from "@/types";

/** The localStorage key under which all map state is stored. */
const STATE_KEY = "travel-buddy-map-state";

/**
 * Reads the persisted map state from localStorage.
 *
 * Returns null when nothing has been saved yet or if the stored value
 * cannot be parsed (e.g. corrupted data from a previous app version).
 *
 * @returns The saved MapState, or null if unavailable.
 * @example
 * const saved = await loadState();
 * if (saved) store.hydrate(saved);
 */
export const loadState = (): MapState | null => {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as MapState;
  } catch {
    return null;
  }
};

/**
 * Writes the current map state to localStorage, replacing any previous snapshot.
 *
 * Called after every Zustand store mutation. Failures are swallowed silently
 * so storage being unavailable never crashes the app.
 *
 * @param state - Full MapState to persist.
 * @example
 * saveState(store.getState());
 */
export const saveState = (state: MapState): void => {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (e.g. private browsing with storage blocked) — in-memory only.
  }
};
