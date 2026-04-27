import { captureElement, downloadBlob } from "@/lib/exportImages";

jest.mock("html-to-image", () => ({
  toPng: jest.fn().mockResolvedValue("data:image/png;base64,abc123"),
}));

global.fetch = jest.fn().mockResolvedValue({
  blob: jest.fn().mockResolvedValue(new Blob(["png"], { type: "image/png" })),
} as unknown as Response);

describe("captureElement", () => {
  it("returns a PNG blob from the element", async () => {
    const el = document.createElement("div");
    const blob = await captureElement(el, 1200, 675);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/png");
  });

  it("passes the correct dimensions and pixel ratio to toPng", async () => {
    const { toPng } = await import("html-to-image");
    const el = document.createElement("div");
    await captureElement(el, 1200, 675);
    expect(toPng).toHaveBeenCalledWith(
      el,
      expect.objectContaining({ width: 1200, height: 675, pixelRatio: 2 })
    );
  });
});

describe("downloadBlob", () => {
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;
  let clickSpy: jest.Mock;

  beforeEach(() => {
    createObjectURL = jest.fn().mockReturnValue("blob:http://localhost/fake");
    revokeObjectURL = jest.fn();
    clickSpy = jest.fn();
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, writable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, writable: true });
    jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: clickSpy,
          style: {},
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tag);
    });
    jest.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    jest.spyOn(document.body, "removeChild").mockImplementation((node) => node);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates a blob URL and triggers a click", () => {
    const blob = new Blob(["png"], { type: "image/png" });
    downloadBlob(blob, "test.png");
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("sets the download filename on the anchor", () => {
    const blob = new Blob(["png"], { type: "image/png" });
    let capturedAnchor: { download: string } | null = null;
    jest.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        const a = { href: "", download: "", click: clickSpy, style: {} };
        capturedAnchor = a;
        return a as unknown as HTMLAnchorElement;
      }
      return document.createElement(tag);
    });
    downloadBlob(blob, "travel-buddy-stats.png");
    expect(capturedAnchor?.download).toBe("travel-buddy-stats.png");
  });

  it("revokes the object URL after download", () => {
    const blob = new Blob(["png"], { type: "image/png" });
    downloadBlob(blob, "test.png");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/fake");
  });
});
