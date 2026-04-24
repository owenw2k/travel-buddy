import { isChromium } from "@/lib/browser";

/**
 * Helper to override navigator.userAgent for individual test cases.
 * Restores the original value after each test via afterEach.
 */
const setUserAgent = (ua: string): void => {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
};

describe("isChromium", () => {
  const originalUA = navigator.userAgent;

  afterEach(() => {
    setUserAgent(originalUA);
  });

  it("returns true for a Chrome user agent", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    expect(isChromium()).toBe(true);
  });

  it("returns true for an Edge user agent", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0"
    );
    expect(isChromium()).toBe(true);
  });

  it("returns true for an Opera user agent", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0"
    );
    expect(isChromium()).toBe(true);
  });

  it("returns false for a Firefox user agent", () => {
    setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0"
    );
    expect(isChromium()).toBe(false);
  });

  it("returns false for a Safari user agent", () => {
    setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15"
    );
    expect(isChromium()).toBe(false);
  });

  it("returns true when navigator is undefined (SSR context)", () => {
    // Simulate SSR by temporarily hiding navigator
    const nav = global.navigator;
    // @ts-expect-error intentionally removing navigator for SSR simulation
    delete global.navigator;
    expect(isChromium()).toBe(true);
    Object.defineProperty(global, "navigator", { value: nav, configurable: true });
  });
});
