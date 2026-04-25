import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegionDialog } from "@/components/RegionDialog";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

jest.mock("@/store/mapStore");

const mockAssignRegion = jest.fn();
const mockUnassignRegion = jest.fn();
const mockSetRegionNote = jest.fn();
const mockOnClose = jest.fn();

/** Resets all mocks and sets up a default store return. */
const setupStore = (
  regionNote = "",
  regionLegendId = "",
  legends = [createLegend({ id: "visited", name: "Visited", color: "#16a34a" })]
) => {
  (useMapStore as jest.MockedFunction<typeof useMapStore>).mockReturnValue({
    legends,
    regions:
      regionLegendId || regionNote
        ? { "US-CA": { legendId: regionLegendId, note: regionNote } }
        : {},
    assignRegion: mockAssignRegion,
    unassignRegion: mockUnassignRegion,
    setRegionNote: mockSetRegionNote,
  } as ReturnType<typeof useMapStore>);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupStore();
});

describe("RegionDialog", () => {
  it("renders the region name in the dialog heading", () => {
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    expect(screen.getByRole("heading", { name: "California" })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={false} onClose={mockOnClose} />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the existing note in the textarea", () => {
    setupStore("Road trip 2024", "visited");
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    expect(screen.getByRole("textbox", { name: /note for california/i })).toHaveValue(
      "Road trip 2024"
    );
  });

  it("calls setRegionNote and onClose when Save is clicked", async () => {
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: /note for california/i }),
      "Great state"
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(mockSetRegionNote).toHaveBeenCalledWith("US-CA", "Great state");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose and does not save when Cancel is clicked", async () => {
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockSetRegionNote).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders a select trigger accessible to keyboard users", () => {
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    expect(
      screen.getByRole("combobox", { name: /assign legend to california/i })
    ).toBeInTheDocument();
  });

  it("calls assignRegion when a legend is selected from the dropdown", async () => {
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    await userEvent.click(screen.getByRole("combobox", { name: /assign legend to california/i }));
    const visitedOption = await screen.findByRole("option", { name: /visited/i });
    await userEvent.click(visitedOption);
    expect(mockAssignRegion).toHaveBeenCalledWith("US-CA", "visited");
  });

  it("calls unassignRegion when None is selected", async () => {
    setupStore("", "visited");
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    await userEvent.click(screen.getByRole("combobox", { name: /assign legend to california/i }));
    const noneOption = await screen.findByRole("option", { name: /^none$/i });
    await userEvent.click(noneOption);
    expect(mockUnassignRegion).toHaveBeenCalledWith("US-CA");
  });

  it("calls onClose when the dialog X button is clicked", async () => {
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    // The shadcn DialogContent renders an accessible close button (sr-only "Close" label).
    await userEvent.click(screen.getByRole("button", { name: /^close$/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockSetRegionNote).not.toHaveBeenCalled();
  });

  it("initializes note from the store when mounted for a region with an existing note", () => {
    setupStore("Road trip 2024", "visited");
    render(
      <RegionDialog regionId="US-CA" regionName="California" isOpen={true} onClose={mockOnClose} />
    );
    // Note is loaded from the store on initial mount.
    expect(screen.getByRole("textbox", { name: /note for california/i })).toHaveValue(
      "Road trip 2024"
    );
  });
});
