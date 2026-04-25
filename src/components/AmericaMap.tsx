"use client";

/**
 * Interactive SVG US states map component.
 */

import { useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  type MoveEndResult,
} from "react-simple-maps";

/** ZoomableGroup extended with onMoveStart, which exists at runtime but is absent from the published types. */
const PannableZoomableGroup = ZoomableGroup as ComponentType<
  React.ComponentProps<typeof ZoomableGroup> & { onMoveStart?: () => void }
>;

import { RegionPanel } from "@/components/RegionPanel";
import { ZoomControls } from "@/components/ZoomControls";
import { useMapStore } from "@/store/mapStore";

import type { ComponentType, MouseEvent, ReactElement } from "react";

const GEO_URL = "/us.json";

/** The default fill for unassigned states. */
const DEFAULT_FILL = "#d1cdc6";

/** The fill for unassigned states on hover. */
const HOVER_FILL = "#b8b2ab";

/** The stroke color between states. */
const STROKE_COLOR = "#a09890";

/** Maximum zoom level for the US map. */
const MAX_ZOOM = 8;

/** A region selected by the user, with its click position for panel placement. */
type SelectedRegion = {
  /** FIPS state code, used as the store region key. */
  id: string;
  /** Human-readable state name shown in the panel header. */
  name: string;
  /** Click coordinates relative to the map container. */
  position: { x: number; y: number };
};

/**
 * US states map rendered with react-simple-maps using the Albers USA projection.
 *
 * Each state is colored by its assigned legend category. Clicking or pressing
 * Enter/Space on a state opens a RegionPanel near the click point. The panel
 * uses chip buttons for immediate one-click legend assignment. Clicking the
 * map background closes the panel. Supports pan and zoom via ZoomableGroup
 * and the ZoomControls overlay.
 *
 * The Albers USA projection repositions Alaska and Hawaii as insets. Center
 * is tracked for controlled zoom so programmatic zoom-in stays anchored to
 * the current view position.
 *
 * @returns An interactive SVG US map with a floating region panel and zoom controls.
 */
export const AmericaMap = (): ReactElement => {
  const { legends, regions } = useMapStore();
  const [selected, setSelected] = useState<SelectedRegion | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const legendColors = Object.fromEntries(legends.map((l) => [l.id, l.color]));

  const closePanel = () => setSelected(null);

  const handleZoomIn = () => {
    closePanel();
    setZoom((z) => Math.min(z * 1.5, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    closePanel();
    setZoom((z) => Math.max(z / 1.5, 1));
  };

  const handleReset = () => {
    closePanel();
    setZoom(1);
    setCenter([0, 0]);
  };

  const getClickPosition = (e: MouseEvent): { x: number; y: number } => {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      data-screenshot="us-map"
      onClick={() => setSelected(null)}
    >
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
        style={{ width: "100%", height: "100%" }}
      >
        <PannableZoomableGroup
          zoom={zoom}
          center={center}
          maxZoom={MAX_ZOOM}
          onMoveStart={closePanel}
          onMoveEnd={({ coordinates, zoom: newZoom }: MoveEndResult) => {
            setCenter(coordinates);
            setZoom(newZoom);
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const regionId = String(geo.id);
                const entry = regions[regionId];
                const assignedColor = entry?.legendId
                  ? (legendColors[entry.legendId] ?? DEFAULT_FILL)
                  : DEFAULT_FILL;
                const name = geo.properties["name"] as string;
                const ariaLabel = entry?.legendId ? `${name} (assigned)` : name;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={0}
                    aria-label={ariaLabel}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected({ id: regionId, name, position: getClickPosition(e) });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        const rect = containerRef.current?.getBoundingClientRect();
                        const x = (rect?.width ?? 0) / 2;
                        const y = (rect?.height ?? 0) / 4;
                        setSelected({ id: regionId, name, position: { x, y } });
                      }
                    }}
                    style={{
                      default: {
                        fill: assignedColor,
                        outline: "none",
                        stroke: STROKE_COLOR,
                        strokeWidth: 0.5,
                      },
                      hover: {
                        fill: entry?.legendId ? assignedColor : HOVER_FILL,
                        outline: "none",
                        stroke: STROKE_COLOR,
                        strokeWidth: 0.5,
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: assignedColor,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </PannableZoomableGroup>
      </ComposableMap>
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onReset={handleReset} />
      {selected && (
        <RegionPanel
          key={selected.id}
          regionId={selected.id}
          regionName={selected.name}
          position={selected.position}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};
