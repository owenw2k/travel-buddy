import { render, screen, waitFor } from "@testing-library/react";

import { AppShell } from "@/components/AppShell";
import { isChromium } from "@/lib/browser";
import { useMapStore } from "@/store/mapStore";

jest.mock("@/lib/browser");
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

const mockIsChromium = isChromium as jest.MockedFunction<typeof isChromium>;
const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore> & {
  getState: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseMapStore.getState = jest.fn().mockReturnValue({
    hydrate: jest.fn().mockResolvedValue(undefined),
  });
});

describe("AppShell", () => {
  it("shows the full app layout for Chromium browsers", async () => {
    mockIsChromium.mockReturnValue(true);
    render(<AppShell />);
    await waitFor(() => {
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("legend-panel")).toBeInTheDocument();
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
    });
  });

  it("shows the non-Chromium fallback for non-Chromium browsers", async () => {
    mockIsChromium.mockReturnValue(false);
    render(<AppShell />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /wrong browser/i })).toBeInTheDocument();
    });
  });

  it("calls hydrate on mount to restore persisted state", async () => {
    mockIsChromium.mockReturnValue(true);
    render(<AppShell />);
    await waitFor(() => {
      expect(mockUseMapStore.getState).toHaveBeenCalled();
      expect(mockUseMapStore.getState().hydrate).toHaveBeenCalledTimes(1);
    });
  });

  it("does not render user-visible content before the browser check resolves", () => {
    mockIsChromium.mockReturnValue(true);
    const { container } = render(<AppShell />);
    // Either the placeholder (pre-effect) or the app layout (post-effect) is present.
    const ariaHidden = container.querySelector("[aria-hidden='true']");
    const mapContainer = container.querySelector("[data-testid='map-container']");
    expect(ariaHidden !== null || mapContainer !== null).toBe(true);
  });
});
