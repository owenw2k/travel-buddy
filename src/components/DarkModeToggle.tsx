"use client";

/**
 * Icon button that toggles between light and dark mode via next-themes.
 */

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

import type { ReactElement } from "react";

/**
 * A ghost icon button that toggles the active color scheme between light and dark.
 *
 * Reads and sets theme via next-themes `useTheme`. Defaults to treating an
 * unresolved theme (pre-hydration) as light. The aria-label describes the
 * action the button will perform, not the current state.
 *
 * @returns A sun or moon icon button depending on the current theme.
 */
export const DarkModeToggle = (): ReactElement => {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
      }}
      aria-label={isDark ? "switch to light mode" : "switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};
