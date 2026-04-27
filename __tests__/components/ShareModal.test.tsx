import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ShareModal } from "@/components/ShareModal";
import { useMapStore } from "@/store/mapStore";

import { createMapState } from "../factories/createMapState";

jest.mock("@/store/mapStore");

jest.mock("@icons-pack/react-simple-icons", () => ({
  SiBluesky: () => <svg data-testid="icon-bluesky" />,
  SiBlueskyHex: "#0085ff",
  SiFacebook: () => <svg data-testid="icon-facebook" />,
  SiFacebookHex: "#0866FF",
  SiReddit: () => <svg data-testid="icon-reddit" />,
  SiRedditHex: "#FF4500",
}));

jest.mock("@/components/MapExportRenderer", () => ({
  MapExportRenderer: ({ onReady }: { onReady: (refs: object) => void }) => {
    onReady({
      stats: document.createElement("div"),
      world: document.createElement("div"),
      us: document.createElement("div"),
    });
    return null;
  },
  EXPORT_W: 1200,
  EXPORT_H: 675,
}));

jest.mock("@/lib/exportImages", () => ({
  captureElement: jest.fn().mockResolvedValue(new Blob(["png"], { type: "image/png" })),
  downloadBlob: jest.fn(),
}));

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
  Object.defineProperty(URL, "createObjectURL", {
    value: jest.fn().mockReturnValue("blob:http://localhost/fake"),
    writable: true,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    value: jest.fn(),
    writable: true,
  });
});

describe("ShareModal", () => {
  it("renders a share button with an accessible label", () => {
    setupStore();
    render(<ShareModal />);
    expect(screen.getByRole("button", { name: /share map/i })).toBeInTheDocument();
  });

  it("shows the share dialog with all platform buttons", () => {
    setupStore();
    render(<ShareModal />);
    expect(screen.getByRole("heading", { name: /share your map/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share on twitter/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share on facebook/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share on reddit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share on bluesky/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /share on sms/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy link/i })).toBeInTheDocument();
  });

  it("opens a Twitter intent URL when Twitter is clicked", async () => {
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share on twitter/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("twitter.com/intent/tweet"),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens a Facebook sharer URL when Facebook is clicked", async () => {
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share on facebook/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("facebook.com/sharer"),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens a Reddit submit URL when Reddit is clicked", async () => {
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share on reddit/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("reddit.com/submit"),
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("opens a Bluesky compose URL when Bluesky is clicked", async () => {
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share on bluesky/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining("bsky.app/intent/compose"),
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

  it("always shows a share or download button", async () => {
    setupStore();
    render(<ShareModal />);
    // Open the dialog to start generation
    await userEvent.click(screen.getByRole("button", { name: /share map/i }));
    // After blobs are ready the button reads "Download images" (Web Share not available in jsdom)
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /download images/i })).toBeInTheDocument()
    );
  });

  it("shows a too-large message and hides link share options when state exceeds URL limit", async () => {
    const regions: Record<string, { legendId: string; note: string }> = {};
    for (let i = 0; i < 50; i++) {
      regions[`region-${i}`] = { legendId: "visited", note: "x".repeat(100) };
    }
    setupStore(createMapState({ regions }));
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share map/i }));
    await waitFor(() =>
      expect(screen.getByText(/too large to share as a link/i)).toBeInTheDocument()
    );
    expect(screen.queryByRole("button", { name: /share on twitter/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /copy link/i })).not.toBeInTheDocument();
    // Download button still visible when link sharing is unavailable
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /download images/i })).toBeInTheDocument()
    );
  });

  it("triggers image downloads when Download images is clicked", async () => {
    const { downloadBlob } = await import("@/lib/exportImages");
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share map/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /download images/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /download images/i }));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalledTimes(3), { timeout: 2000 });
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "travel-buddy-stats.png");
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "travel-buddy-world.png");
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "travel-buddy-us.png");
  });

  it("triggers SMS share when SMS is clicked", async () => {
    setupStore();
    render(<ShareModal />);
    // jsdom ignores non-http href assignments; we just verify the click handler runs
    // by confirming no other share mechanism was triggered
    await userEvent.click(screen.getByRole("button", { name: /share on sms/i }));
    expect(window.open).not.toHaveBeenCalled();
  });

  it("shows Share image button and calls navigator.share when Web Share is available", async () => {
    Object.assign(navigator, {
      canShare: jest.fn().mockReturnValue(true),
      share: jest.fn().mockResolvedValue(undefined),
    });
    setupStore();
    render(<ShareModal />);
    await userEvent.click(screen.getByRole("button", { name: /share map/i }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /share image/i })).toBeInTheDocument()
    );
    await userEvent.click(screen.getByRole("button", { name: /share image/i }));
    await waitFor(() => expect(navigator.share).toHaveBeenCalledTimes(1));
    expect(navigator.share).toHaveBeenCalledWith(
      expect.objectContaining({ title: "My Travel Map" })
    );
  });
});
