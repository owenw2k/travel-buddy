import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";

import { DarkModeToggle } from "@/components/DarkModeToggle";

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("DarkModeToggle", () => {
  it("shows 'switch to dark mode' label when theme is light", () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: "light",
      setTheme: jest.fn(),
      theme: "light",
      themes: [],
      systemTheme: undefined,
      forcedTheme: undefined,
    });
    render(<DarkModeToggle />);
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
  });

  it("shows 'switch to light mode' label when theme is dark", () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: "dark",
      setTheme: jest.fn(),
      theme: "dark",
      themes: [],
      systemTheme: undefined,
      forcedTheme: undefined,
    });
    render(<DarkModeToggle />);
    expect(screen.getByRole("button", { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it("calls setTheme with 'dark' when toggled from light", async () => {
    const setTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      resolvedTheme: "light",
      setTheme,
      theme: "light",
      themes: [],
      systemTheme: undefined,
      forcedTheme: undefined,
    });
    render(<DarkModeToggle />);
    await userEvent.click(screen.getByRole("button", { name: /switch to dark mode/i }));
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with 'light' when toggled from dark", async () => {
    const setTheme = jest.fn();
    mockUseTheme.mockReturnValue({
      resolvedTheme: "dark",
      setTheme,
      theme: "dark",
      themes: [],
      systemTheme: undefined,
      forcedTheme: undefined,
    });
    render(<DarkModeToggle />);
    await userEvent.click(screen.getByRole("button", { name: /switch to light mode/i }));
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("treats an unresolved theme as light (pre-hydration default)", () => {
    mockUseTheme.mockReturnValue({
      resolvedTheme: undefined,
      setTheme: jest.fn(),
      theme: undefined,
      themes: [],
      systemTheme: undefined,
      forcedTheme: undefined,
    });
    render(<DarkModeToggle />);
    // Unresolved resolvedTheme is not "dark", so the label should show dark mode
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
  });
});
