import { render, screen, waitFor } from "@testing-library/react";

import { AppShell } from "@/components/AppShell";
import { useMapStore } from "@/store/mapStore";

jest.mock("@/store/mapStore");
jest.mock("@/components/MapContainer", () => ({
  MapContainer: () => <div data-testid="map-container" />,
}));
jest.mock("@/components/Header", () => ({
  Header: () => <div data-testid="header" />,
}));
jest.mock("@/components/LegendPanel", () => ({
  LegendPanel: () => <div data-testid="legend-panel" />,
}));

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore> & {
  getState: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMapStore.getState = jest.fn().mockReturnValue({
    hydrate: jest.fn(),
  });
});

describe("AppShell", () => {
  it("renders the full app layout", async () => {
    render(<AppShell />);
    await waitFor(() => {
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("legend-panel")).toBeInTheDocument();
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });
  });

  it("calls hydrate on mount to restore persisted state", async () => {
    render(<AppShell />);
    await waitFor(() => {
      expect(mockUseMapStore.getState).toHaveBeenCalled();
      expect(mockUseMapStore.getState().hydrate).toHaveBeenCalledTimes(1);
    });
  });
});
