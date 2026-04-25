import { AppShell } from "@/components/AppShell";

import type { ReactElement } from "react";

/**
 * Root page: renders the interactive map for Chromium users or a friendly
 * fallback for non-Chromium browsers. All logic lives in AppShell (client
 * component) so that browser detection runs after hydration.
 *
 * @returns The app shell, which resolves to the map or the browser fallback.
 */
export default function Home(): ReactElement {
  return <AppShell />;
}
