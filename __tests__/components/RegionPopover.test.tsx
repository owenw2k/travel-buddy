import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegionPopover } from "@/components/RegionPopover";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

jest.mock("@/store/mapStore");

const mockAssignRegion = jest.fn();
const mockUnassignRegion = jest.fn();
const mockSetRegionNote = jest.fn();
const mockOnClose = jest.fn();

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

describe("RegionPopover", () => {
  it("renders the region name as a heading", () => {
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    expect(screen.getByRole("heading", { name: "California" })).toBeInTheDocument();
  });

  it("renders with dialog role for accessibility", () => {
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    expect(screen.getByRole("dialog", { name: "California" })).toBeInTheDocument();
  });

  it("shows the existing note in the textarea", () => {
    setupStore("Road trip 2024", "visited");
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    expect(screen.getByRole("textbox", { name: /note for california/i })).toHaveValue(
      "Road trip 2024"
    );
  });

  it("calls setRegionNote and onClose when Save is clicked", async () => {
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    await userEvent.type(
      screen.getByRole("textbox", { name: /note for california/i }),
      "Great state"
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(mockSetRegionNote).toHaveBeenCalledWith("US-CA", "Great state");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose without saving when the close button is clicked", async () => {
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockSetRegionNote).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders a select trigger accessible to keyboard users", () => {
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    expect(
      screen.getByRole("combobox", { name: /assign legend to california/i })
    ).toBeInTheDocument();
  });

  it("calls assignRegion when a legend is selected from the dropdown", async () => {
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    await userEvent.click(screen.getByRole("combobox", { name: /assign legend to california/i }));
    const visitedOption = await screen.findByRole("option", { name: /visited/i });
    await userEvent.click(visitedOption);
    expect(mockAssignRegion).toHaveBeenCalledWith("US-CA", "visited");
  });

  it("calls unassignRegion when None is selected", async () => {
    setupStore("", "visited");
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    await userEvent.click(screen.getByRole("combobox", { name: /assign legend to california/i }));
    const noneOption = await screen.findByRole("option", { name: /^none$/i });
    await userEvent.click(noneOption);
    expect(mockUnassignRegion).toHaveBeenCalledWith("US-CA");
  });

  it("initializes note from the store on mount", () => {
    setupStore("Road trip 2024", "visited");
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    expect(screen.getByRole("textbox", { name: /note for california/i })).toHaveValue(
      "Road trip 2024"
    );
  });

  it("shows legend name in the trigger when a legend is assigned (not the raw ID)", () => {
    setupStore("", "visited");
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    // The trigger should display "Visited", not the raw legend ID.
    expect(
      screen.getByRole("combobox", { name: /assign legend to california/i })
    ).toHaveTextContent("Visited");
  });

  it("shows legend name for a UUID legend ID (regression test for raw-ID display bug)", () => {
    const uuid = "9c0e9e3d-87e0-4d30-9e77-fecffe775625";
    setupStore("", uuid, [createLegend({ id: uuid, name: "Roadtrip", color: "#7c3aed" })]);
    render(<RegionPopover regionId="US-CA" regionName="California" onClose={mockOnClose} />);
    expect(
      screen.getByRole("combobox", { name: /assign legend to california/i })
    ).toHaveTextContent("Roadtrip");
  });
});
