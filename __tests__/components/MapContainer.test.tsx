import { render, screen, waitFor } from "@testing-library/react";

import { MapContainer } from "@/components/MapContainer";
import { useMapStore } from "@/store/mapStore";

jest.mock("@/store/mapStore");

// Stub out the dynamically imported map components so tests don't load GeoJSON.
jest.mock("@/components/WorldMap", () => ({
  WorldMap: () => <div data-testid="world-map" />,
}));
jest.mock("@/components/AmericaMap", () => ({
  AmericaMap: () => <div data-testid="america-map" />,
}));

const mockHydrate = jest.fn().mockResolvedValue(undefined);

const setupStore = (world = true) => {
  (useMapStore as jest.MockedFunction<typeof useMapStore>).mockReturnValue({
    world,
    hydrate: mockHydrate,
  } as ReturnType<typeof useMapStore>);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupStore();
});

describe("MapContainer", () => {
  it("calls hydrate on mount", async () => {
    render(<MapContainer />);
    await waitFor(() => {
      expect(mockHydrate).toHaveBeenCalledTimes(1);
    });
  });

  it("renders the world map when world is true", async () => {
    setupStore(true);
    render(<MapContainer />);
    await waitFor(() => {
      expect(screen.getByTestId("world-map")).toBeInTheDocument();
    });
  });

  it("renders the US map when world is false", async () => {
    setupStore(false);
    render(<MapContainer />);
    await waitFor(() => {
      expect(screen.getByTestId("america-map")).toBeInTheDocument();
    });
  });
});
