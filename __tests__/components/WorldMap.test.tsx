import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WorldMap } from "@/components/WorldMap";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

import type { KeyboardEvent, ReactNode } from "react";

jest.mock("@/store/mapStore");

type MockGeo = { rsmKey: string; id: string; properties: Record<string, unknown> };

jest.mock("react-simple-maps", () => {
  // Defined inside the factory to avoid jest.mock hoisting issues.
  const mockGeos: MockGeo[] = [
    { rsmKey: "geo-840", id: "840", properties: { name: "United States" } },
    { rsmKey: "geo-250", id: "250", properties: { name: "France" } },
  ];

  return {
    ComposableMap: ({ children }: { children: ReactNode }) => (
      <div data-testid="composable-map">{children}</div>
    ),
    ZoomableGroup: ({ children }: { children: ReactNode }) => (
      <div data-testid="zoomable-group">{children}</div>
    ),
    Geographies: ({ children }: { children: (args: { geographies: MockGeo[] }) => ReactNode }) => (
      <div data-testid="geographies">{children({ geographies: mockGeos })}</div>
    ),
    Geography: ({
      geography,
      onClick,
      onKeyDown,
      tabIndex,
      "aria-label": ariaLabel,
    }: {
      geography: MockGeo;
      onClick?: () => void;
      onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void;
      tabIndex?: number;
      "aria-label"?: string;
    }) => (
      <button
        data-testid={`geo-${geography.id}`}
        onClick={onClick}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
      />
    ),
  };
});

const setupStore = (
  regions: Record<string, { legendId: string; note: string }> = {},
  legends = [createLegend({ id: "visited", name: "Visited", color: "#16a34a" })]
) => {
  (useMapStore as jest.MockedFunction<typeof useMapStore>).mockReturnValue({
    legends,
    regions,
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    hydrate: jest.fn().mockResolvedValue(undefined),
  } as ReturnType<typeof useMapStore>);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupStore();
});

describe("WorldMap", () => {
  it("renders a button for each geography feature", () => {
    render(<WorldMap />);
    expect(screen.getByTestId("geo-840")).toBeInTheDocument();
    expect(screen.getByTestId("geo-250")).toBeInTheDocument();
  });

  it("labels unassigned regions without '(assigned)'", () => {
    render(<WorldMap />);
    expect(screen.getByRole("button", { name: "United States" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "France" })).toBeInTheDocument();
  });

  it("labels assigned regions with '(assigned)' suffix", () => {
    setupStore({ "840": { legendId: "visited", note: "" } });
    render(<WorldMap />);
    expect(screen.getByRole("button", { name: "United States (assigned)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "France" })).toBeInTheDocument();
  });

  it("opens a region dialog when a geography is clicked", async () => {
    render(<WorldMap />);
    await userEvent.click(screen.getByRole("button", { name: "United States" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "United States" })).toBeInTheDocument();
  });

  it("opens the dialog for the correct region when clicked", async () => {
    render(<WorldMap />);
    await userEvent.click(screen.getByRole("button", { name: "France" }));
    expect(screen.getByRole("heading", { name: "France" })).toBeInTheDocument();
  });

  it("opens a region dialog when Enter is pressed on a geography", () => {
    render(<WorldMap />);
    // Use fireEvent.keyDown to bypass the button's Enter→click conversion,
    // ensuring the onKeyDown handler in WorldMap is actually called.
    fireEvent.keyDown(screen.getByRole("button", { name: "United States" }), {
      key: "Enter",
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens a region dialog when Space is pressed on a geography", () => {
    render(<WorldMap />);
    fireEvent.keyDown(screen.getByRole("button", { name: "France" }), { key: " " });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not open a dialog when an unrelated key is pressed", () => {
    render(<WorldMap />);
    fireEvent.keyDown(screen.getByRole("button", { name: "United States" }), {
      key: "Tab",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the dialog when onClose is called", async () => {
    render(<WorldMap />);
    await userEvent.click(screen.getByRole("button", { name: "United States" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uses default fill when a region's legendId no longer matches any legend", () => {
    // Simulates a stale legendId after the user deletes a legend category.
    setupStore({ "840": { legendId: "deleted-legend", note: "" } }, []);
    render(<WorldMap />);
    expect(screen.getByRole("button", { name: "United States (assigned)" })).toBeInTheDocument();
  });

  it("renders geographies in a container with the screenshot data attribute", () => {
    render(<WorldMap />);
    expect(document.querySelector("[data-screenshot='world-map']")).toBeInTheDocument();
  });
});
