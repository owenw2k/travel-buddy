"use client";

/**
 * Error boundary that catches crashes inside the map component (e.g. null
 * projection results from d3-geo at extreme pan/zoom states) and recovers
 * by resetting the map to its default view.
 */

import { Component } from "react";

import type { ReactElement, ReactNode } from "react";

/** Props for MapErrorBoundary. */
type Props = {
  /** The map component tree to protect. */
  children: ReactNode;
};

/** State for MapErrorBoundary. */
type State = {
  /** Whether the boundary has caught an error. */
  hasError: boolean;
};

/**
 * Class-based error boundary wrapping the interactive map.
 *
 * When the map throws during render (e.g. a null pointer in d3-geo path
 * generation at edge pan/zoom states), this boundary catches it, resets the
 * view by unmounting and remounting the child tree via a key flip, and returns
 * the user to the default zoom/center without losing their region data.
 *
 * @example
 * <MapErrorBoundary><WorldMap /></MapErrorBoundary>
 */
export class MapErrorBoundary extends Component<Props, State> {
  /** Monotonically increasing key used to force-remount the map on recovery. */
  private resetKey = 0;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  private handleReset = (): void => {
    this.resetKey += 1;
    this.setState({ hasError: false });
  };

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
          <p className="text-sm">The map ran into a problem.</p>
          <button
            onClick={this.handleReset}
            className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
          >
            Reset view
          </button>
        </div>
      );
    }

    return (
      <div key={this.resetKey} className="h-full w-full">
        {this.props.children}
      </div>
    );
  }
}
