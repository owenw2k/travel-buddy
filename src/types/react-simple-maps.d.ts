/**
 * Minimal ambient module declaration for react-simple-maps v3.
 *
 * The package ships no .d.ts files. This covers only the components used by
 * WorldMap and AmericaMap. Imports inside declare module are local to the
 * declaration and do not affect the module system.
 */

declare module "react-simple-maps" {
  import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";

  /** Style object applied to a Geography element in each interaction state. */
  type GeoStyle = {
    /** Default (idle) appearance. */
    default: CSSProperties & { cursor?: string };
    /** Hovered appearance. */
    hover: CSSProperties & { cursor?: string };
    /** Pressed (active) appearance. */
    pressed: CSSProperties & { cursor?: string };
  };

  /** A single geography feature as returned by the Geographies render prop. */
  export type GeographyFeature = {
    /** Internal react-simple-maps key, safe to use as the React `key` prop. */
    rsmKey: string;
    /** Feature identifier from the source TopoJSON (e.g. ISO numeric or FIPS). */
    id: string | number;
    /** Arbitrary feature properties from the source GeoJSON/TopoJSON. */
    properties: Record<string, unknown>;
  };

  /** Render-prop argument passed to the Geographies children function. */
  type GeographiesChildProps = {
    /** Processed geography features ready to render. */
    geographies: GeographyFeature[];
  };

  /**
   * Root SVG container for a react-simple-maps composition.
   *
   * @param projection - d3-geo projection name (e.g. "geoEqualEarth", "geoAlbersUsa").
   * @param projectionConfig - Projection overrides such as `scale` and `center`.
   * @param style - Inline styles applied to the SVG element.
   * @param children - Map layers (ZoomableGroup, Geographies, Sphere, etc.).
   */
  export const ComposableMap: (props: {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    style?: CSSProperties;
    children?: ReactNode;
  }) => JSX.Element;

  /**
   * Adds pan and zoom behaviour to its child map layers.
   *
   * @param children - Map layers to make pannable/zoomable.
   */
  export const ZoomableGroup: (props: {
    children?: ReactNode;
    [key: string]: unknown;
  }) => JSX.Element;

  /**
   * Loads a GeoJSON/TopoJSON source and exposes the resulting features via
   * a render prop.
   *
   * @param geography - URL string or topology object.
   * @param children - Render prop receiving the processed geography features.
   */
  export const Geographies: (props: {
    geography: string | object;
    children: (props: GeographiesChildProps) => ReactNode;
  }) => JSX.Element;

  /**
   * Renders a single SVG path for one geography feature.
   *
   * @param geography - Feature to render, from the Geographies render prop.
   * @param style - Per-state style objects (default / hover / pressed).
   * @param onClick - Click handler receiving the native mouse event.
   * @param onKeyDown - Keyboard handler for accessibility (Enter / Space).
   * @param tabIndex - Tab stop index; set to 0 for keyboard navigation.
   */
  export const Geography: (props: {
    geography: GeographyFeature;
    style?: GeoStyle;
    onClick?: (event: MouseEvent<SVGPathElement>) => void;
    onKeyDown?: (event: KeyboardEvent<SVGPathElement>) => void;
    tabIndex?: number;
    "aria-label"?: string;
  }) => JSX.Element | null;
}
