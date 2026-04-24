import type { Legend } from "@/types";

/** Counter for deterministic IDs in tests. */
let seq = 0;

/**
 * Creates a Legend fixture with sensible defaults.
 * Each call increments a counter so IDs are unique within a test run.
 *
 * @param overrides - Fields to override on the default Legend.
 * @returns A Legend suitable for use in tests.
 * @example
 * const legend = createLegend({ name: "Camped", color: "#7c3aed" });
 */
export const createLegend = (overrides: Partial<Legend> = {}): Legend => ({
  id: `legend-${++seq}`,
  color: "#16a34a",
  name: "Visited",
  ...overrides,
});

/** Resets the sequence counter — call in beforeEach if ordering matters. */
export const resetLegendSeq = (): void => {
  seq = 0;
};
