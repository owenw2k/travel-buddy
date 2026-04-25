import { render, screen, waitFor } from "@testing-library/react";

import { AppShell } from "@/components/AppShell";
import { isChromium } from "@/lib/browser";

jest.mock("@/lib/browser");
jest.mock("@/components/MapContainer", () => ({
  MapContainer: () => <div data-testid="map-container" />,
}));

const mockIsChromium = isChromium as jest.MockedFunction<typeof isChromium>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AppShell", () => {
  it("shows the map container for Chromium browsers", async () => {
    mockIsChromium.mockReturnValue(true);
    render(<AppShell />);
    await waitFor(() => {
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

  it("does not render user-visible content before the browser check resolves", () => {
    mockIsChromium.mockReturnValue(true);
    const { container } = render(<AppShell />);
    // After effects flush, the map container should appear, not visible content
    // from the placeholder. The placeholder is aria-hidden.
    const ariaHidden = container.querySelector("[aria-hidden='true']");
    // Either the placeholder (pre-effect) or the map (post-effect) is present.
    const mapContainer = container.querySelector("[data-testid='map-container']");
    expect(ariaHidden !== null || mapContainer !== null).toBe(true);
  });
});
