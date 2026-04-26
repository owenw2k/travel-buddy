import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Header } from "@/components/Header";
import { useMapStore } from "@/store/mapStore";

jest.mock("@/store/mapStore");
jest.mock("next-themes", () => ({
  useTheme: jest.fn().mockReturnValue({
    resolvedTheme: "light",
    setTheme: jest.fn(),
    theme: "light",
    themes: [],
    systemTheme: undefined,
    forcedTheme: undefined,
  }),
}));

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

const setupStore = (world = true) => {
  const setWorld = jest.fn();
  const clearData = jest.fn();
  mockUseMapStore.mockReturnValue({
    world,
    setWorld,
    legends: [],
    regions: {},
    addLegend: jest.fn(),
    removeLegend: jest.fn(),
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    clearData,
    hydrate: jest.fn().mockResolvedValue(undefined),
  } as ReturnType<typeof useMapStore>);
  return { setWorld, clearData };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Header", () => {
  it("renders the app title", () => {
    setupStore();
    render(<Header />);
    expect(screen.getByText("Travel Buddy")).toBeInTheDocument();
  });

  it("renders World and United States toggle buttons", () => {
    setupStore();
    render(<Header />);
    expect(screen.getByRole("button", { name: /world/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /united states/i })).toBeInTheDocument();
  });

  it("marks World button as pressed when world is true", () => {
    setupStore(true);
    render(<Header />);
    expect(screen.getByRole("button", { name: /world/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /united states/i })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("marks United States button as pressed when world is false", () => {
    setupStore(false);
    render(<Header />);
    expect(screen.getByRole("button", { name: /world/i })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /united states/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("calls setWorld(true) when the World button is clicked", async () => {
    const { setWorld } = setupStore(false);
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /world/i }));
    expect(setWorld).toHaveBeenCalledWith(true);
  });

  it("calls setWorld(false) when the United States button is clicked", async () => {
    const { setWorld } = setupStore(true);
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /united states/i }));
    expect(setWorld).toHaveBeenCalledWith(false);
  });

  it("renders the dark mode toggle", () => {
    setupStore();
    render(<Header />);
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it("renders the clear all data button", () => {
    setupStore();
    render(<Header />);
    expect(screen.getByRole("button", { name: /clear all data/i })).toBeInTheDocument();
  });

  it("shows inline confirmation when clear all data is clicked", async () => {
    setupStore();
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /clear all data/i }));
    expect(screen.getByText(/clear all data\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirm clear all data/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls clearData and dismisses confirmation when confirmed", async () => {
    const { clearData } = setupStore();
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /clear all data/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm clear all data/i }));
    expect(clearData).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/clear all data\?/i)).not.toBeInTheDocument();
  });

  it("does not call clearData when cancel is clicked", async () => {
    const { clearData } = setupStore();
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /clear all data/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(clearData).not.toHaveBeenCalled();
  });

  it("dismisses confirmation without clearing when cancel is clicked", async () => {
    setupStore();
    render(<Header />);
    await userEvent.click(screen.getByRole("button", { name: /clear all data/i }));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/clear all data\?/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear all data/i })).toBeInTheDocument();
  });
});
