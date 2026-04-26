import { render, screen } from "@testing-library/react";
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
  regions: Record<string, { legendId: string; note: string }> = {}
) => {
  mockUseMapStore.mockReturnValue({
    legends,
    regions,
    world: true,
    setWorld: jest.fn(),
    addLegend: jest.fn(),
    removeLegend: jest.fn(),
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

  it("renders a row for each legend category", async () => {
    setupStore([visited, driven], {});
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText("Visited")).toBeInTheDocument();
    expect(screen.getByText("Driven")).toBeInTheDocument();
  });

  it("shows the count for each legend", async () => {
    setupStore([visited, driven], {
      "840": { legendId: "visited", note: "" },
      "250": { legendId: "visited", note: "" },
      "276": { legendId: "driven", note: "" },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    const counts = screen.getAllByRole("listitem");
    // Visited row shows count 2, Driven row shows count 1
    expect(counts[0]).toHaveTextContent("2");
    expect(counts[1]).toHaveTextContent("1");
  });

  it("shows progress bars for each legend", async () => {
    setupStore([visited, driven], { "840": { legendId: "visited", note: "" } });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(2);
    expect(bars[0]).toHaveAttribute("aria-valuenow", "100");
    expect(bars[1]).toHaveAttribute("aria-valuenow", "0");
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

  it("ignores regions assigned to a deleted legend", async () => {
    setupStore([visited], {
      "840": { legendId: "visited", note: "" },
      "250": { legendId: "deleted-legend", note: "" },
    });
    render(<StatsModal />);
    await userEvent.click(screen.getByRole("button", { name: /view stats/i }));
    expect(screen.getByText(/2 regions marked/i)).toBeInTheDocument();
    const counts = screen.getAllByRole("listitem");
    expect(counts[0]).toHaveTextContent("1");
  });
});
