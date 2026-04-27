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
 * Both icons are always present in the DOM; `dark:` CSS classes show the correct
 * one based on the `.dark` class that next-themes sets synchronously before React
 * hydrates. `suppressHydrationWarning` on the button covers the aria-label
 * attribute, which differs between server (resolvedTheme is undefined) and client.
 *
 * @returns A ghost button with a sun/moon icon pair toggled by CSS.
 */
export const DarkModeToggle = (): ReactElement => {
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "switch to light mode" : "switch to dark mode"}
      suppressHydrationWarning
    >
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
    </Button>
  );
};
