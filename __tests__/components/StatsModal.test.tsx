import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { StatsModal } from "@/components/StatsModal";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

jest.mock("@/store/mapStore");

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
  }) =>
    open ? (
      <div>
        <button data-testid="mock-dialog-close" onClick={() => onOpenChange?.(false)}>
          close dialog
        </button>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

const visited = createLegend({ id: "visited", name: "Visited", color: "#16a34a" });
const driven = createLegend({ id: "driven", name: "Driven", color: "#d97706" });

const setupStore = (
  legends = [visited, driven],
  regions: Record<string, { legendId: string; note: string; world?: boolean }> = {}
) => {
  mockUseMapStore.mockReturnValue({
    legends,
    regions,
    world: true,
    setWorld: jest.fn(),
    addLegend: jest.fn(),
    removeLegend: jest.fn(),
    updateLegend: jest.fn(),
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    clearData: jest.fn(),
    hydrate: jest.fn().mockResolvedValue(undefined),
  } as ReturnType<typeof useMapStore>);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("StatsModal", () => {
  it("renders a view stats button", () => {
    setupStore();
    render(<StatsModal />);
    expect(screen.getByRole("button", { name: /view stats/i })).toBeInTheDocument();
  });

  it("opens the dialog when the stats button is clicked", async () => {
    setupStore();
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /your travels/i })).toBeInTheDocument();
  });

  it("shows 'no regions marked yet' when nothing is assigned", async () => {
    setupStore([visited, driven], {});
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText(/no regions marked yet/i)).toBeInTheDocument();
  });

  it("shows the total regions marked count", async () => {
    setupStore([visited, driven], {
      "840": { legendId: "visited", note: "" },
      "250": { legendId: "visited", note: "" },
      "276": { legendId: "driven", note: "" },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText(/3 regions marked/i)).toBeInTheDocument();
  });

  it("uses singular 'region' when exactly one is marked", async () => {
    setupStore([visited], { "840": { legendId: "visited", note: "" } });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText(/1 region marked/i)).toBeInTheDocument();
  });

  it("shows World and United States section labels", async () => {
    setupStore([visited], {});
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText("World")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("shows correct counts in the world section for regions without a world flag", async () => {
    setupStore([visited, driven], {
      "840": { legendId: "visited", note: "" },
      "250": { legendId: "visited", note: "" },
      "276": { legendId: "driven", note: "" },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    const worldSection = screen.getByTestId("stats-world");
    const items = within(worldSection).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("2");
    expect(items[1]).toHaveTextContent("1");
  });

  it("routes world=true entries to the world section and world=false to US", async () => {
    setupStore([visited], {
      "840": { legendId: "visited", note: "", world: true },
      "01": { legendId: "visited", note: "", world: false },
      "48": { legendId: "visited", note: "", world: false },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    const worldSection = screen.getByTestId("stats-world");
    const usSection = screen.getByTestId("stats-us");
    expect(within(worldSection).getByRole("listitem")).toHaveTextContent("1");
    expect(within(usSection).getByRole("listitem")).toHaveTextContent("2");
  });

  it("shows 'no categories yet' message when legend list is empty", async () => {
    setupStore([], {});
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText(/no legend categories yet/i)).toBeInTheDocument();
  });

  it("closes the dialog when onOpenChange fires with false", async () => {
    setupStore();
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("mock-dialog-close"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ignores regions with no legendId when counting totals", async () => {
    setupStore([visited], {
      "840": { legendId: "visited", note: "" },
      "250": { legendId: "", note: "some note" },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText(/1 region marked/i)).toBeInTheDocument();
  });

  it("dims non-hovered arcs in the donut chart when an arc is hovered", async () => {
    setupStore([visited, driven], {
      "840": { legendId: "visited", note: "", world: true },
      "250": { legendId: "driven", note: "", world: true },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    const worldSection = screen.getByTestId("stats-world");
    const paths = worldSection.querySelectorAll("path");
    // With two non-zero segments, hovering the first should dim the second.
    expect(paths.length).toBeGreaterThanOrEqual(2);
    fireEvent.mouseEnter(paths[0]!);
    expect(paths[1]!.style.opacity).toBe("0.35");
    fireEvent.mouseLeave(paths[0]!);
    expect(paths[1]!.style.opacity).toBe("1");
  });

  it("ignores regions assigned to a deleted legend", async () => {
    setupStore([visited], {
      "840": { legendId: "visited", note: "" },
      "250": { legendId: "deleted-legend", note: "" },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText(/2 regions marked/i)).toBeInTheDocument();
    const worldSection = screen.getByTestId("stats-world");
    expect(within(worldSection).getByRole("listitem")).toHaveTextContent("1");
  });
});
