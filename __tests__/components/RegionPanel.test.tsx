import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegionPanel } from "@/components/RegionPanel";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";

jest.mock("@/store/mapStore");

const mockAssignRegion = jest.fn();
const mockUnassignRegion = jest.fn();
const mockOnClose = jest.fn();

const DEFAULT_POSITION = { x: 100, y: 80 };

const setupStore = (
  regionLegendId = "",
  legends = [
    createLegend({ id: "visited", name: "Visited", color: "#16a34a" }),
    createLegend({ id: "driven", name: "Driven", color: "#2563eb" }),
  ]
) => {
  (useMapStore as jest.MockedFunction<typeof useMapStore>).mockReturnValue({
    legends,
    regions: regionLegendId ? { "US-CA": { legendId: regionLegendId, note: "" } } : {},
    assignRegion: mockAssignRegion,
    unassignRegion: mockUnassignRegion,
  } as ReturnType<typeof useMapStore>);
};

beforeEach(() => {
  jest.clearAllMocks();
  setupStore();
});

describe("RegionPanel", () => {
  it("renders the region name as a heading", () => {
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByRole("heading", { name: "California" })).toBeInTheDocument();
  });

  it("renders with dialog role for accessibility", () => {
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByRole("dialog", { name: "California" })).toBeInTheDocument();
  });

  it("renders a chip button for each legend", () => {
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByRole("button", { name: "Visited" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Driven" })).toBeInTheDocument();
  });

  it("calls assignRegion when an unassigned chip is clicked", async () => {
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Visited" }));
    expect(mockAssignRegion).toHaveBeenCalledWith("US-CA", "visited");
    expect(mockUnassignRegion).not.toHaveBeenCalled();
  });

  it("calls unassignRegion when the currently assigned chip is clicked again", async () => {
    setupStore("visited");
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Visited" }));
    expect(mockUnassignRegion).toHaveBeenCalledWith("US-CA");
    expect(mockAssignRegion).not.toHaveBeenCalled();
  });

  it("switches assignment when a different chip is clicked", async () => {
    setupStore("visited");
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Driven" }));
    expect(mockAssignRegion).toHaveBeenCalledWith("US-CA", "driven");
    expect(mockUnassignRegion).not.toHaveBeenCalled();
  });

  it("marks the assigned chip with aria-pressed=true", () => {
    setupStore("visited");
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByRole("button", { name: "Visited" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Driven" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onClose when the close button is clicked", async () => {
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows an empty-state message when there are no legends", () => {
    setupStore("", []);
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={DEFAULT_POSITION}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText(/no legends yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Visited" })).not.toBeInTheDocument();
  });

  it("positions the panel using the provided coordinates", () => {
    render(
      <RegionPanel
        regionId="US-CA"
        regionName="California"
        position={{ x: 200, y: 150 }}
        onClose={mockOnClose}
      />
    );
    const dialog = screen.getByRole("dialog", { name: "California" });
    expect(dialog).toHaveStyle({ top: "150px" });
  });
});
