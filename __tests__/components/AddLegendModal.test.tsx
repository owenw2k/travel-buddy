import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AddLegendModal } from "@/components/AddLegendModal";
import { useMapStore } from "@/store/mapStore";

jest.mock("@/store/mapStore");

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

const setupStore = () => {
  const addLegend = jest.fn();
  mockUseMapStore.mockReturnValue({
    addLegend,
    legends: [],
    regions: {},
    world: true,
    setWorld: jest.fn(),
    removeLegend: jest.fn(),
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    clearData: jest.fn(),
    hydrate: jest.fn().mockResolvedValue(undefined),
  } as ReturnType<typeof useMapStore>);
  return { addLegend };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AddLegendModal", () => {
  it("renders the trigger button", () => {
    setupStore();
    render(<AddLegendModal />);
    expect(screen.getByRole("button", { name: /add category/i })).toBeInTheDocument();
  });

  it("dialog is not visible before the trigger is clicked", () => {
    setupStore();
    render(<AddLegendModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the dialog when the trigger button is clicked", async () => {
    setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /add legend category/i })).toBeInTheDocument();
  });

  it("renders the name input and color picker in the dialog", async () => {
    setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pick a color/i)).toBeInTheDocument();
  });

  it("Add button is disabled when name is empty", async () => {
    setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    expect(screen.getByRole("button", { name: /^add$/i })).toBeDisabled();
  });

  it("Add button is enabled once a name is typed", async () => {
    setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    await userEvent.type(screen.getByLabelText(/name/i), "Camped");
    expect(screen.getByRole("button", { name: /^add$/i })).not.toBeDisabled();
  });

  it("calls addLegend with trimmed name and selected color on save", async () => {
    const { addLegend } = setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    await userEvent.type(screen.getByLabelText(/name/i), "Camped");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(addLegend).toHaveBeenCalledWith(expect.objectContaining({ name: "Camped" }));
  });

  it("closes the dialog after saving", async () => {
    setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    await userEvent.type(screen.getByLabelText(/name/i), "Camped");
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not call addLegend when Cancel is clicked", async () => {
    const { addLegend } = setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    await userEvent.type(screen.getByLabelText(/name/i), "Camped");
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(addLegend).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("submits via Enter key when name is filled", async () => {
    const { addLegend } = setupStore();
    render(<AddLegendModal />);
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    await userEvent.type(screen.getByLabelText(/name/i), "Camped{Enter}");
    expect(addLegend).toHaveBeenCalledTimes(1);
  });

  it("resets name field when dialog is closed via Cancel", async () => {
    setupStore();
    render(<AddLegendModal />);
    // Open and type a name
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    await userEvent.type(screen.getByLabelText(/name/i), "Camped");
    // Cancel
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    // Re-open
    await userEvent.click(screen.getByRole("button", { name: /add category/i }));
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });
});
