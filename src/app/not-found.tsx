/**
 * 404 page for unknown routes.
 *
 * Follows the same playful travel theme as NonChromiumFallback:
 * short, witty copy, a way back, and no raw error details.
 */
import Link from "next/link";

import type { ReactElement } from "react";

/**
 * Rendered by Next.js whenever a route is not found.
 *
 * @returns A full-page 404 view with a travel-themed message.
 */
export default function NotFound(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="text-5xl" aria-hidden="true">
        🗺️
      </div>
      <h1 className="text-3xl font-semibold text-foreground">This route doesn&apos;t exist.</h1>
      <p className="max-w-md text-text-muted">
        Looks like you took a wrong turn. This destination isn&apos;t on our map.
      </p>
      <Link
        href="/"
        className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
      >
        Back to the map
      </Link>
    </main>
  );
}
