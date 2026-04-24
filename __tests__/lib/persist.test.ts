import { get, set } from "idb-keyval";

import { loadState, saveState } from "@/lib/persist";

import { createMapState } from "../factories/createMapState";

// idb-keyval is mocked so unit tests never touch real IndexedDB.
jest.mock("idb-keyval");

const mockGet = get as jest.MockedFunction<typeof get>;
const mockSet = set as jest.MockedFunction<typeof set>;

describe("loadState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when nothing has been persisted", async () => {
    mockGet.mockResolvedValue(undefined);
    const result = await loadState();
    expect(result).toBeNull();
  });

  it("returns the saved MapState when it exists", async () => {
    const state = createMapState();
    mockGet.mockResolvedValue(state);
    const result = await loadState();
    expect(result).toEqual(state);
  });

  it("reads from the correct idb-keyval key", async () => {
    mockGet.mockResolvedValue(undefined);
    await loadState();
    expect(mockGet).toHaveBeenCalledWith("travel-buddy-map-state");
  });
});

describe("saveState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSet.mockResolvedValue(undefined);
  });

  it("writes the state to the correct idb-keyval key", async () => {
    const state = createMapState();
    await saveState(state);
    expect(mockSet).toHaveBeenCalledWith("travel-buddy-map-state", state);
  });
});
