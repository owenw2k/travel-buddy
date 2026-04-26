import { act } from "@testing-library/react";

import { loadState, saveState } from "@/lib/persist";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

// Mock persist so tests don't touch IndexedDB and we can assert on saves.
jest.mock("@/lib/persist");

const mockLoadState = loadState as jest.MockedFunction<typeof loadState>;
const mockSaveState = saveState as jest.MockedFunction<typeof saveState>;

/** Resets the Zustand store to its initial state between tests. */
const resetStore = () => {
  act(() => {
    useMapStore.setState({
      world: true,
      legends: [
        { id: "visited", color: "#16a34a", name: "Visited" },
        { id: "driven", color: "#d97706", name: "Driven" },
        { id: "lived", color: "#e11d48", name: "Lived" },
      ],
      regions: {},
    });
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveState.mockResolvedValue(undefined);
  resetStore();
});

describe("setWorld", () => {
  it("updates the world flag", () => {
    act(() => {
      useMapStore.getState().setWorld(false);
    });
    expect(useMapStore.getState().world).toBe(false);
  });

  it("calls saveState after updating", () => {
    act(() => {
      useMapStore.getState().setWorld(false);
    });
    expect(mockSaveState).toHaveBeenCalledTimes(1);
    expect(mockSaveState).toHaveBeenCalledWith(expect.objectContaining({ world: false }));
  });
});

describe("addLegend", () => {
  it("appends a new legend to the list", () => {
    act(() => {
      useMapStore.getState().addLegend({ name: "Camped", color: "#7c3aed" });
    });
    const { legends } = useMapStore.getState();
    const added = legends.find((l) => l.name === "Camped");
    expect(added).toBeDefined();
    expect(added?.color).toBe("#7c3aed");
  });

  it("assigns a unique id to the new legend", () => {
    act(() => {
      useMapStore.getState().addLegend({ name: "A", color: "#000" });
    });
    act(() => {
      useMapStore.getState().addLegend({ name: "B", color: "#fff" });
    });
    const { legends } = useMapStore.getState();
    const ids = legends.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("calls saveState after adding", () => {
    act(() => {
      useMapStore.getState().addLegend({ name: "X", color: "#abc" });
    });
    expect(mockSaveState).toHaveBeenCalledTimes(1);
  });
});

describe("removeLegend", () => {
  it("removes the legend from the list", () => {
    act(() => {
      useMapStore.getState().removeLegend("visited");
    });
    expect(useMapStore.getState().legends.find((l) => l.id === "visited")).toBeUndefined();
  });

  it("clears the legend from regions that used it, keeping their notes", () => {
    act(() => {
      useMapStore.getState().assignRegion("US-CA", "visited");
      useMapStore.getState().setRegionNote("US-CA", "lovely");
    });
    act(() => {
      useMapStore.getState().removeLegend("visited");
    });
    const entry = useMapStore.getState().regions["US-CA"];
    expect(entry).toBeDefined();
    expect(entry?.legendId).toBe("");
    expect(entry?.note).toBe("lovely");
  });

  it("removes the region entry entirely when it had no note", () => {
    act(() => {
      useMapStore.getState().assignRegion("US-TX", "visited");
    });
    act(() => {
      useMapStore.getState().removeLegend("visited");
    });
    expect(useMapStore.getState().regions["US-TX"]).toBeUndefined();
  });

  it("preserves regions assigned to other legends", () => {
    act(() => {
      useMapStore.getState().assignRegion("US-CA", "visited");
    });
    act(() => {
      useMapStore.getState().assignRegion("US-NY", "driven");
    });
    act(() => {
      useMapStore.getState().removeLegend("visited");
    });
    expect(useMapStore.getState().regions["US-NY"]).toEqual({
      legendId: "driven",
      note: "",
      world: true,
    });
    expect(useMapStore.getState().regions["US-CA"]).toBeUndefined();
  });

  it("calls saveState after removing", () => {
    act(() => {
      useMapStore.getState().removeLegend("visited");
    });
    expect(mockSaveState).toHaveBeenCalledTimes(1);
  });
});

describe("updateLegend", () => {
  it("updates the name and color of the specified legend", () => {
    act(() => {
      useMapStore.getState().updateLegend("visited", { name: "Been there", color: "#7c3aed" });
    });
    const updated = useMapStore.getState().legends.find((l) => l.id === "visited");
    expect(updated?.name).toBe("Been there");
    expect(updated?.color).toBe("#7c3aed");
  });

  it("does not affect other legends", () => {
    act(() => {
      useMapStore.getState().updateLegend("visited", { name: "Been there", color: "#7c3aed" });
    });
    const driven = useMapStore.getState().legends.find((l) => l.id === "driven");
    expect(driven?.name).toBe("Driven");
    expect(driven?.color).toBe("#d97706");
  });

  it("calls saveState after updating", () => {
    act(() => {
      useMapStore.getState().updateLegend("visited", { name: "Been there", color: "#7c3aed" });
    });
    expect(mockSaveState).toHaveBeenCalledTimes(1);
  });
});

describe("assignRegion", () => {
  it("creates a region entry with the given legend", () => {
    act(() => {
      useMapStore.getState().assignRegion("FR", "visited");
    });
    expect(useMapStore.getState().regions["FR"]).toEqual({
      legendId: "visited",
      note: "",
      world: true,
    });
  });

  it("preserves an existing note when reassigning the legend", () => {
    act(() => {
      useMapStore.getState().assignRegion("FR", "visited");
    });
    act(() => {
      useMapStore.getState().setRegionNote("FR", "Paris!");
    });
    act(() => {
      useMapStore.getState().assignRegion("FR", "driven");
    });
    expect(useMapStore.getState().regions["FR"]).toEqual({
      legendId: "driven",
      note: "Paris!",
      world: true,
    });
  });

  it("calls saveState after assigning", () => {
    act(() => {
      useMapStore.getState().assignRegion("DE", "visited");
    });
    expect(mockSaveState).toHaveBeenCalledTimes(1);
  });
});

describe("unassignRegion", () => {
  it("removes the region entry when it has no note", () => {
    act(() => {
      useMapStore.getState().assignRegion("US-CA", "visited");
    });
    act(() => {
      useMapStore.getState().unassignRegion("US-CA");
    });
    expect(useMapStore.getState().regions["US-CA"]).toBeUndefined();
  });

  it("clears legendId but keeps the note", () => {
    act(() => {
      useMapStore.getState().assignRegion("US-CA", "visited");
    });
    act(() => {
      useMapStore.getState().setRegionNote("US-CA", "great coast");
    });
    act(() => {
      useMapStore.getState().unassignRegion("US-CA");
    });
    expect(useMapStore.getState().regions["US-CA"]).toEqual({ legendId: "", note: "great coast" });
  });

  it("does nothing when the region does not exist", () => {
    act(() => {
      useMapStore.getState().unassignRegion("NONEXISTENT");
    });
    expect(useMapStore.getState().regions["NONEXISTENT"]).toBeUndefined();
  });

  it("calls saveState after unassigning", () => {
    act(() => {
      useMapStore.getState().assignRegion("US-CA", "visited");
    });
    jest.clearAllMocks();
    act(() => {
      useMapStore.getState().unassignRegion("US-CA");
    });
    expect(mockSaveState).toHaveBeenCalledTimes(1);
  });
});

describe("setRegionNote", () => {
  it("adds a note to a region that has no entry yet", () => {
    act(() => {
      useMapStore.getState().setRegionNote("JP", "Want to go!");
    });
    expect(useMapStore.getState().regions["JP"]).toEqual({ legendId: "", note: "Want to go!" });
  });

  it("adds a note to a region that already has a legend", () => {
    act(() => {
      useMapStore.getState().assignRegion("JP", "visited");
    });
    act(() => {
      useMapStore.getState().setRegionNote("JP", "Amazing food");
    });
    expect(useMapStore.getState().regions["JP"]).toEqual({
      legendId: "visited",
      note: "Amazing food",
    });
  });

  it("removes the region entry when clearing the note on an unassigned region", () => {
    act(() => {
      useMapStore.getState().setRegionNote("JP", "Want to go!");
    });
    act(() => {
      useMapStore.getState().setRegionNote("JP", "");
    });
    expect(useMapStore.getState().regions["JP"]).toBeUndefined();
  });

  it("keeps the region entry when clearing the note on an assigned region", () => {
    act(() => {
      useMapStore.getState().assignRegion("JP", "visited");
    });
    act(() => {
      useMapStore.getState().setRegionNote("JP", "Amazing");
    });
    act(() => {
      useMapStore.getState().setRegionNote("JP", "");
    });
    expect(useMapStore.getState().regions["JP"]).toEqual({ legendId: "visited", note: "" });
  });

  it("calls saveState after setting the note", () => {
    act(() => {
      useMapStore.getState().setRegionNote("AU", "G'day");
    });
    expect(mockSaveState).toHaveBeenCalledTimes(1);
  });
});

describe("clearData", () => {
  it("resets world to true", () => {
    act(() => {
      useMapStore.getState().setWorld(false);
    });
    act(() => {
      useMapStore.getState().clearData();
    });
    expect(useMapStore.getState().world).toBe(true);
  });

  it("restores the default legends", () => {
    act(() => {
      useMapStore.getState().addLegend({ name: "Custom", color: "#000" });
    });
    act(() => {
      useMapStore.getState().clearData();
    });
    const { legends } = useMapStore.getState();
    expect(legends.map((l) => l.name)).toEqual(["Visited", "Driven", "Lived"]);
  });

  it("clears all regions", () => {
    act(() => {
      useMapStore.getState().assignRegion("US-CA", "visited");
    });
    act(() => {
      useMapStore.getState().clearData();
    });
    expect(useMapStore.getState().regions).toEqual({});
  });

  it("persists the reset state", () => {
    act(() => {
      useMapStore.getState().clearData();
    });
    expect(mockSaveState).toHaveBeenCalledWith(
      expect.objectContaining({ regions: {}, world: true })
    );
  });
});

describe("hydrate", () => {
  it("loads persisted state into the store", async () => {
    const legend = createLegend({ name: "Custom" });
    mockLoadState.mockResolvedValue({
      world: false,
      legends: [legend],
      regions: { "US-CA": { legendId: legend.id, note: "lovely" } },
    });

    await act(async () => {
      await useMapStore.getState().hydrate();
    });

    expect(useMapStore.getState().world).toBe(false);
    expect(useMapStore.getState().legends).toEqual([legend]);
    expect(useMapStore.getState().regions["US-CA"]).toEqual({
      legendId: legend.id,
      note: "lovely",
    });
  });

  it("leaves the store unchanged when nothing is persisted", async () => {
    mockLoadState.mockResolvedValue(null);
    const before = { ...useMapStore.getState() };

    await act(async () => {
      await useMapStore.getState().hydrate();
    });

    expect(useMapStore.getState().world).toBe(before.world);
    expect(useMapStore.getState().legends).toEqual(before.legends);
  });
});
