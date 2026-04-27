import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSearchParams } from "next/navigation";

import { ShareImportDialog } from "@/components/ShareImportDialog";
import { encodeState } from "@/lib/share";
import { useMapStore } from "@/store/mapStore";

import { createMapState } from "../factories/createMapState";

jest.mock("@/store/mapStore");
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div>{children}</div> : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div role="dialog">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogAction: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  AlertDialogCancel: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;
const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

const sharedState = createMapState({ world: false });
const validEncoded = encodeState(sharedState);

const setupStore = () => {
  const importState = jest.fn();
  mockUseMapStore.mockReturnValue({
    ...createMapState(),
    setWorld: jest.fn(),
    addLegend: jest.fn(),
    removeLegend: jest.fn(),
    updateLegend: jest.fn(),
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    clearData: jest.fn(),
    hydrate: jest.fn(),
    importState,
  } as ReturnType<typeof useMapStore>);
  return { importState };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ShareImportDialog", () => {
  it("renders nothing when the s param is absent", () => {
    setupStore();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>
    );
    const { container } = render(<ShareImportDialog />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the s param is invalid base64", () => {
    setupStore();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("s=not-valid-encoded-state") as ReturnType<typeof useSearchParams>
    );
    const { container } = render(<ShareImportDialog />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the import dialog when a valid s param is present", () => {
    setupStore();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`s=${validEncoded}`) as ReturnType<typeof useSearchParams>
    );
    render(<ShareImportDialog />);
    expect(screen.getByRole("heading", { name: /import shared map\?/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /import map/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /keep my map/i })).toBeInTheDocument();
  });

  it("calls importState with the decoded state when Import map is clicked", async () => {
    const { importState } = setupStore();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`s=${validEncoded}`) as ReturnType<typeof useSearchParams>
    );
    render(<ShareImportDialog />);
    await userEvent.click(screen.getByRole("button", { name: /import map/i }));
    expect(importState).toHaveBeenCalledWith(sharedState);
  });

  it("dismisses the dialog when Keep my map is clicked without importing", async () => {
    const { importState } = setupStore();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`s=${validEncoded}`) as ReturnType<typeof useSearchParams>
    );
    render(<ShareImportDialog />);
    await userEvent.click(screen.getByRole("button", { name: /keep my map/i }));
    expect(importState).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("dismisses the dialog after importing", async () => {
    setupStore();
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams(`s=${validEncoded}`) as ReturnType<typeof useSearchParams>
    );
    render(<ShareImportDialog />);
    await userEvent.click(screen.getByRole("button", { name: /import map/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
