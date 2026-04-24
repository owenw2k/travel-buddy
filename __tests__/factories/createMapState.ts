import { createLegend } from "./createLegend";

import type { MapState } from "@/types";

/**
 * Creates a MapState fixture with sensible defaults.
 *
 * @param overrides - Fields to override on the default MapState.
 * @returns A MapState suitable for use in tests.
 * @example
 * const state = createMapState({ world: false });
 * const stateWithRegion = createMapState({ regions: { "US-CA": { legendId: "visited", note: "" } } });
 */
export const createMapState = (overrides: Partial<MapState> = {}): MapState => ({
  world: true,
  legends: [createLegend()],
  regions: {},
  ...overrides,
});
