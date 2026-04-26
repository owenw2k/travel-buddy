/**
 * Zustand store for all Travel Buddy map state.
 *
 * This is the single source of truth for which regions have been assigned
 * legend categories, what notes the user has written, and which map view
 * (world vs. US) is active.
 *
 * Persistence is fire-and-forget: every mutation calls saveState() but does
 * not await it, keeping the store synchronous. Call hydrate() on the client
 * (in a useEffect) to load the previously persisted snapshot.
 */

import { create } from "zustand";

import { loadState, saveState } from "@/lib/persist";

import type { Legend, MapState, RegionEntry } from "@/types";

/** Default legend categories shown before the user customizes anything. */
const DEFAULT_LEGENDS: Legend[] = [
  { id: "visited", color: "#16a34a", name: "Visited" },
  { id: "driven", color: "#d97706", name: "Driven" },
  { id: "lived", color: "#e11d48", name: "Lived" },
];

/** Initial store state — used both on first load and when clearing data. */
const INITIAL_STATE: MapState = {
  world: true,
  legends: DEFAULT_LEGENDS,
  regions: {},
};

/**
 * Full shape of the Zustand store: state fields plus all action methods.
 *
 * Consumers should import `useMapStore` and destructure only what they need.
 */
export type MapStore = MapState & {
  /**
   * Switches between the world map and the US map.
   *
   * @param world - True for world view, false for US view.
   * @example
   * store.setWorld(false); // switch to US map
   */
  setWorld: (world: boolean) => void;

  /**
   * Adds a new legend category, assigning a random UUID as its ID.
   *
   * @param input - Name and color for the new category.
   * @example
   * store.addLegend({ name: "Camped", color: "#7c3aed" });
   */
  addLegend: (input: Omit<Legend, "id">) => void;

  /**
   * Removes a legend category and clears it from all regions that use it.
   *
   * @param id - ID of the legend to remove.
   * @example
   * store.removeLegend("visited");
   */
  removeLegend: (id: string) => void;

  /**
   * Updates the name and color of an existing legend category.
   *
   * @param id - ID of the legend to update.
   * @param updates - New name and color values to apply.
   * @example
   * store.updateLegend("visited", { name: "Been there", color: "#7c3aed" });
   */
  updateLegend: (id: string, updates: Omit<Legend, "id">) => void;

  /**
   * Assigns a legend category to a region.
   *
   * @param regionId - GeoJSON region identifier (e.g. country ISO code or US state FIPS).
   * @param legendId - ID of the Legend to assign.
   * @example
   * store.assignRegion("US-CA", "visited");
   */
  assignRegion: (regionId: string, legendId: string) => void;

  /**
   * Removes the legend assignment from a region, keeping its note if one exists.
   * If the region has no note either, its entry is removed from the store entirely.
   *
   * @param regionId - GeoJSON region identifier.
   * @example
   * store.unassignRegion("US-CA");
   */
  unassignRegion: (regionId: string) => void;

  /**
   * Sets the user note for a region. Pass an empty string to clear the note.
   * If the region has no legend, a note-only entry is kept in the store.
   *
   * @param regionId - GeoJSON region identifier.
   * @param note - Note text, e.g. "Visited summer 2023". Empty string to clear.
   * @example
   * store.setRegionNote("US-CA", "Road trip 2024");
   */
  setRegionNote: (regionId: string, note: string) => void;

  /**
   * Resets all map state to defaults and overwrites the persisted snapshot.
   *
   * @example
   * store.clearData();
   */
  clearData: () => void;

  /**
   * Loads the persisted snapshot from IndexedDB and merges it into the store.
   * Call this once on the client, inside a useEffect, after the component mounts.
   *
   * @example
   * useEffect(() => { void store.hydrate(); }, []);
   */
  hydrate: () => Promise<void>;
};

/**
 * The singleton Zustand map store.
 *
 * @example
 * const { world, setWorld } = useMapStore();
 */
export const useMapStore = create<MapStore>()((set, get) => {
  /**
   * Extracts only the serializable MapState fields from the store.
   * Called before every saveState to avoid passing action functions to
   * IndexedDB, which uses the structured clone algorithm and cannot clone
   * functions.
   */
  const snapshot = (): MapState => {
    const { world, legends, regions } = get();
    return { world, legends, regions };
  };

  return {
    ...INITIAL_STATE,

    setWorld: (world) => {
      set({ world });
      void saveState(snapshot());
    },

    addLegend: (input) => {
      const legend: Legend = { id: crypto.randomUUID(), ...input };
      const legends = [...get().legends, legend];
      set({ legends });
      void saveState(snapshot());
    },

    updateLegend: (id, updates) => {
      const legends = get().legends.map((l) => (l.id === id ? { ...l, ...updates } : l));
      set({ legends });
      void saveState(snapshot());
    },

    removeLegend: (id) => {
      const legends = get().legends.filter((l) => l.id !== id);

      // Clear the legend from any regions that reference it.
      const regions: Record<string, RegionEntry> = {};
      for (const [regionId, entry] of Object.entries(get().regions)) {
        if (entry.legendId === id) {
          if (entry.note) {
            regions[regionId] = { legendId: "", note: entry.note };
          }
          // If no note either, drop the entry entirely.
        } else {
          regions[regionId] = entry;
        }
      }

      set({ legends, regions });
      void saveState(snapshot());
    },

    assignRegion: (regionId, legendId) => {
      const { world, regions: current } = get();
      const existing = current[regionId];
      const regions = {
        ...current,
        [regionId]: { legendId, note: existing?.note ?? "", world },
      };
      set({ regions });
      void saveState(snapshot());
    },

    unassignRegion: (regionId) => {
      const existing = get().regions[regionId];
      const regions = { ...get().regions };

      if (existing?.note) {
        regions[regionId] = { legendId: "", note: existing.note };
      } else {
        delete regions[regionId];
      }

      set({ regions });
      void saveState(snapshot());
    },

    setRegionNote: (regionId, note) => {
      const existing = get().regions[regionId];
      const regions = { ...get().regions };

      if (note === "" && !existing?.legendId) {
        // No legend and no note: drop the entry.
        delete regions[regionId];
      } else {
        regions[regionId] = { legendId: existing?.legendId ?? "", note };
      }

      set({ regions });
      void saveState(snapshot());
    },

    clearData: () => {
      set(INITIAL_STATE);
      void saveState(INITIAL_STATE);
    },

    hydrate: async () => {
      const saved = await loadState();
      if (saved) {
        set(saved);
      }
    },
  };
});
