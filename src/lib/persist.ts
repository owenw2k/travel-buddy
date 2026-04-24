/**
 * IndexedDB persistence helpers for the Travel Buddy map state.
 *
 * Uses idb-keyval for a simple key/value IndexedDB store. All map state lives
 * under a single key so reads and writes are atomic from the app's perspective.
 *
 * This module is the only place allowed to touch IndexedDB — components and
 * the store call these helpers, never idb-keyval directly.
 */

import { get, set } from "idb-keyval";

import type { MapState } from "@/types";

/** The idb-keyval key under which all map state is stored. */
const STATE_KEY = "travel-buddy-map-state";

/**
 * Reads the persisted map state from IndexedDB.
 *
 * @returns The saved MapState, or null if nothing has been persisted yet.
 * @example
 * const saved = await loadState();
 * if (saved) store.hydrate(saved);
 */
export const loadState = async (): Promise<MapState | null> => {
  const saved = await get<MapState>(STATE_KEY);
  return saved ?? null;
};

/**
 * Writes the current map state to IndexedDB, replacing any previous snapshot.
 *
 * Called after every Zustand store mutation (fire-and-forget — the store does
 * not await this; a failed write is logged but does not throw).
 *
 * @param state - Full MapState to persist.
 * @example
 * void saveState(store.getState());
 */
export const saveState = async (state: MapState): Promise<void> => {
  await set(STATE_KEY, state);
};
