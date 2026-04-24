import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles falsy conditionals", () => {
    expect(cn("foo", false && "bar")).toBe("foo");
  });

  it("deduplicates conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles an empty call", () => {
    expect(cn()).toBe("");
  });
});
