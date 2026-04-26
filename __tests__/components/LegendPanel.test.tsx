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
  const updateLegend = jest.fn();
  mockUseMapStore.mockReturnValue({
    legends,
    removeLegend,
    updateLegend,
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
  return { removeLegend, updateLegend };
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

  it("renders an edit button for each legend", () => {
    setupStore();
    render(<LegendPanel />);
    expect(screen.getByRole("button", { name: /edit visited/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit driven/i })).toBeInTheDocument();
  });

  it("shows the edit form when the pencil button is clicked", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    expect(screen.getByRole("textbox", { name: /legend name/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save visited/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel edit/i })).toBeInTheDocument();
  });

  it("pre-populates the edit form with the current name and color", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    expect(screen.getByRole("textbox", { name: /legend name/i })).toHaveValue("Visited");
  });

  it("calls updateLegend with new values when save is clicked", async () => {
    const { updateLegend } = setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    const input = screen.getByRole("textbox", { name: /legend name/i });
    await userEvent.clear(input);
    await userEvent.type(input, "Been there");
    await userEvent.click(screen.getByRole("button", { name: /save visited/i }));
    expect(updateLegend).toHaveBeenCalledWith("visited", { name: "Been there", color: "#16a34a" });
  });

  it("falls back to the original name when saved with an empty name", async () => {
    const { updateLegend } = setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    await userEvent.clear(screen.getByRole("textbox", { name: /legend name/i }));
    await userEvent.click(screen.getByRole("button", { name: /save visited/i }));
    expect(updateLegend).toHaveBeenCalledWith("visited", { name: "Visited", color: "#16a34a" });
  });

  it("does not call updateLegend when cancel is clicked", async () => {
    const { updateLegend } = setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel edit/i }));
    expect(updateLegend).not.toHaveBeenCalled();
  });

  it("restores the normal state after cancelling an edit", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel edit/i }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Visited")).toBeInTheDocument();
  });

  it("saves on Enter key in the name input", async () => {
    const { updateLegend } = setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    const input = screen.getByRole("textbox", { name: /legend name/i });
    await userEvent.clear(input);
    await userEvent.type(input, "Been there{Enter}");
    expect(updateLegend).toHaveBeenCalledWith("visited", { name: "Been there", color: "#16a34a" });
  });

  it("cancels on Escape key in the name input", async () => {
    const { updateLegend } = setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    await userEvent.keyboard("{Escape}");
    expect(updateLegend).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("clears a pending remove confirmation when entering edit mode", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /remove visited/i }));
    expect(screen.getByText(/remove\?/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /edit driven/i }));
    expect(screen.queryByText(/remove\?/i)).not.toBeInTheDocument();
  });

  it("clears a pending edit when entering remove confirmation mode", async () => {
    setupStore();
    render(<LegendPanel />);
    await userEvent.click(screen.getByRole("button", { name: /edit visited/i }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /remove driven/i }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
