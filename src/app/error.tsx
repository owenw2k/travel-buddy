"use client";

/**
 * Next.js error boundary for the root layout.
 *
 * Catches hard rendering failures and offers the user a retry path.
 * Uses `unstable_retry` (renamed from `reset` in Next.js 16).
 * Follows the same playful travel theme as all other error pages.
 */
import Link from "next/link";

import type { ReactElement } from "react";

type ErrorProps = {
  /** The caught error. The `digest` property contains the server-side error ID, if any. */
  error: Error & { digest?: string };
  /** Retry callback provided by Next.js — re-renders the segment that failed. */
  unstable_retry: () => void;
};

/**
 * Rendered by Next.js when an unhandled error is thrown in a page or layout.
 *
 * @param props.error - The caught error object.
 * @param props.unstable_retry - Next.js callback to re-render the failed segment.
 * @returns A full-page error view with retry and home options.
 */
export default function Error({ unstable_retry }: ErrorProps): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="text-5xl" aria-hidden="true">
        ⛔
      </div>
      <h1 className="text-3xl font-semibold text-foreground">Something went sideways.</h1>
      <p className="max-w-md text-text-muted">
        The map hit an unexpected detour. You can try again or head home.
      </p>
      <div className="flex gap-4">
        <button
          onClick={unstable_retry}
          className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Try again
        </button>
        <Link
          href="/"
          className="font-medium text-text-muted underline underline-offset-4 hover:text-foreground"
        >
          Back to the map
        </Link>
      </div>
    </main>
  );
}
