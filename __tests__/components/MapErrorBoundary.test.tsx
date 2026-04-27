import { fireEvent, render, screen } from "@testing-library/react";

import { MapErrorBoundary } from "@/components/MapErrorBoundary";

/** Component that throws on render to simulate a map crash. */
const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("d3-geo null projection");
  }
  return <div data-testid="map-content">map ok</div>;
};

// Suppress React's console.error for expected errors in these tests.
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("MapErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <MapErrorBoundary>
        <Bomb shouldThrow={false} />
      </MapErrorBoundary>
    );
    expect(screen.getByTestId("map-content")).toBeInTheDocument();
  });

  it("shows an error message when the map crashes", () => {
    render(
      <MapErrorBoundary>
        <Bomb shouldThrow />
      </MapErrorBoundary>
    );
    expect(screen.getByText(/ran into a problem/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset view/i })).toBeInTheDocument();
  });

  it("recovers and remounts the map when Reset view is clicked", () => {
    const { rerender } = render(
      <MapErrorBoundary>
        <Bomb shouldThrow />
      </MapErrorBoundary>
    );

    expect(screen.getByText(/ran into a problem/i)).toBeInTheDocument();

    // Update children so they no longer throw before clicking reset,
    // so the remount succeeds and shows the map content.
    rerender(
      <MapErrorBoundary>
        <Bomb shouldThrow={false} />
      </MapErrorBoundary>
    );
    fireEvent.click(screen.getByRole("button", { name: /reset view/i }));

    expect(screen.getByTestId("map-content")).toBeInTheDocument();
  });
});
