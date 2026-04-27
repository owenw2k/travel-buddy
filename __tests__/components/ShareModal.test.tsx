import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ShareModal } from "@/components/ShareModal";
import { useMapStore } from "@/store/mapStore";

import { createMapState } from "../factories/createMapState";

jest.mock("@/store/mapStore");

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
  }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

const setupStore = (state = createMapState()) => {
  mockUseMapStore.mockReturnValue({
    ...state,
    setWorld: jest.fn(),
    addLegend: jest.fn(),
    removeLegend: jest.fn(),
    updateLegend: jest.fn(),
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    clearData: jest.fn(),
    hydrate: jest.fn(),
    importState: jest.fn(),
  } as ReturnType<typeof useMapStore>);
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(navigator, {
    clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
  jest.spyOn(window, "open").mockImplementation(() => null);
});

describe("ShareModal", () => {
  it("renders a share button with an accessible label", () => {
    setupStore();
    render(<ShareModal />);
    expect(screen.getByRole("button", { name: /share map/i })).toBeInTheDocument();
  });

  it("shows the share dialog with Twitter and Copy link buttons", () => {
    setupStore();
    render(<ShareModal />);
    expect(screen.getByRole("heading", { name: /share your map/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share on twitter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
  });

  it("opens a Twitter intent URL in a new tab when Twitter is clicked", async () => {
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share on twitter/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("twitter.com/intent/tweet"),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("copies the share URL to the clipboard when Copy link is clicked", async () => {
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /copy link/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("/?s="));
  });

  it("shows Copied! feedback after copying", async () => {
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /copy link/i }));
    expect(screen.getByRole("button", { name: /copied!/i })).toBeInTheDocument();
  });

  it("shows a too-long message when the encoded state exceeds the URL limit", () => {
    // Create a state with many large notes to force an oversized URL.
    const regions: Record<string, { legendId: string; note: string }> = {};
    for (let i = 0; i < 50; i++) {
      regions[`region-${i}`] = { legendId: "visited", note: "x".repeat(100) };
    }
    setupStore(createMapState({ regions }));
    render(<ShareModal />);
    expect(screen.getByText(/too many notes/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /share on twitter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /copy link/i })).not.toBeInTheDocument();
  });
});
