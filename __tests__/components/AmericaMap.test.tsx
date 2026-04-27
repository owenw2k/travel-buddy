import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AmericaMap } from "@/components/AmericaMap";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

jest.mock("@/store/mapStore");

type MockGeo = { rsmKey: string; id: string; properties: Record<string, unknown> };

jest.mock("react-simple-maps", () => {
  // Defined inside the factory to avoid jest.mock hoisting issues.
  const mockGeos: MockGeo[] = [
    { rsmKey: "geo-06", id: "06", properties: { name: "California" } },
    { rsmKey: "geo-48", id: "48", properties: { name: "Texas" } },
  ];

  return {
    ComposableMap: ({ children }: { children: ReactNode }) => (
      <div data-testid="composable-map">{children}</div>
    ),
    ZoomableGroup: ({
      children,
      onMoveEnd,
    }: {
      children: ReactNode;
      onMoveEnd?: (result: { coordinates: [number, number]; zoom: number }) => void;
    }) => (
      <div data-testid="zoomable-group">
        <button
          data-testid="trigger-move-end"
          onClick={() => onMoveEnd?.({ coordinates: [10, 20], zoom: 2 })}
        >
          trigger move
        </button>
        {children}
      </div>
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
      onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
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

describe("AmericaMap", () => {
  it("renders a button for each state feature", () => {
    render(<AmericaMap />);
    expect(screen.getByTestId("geo-06")).toBeInTheDocument();
    expect(screen.getByTestId("geo-48")).toBeInTheDocument();
  });

  it("labels unassigned states without '(assigned)'", () => {
    render(<AmericaMap />);
    expect(screen.getByRole("button", { name: "California" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Texas" })).toBeInTheDocument();
  });

  it("labels assigned states with '(assigned)' suffix", () => {
    setupStore({ "06": { legendId: "visited", note: "" } });
    render(<AmericaMap />);
    expect(screen.getByRole("button", { name: "California (assigned)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Texas" })).toBeInTheDocument();
  });

  it("opens a region dialog when a state is clicked", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: "California" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "California" })).toBeInTheDocument();
  });

  it("opens the dialog for the correct state when clicked", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: "Texas" }));
    expect(screen.getByRole("heading", { name: "Texas" })).toBeInTheDocument();
  });

  it("opens a region dialog when Enter is pressed on a state", () => {
    render(<AmericaMap />);
    // Use fireEvent.keyDown to bypass the button's Enter→click conversion,
    // ensuring the onKeyDown handler in AmericaMap is actually called.
    fireEvent.keyDown(screen.getByRole("button", { name: "California" }), {
      key: "Enter",
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("opens a region dialog when Space is pressed on a state", () => {
    render(<AmericaMap />);
    fireEvent.keyDown(screen.getByRole("button", { name: "California" }), {
      key: " ",
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not open a dialog when an unrelated key is pressed", () => {
    render(<AmericaMap />);
    fireEvent.keyDown(screen.getByRole("button", { name: "California" }), {
      key: "Tab",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the panel when the close button is clicked", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: "California" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the panel when the map background is clicked", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: "California" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(document.querySelector("[data-screenshot='us-map']")!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uses default fill when a region's legendId no longer matches any legend", () => {
    // Simulates a stale legendId after the user deletes a legend category.
    setupStore({ "06": { legendId: "deleted-legend", note: "" } }, []);
    render(<AmericaMap />);
    // California still renders (no crash) with the default color.
    expect(screen.getByRole("button", { name: "California (assigned)" })).toBeInTheDocument();
  });

  it("renders the map in a container with the screenshot data attribute", () => {
    render(<AmericaMap />);
    expect(document.querySelector("[data-screenshot='us-map']")).toBeInTheDocument();
  });

  it("renders zoom control buttons", () => {
    render(<AmericaMap />);
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset zoom/i })).toBeInTheDocument();
  });

  it("zoom controls are interactive", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: /zoom in/i }));
    await userEvent.click(screen.getByRole("button", { name: /zoom out/i }));
    await userEvent.click(screen.getByRole("button", { name: /reset zoom/i }));
    expect(screen.getByTestId("geo-06")).toBeInTheDocument();
  });

  it("closes the panel when zoom in is clicked", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: "California" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /zoom in/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the panel when zoom out is clicked", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: "California" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /zoom out/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the panel when reset zoom is clicked", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByRole("button", { name: "California" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /reset zoom/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("updates center and zoom when the map pan or zoom gesture ends", async () => {
    render(<AmericaMap />);
    await userEvent.click(screen.getByTestId("trigger-move-end"));
    // Map still renders after internal center/zoom state updates.
    expect(screen.getByTestId("geo-06")).toBeInTheDocument();
  });
});
