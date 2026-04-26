/**
 * Core domain types for the Travel Buddy map store.
 */

/** A user-defined legend category (e.g. Visited, Driven, Lived, or custom). */
export type Legend = {
  /** Unique identifier, generated with crypto.randomUUID(). */
  id: string;
  /** CSS hex color string, e.g. "#16a34a". */
  color: string;
  /** Display name shown in the legend panel. */
  name: string;
};

/**
 * Per-region assignment stored in the Zustand map store.
 * A region entry exists whenever the user has assigned a legend or written a note.
 * Empty strings indicate "not set" for each field.
 */
export type RegionEntry = {
  /** ID of the Legend assigned to this region. Empty string if unassigned. */
  legendId: string;
  /** User note for this region, e.g. "Visited 2023". Empty string if none. */
  note: string;
  /**
   * Which map this region belongs to. True = world map, false = US map.
   * Undefined on entries saved before this field was introduced — treated as world.
   */
  world?: boolean;
};

/** Full persisted state shape for the Zustand map store. */
export type MapState = {
  /** True = world map view, false = US map view. */
  world: boolean;
  /** Ordered list of legend categories. */
  legends: Legend[];
  /**
   * Region assignments and notes, keyed by GeoJSON region ID.
   * Only regions with a legend or note have an entry here.
   */
  regions: Record<string, RegionEntry>;
};
