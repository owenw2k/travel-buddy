import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LegendPanel } from "@/components/LegendPanel";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

jest.mock("@/store/mapStore");
// Stub out AddLegendModal to keep LegendPanel tests focused on the panel itself.
jest.mock("@/components/AddLegendModal", () => ({
  AddLegendModal: () => <button>Add category</button>,
}));

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

const setupStore = (
  legends = [
    createLegend({ id: "visited", name: "Visited", color: "#16a34a" }),
    createLegend({ id: "driven", name: "Driven", color: "#d97706" }),
  ]
) => {
  const removeLegend = jest.fn();
  mockUseMapStore.mockReturnValue({
    legends,
    removeLegend,
    regions: {},
    world: true,
    setWorld: jest.fn(),
    addLegend: jest.fn(),
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    clearData: jest.fn(),
    hydrate: jest.fn().mockResolvedValue(undefined),
  } as ReturnType<typeof useMapStore>);
  return { removeLegend };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("LegendPanel", () => {
  it("renders a legend heading", () => {
    setupStore();
    render(<LegendPanel />);
    expect(screen.getByRole("heading", { name: /legend/i })).toBeInTheDocument();
  });

  it("renders all legend category names", () => {
    setupStore();
    render(<LegendPanel />);
    expect(screen.getByText("Visited")).toBeInTheDocument();
    expect(screen.getByText("Driven")).toBeInTheDocument();
  });

  it("renders a remove button for each legend", () => {
    setupStore();
    render(<LegendPanel />);
    expect(screen.getByRole("button", { name: /remove visited/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove driven/i })).toBeInTheDocument();
  });

  it("shows inline confirmation when a remove button is clicked", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /remove visited/i }));
    expect(screen.getByText(/remove\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm remove visited/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls removeLegend when the confirm button is clicked", async () => {
    const { removeLegend } = setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /remove visited/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm remove visited/i }));
    expect(removeLegend).toHaveBeenCalledWith("visited");
  });

  it("does not call removeLegend when cancel is clicked", async () => {
    const { removeLegend } = setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /remove visited/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(removeLegend).not.toHaveBeenCalled();
  });

  it("restores the normal state after cancel", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /remove visited/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/remove\?/i)).not.toBeInTheDocument();
    expect(screen.getByText("Visited")).toBeInTheDocument();
  });

  it("only shows confirmation for the clicked legend, not others", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /remove visited/i }));
    expect(screen.getByText("Driven")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove driven/i })).toBeInTheDocument();
  });

  it("renders an empty list gracefully when there are no legends", () => {
    setupStore([]);
    render(<LegendPanel />);
    expect(screen.getByRole("heading", { name: /legend/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("renders the add category trigger", () => {
    setupStore();
    render(<LegendPanel />);
    expect(screen.getByRole("button", { name: /add category/i })).toBeInTheDocument();
  });

  it("renders the panel with the screenshot data attribute", () => {
    setupStore();
    render(<LegendPanel />);
    expect(document.querySelector("[data-screenshot='legend-panel']")).toBeInTheDocument();
  });
});
