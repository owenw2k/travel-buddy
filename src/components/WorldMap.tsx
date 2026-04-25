"use client";

/**
 * Interactive SVG world map component.
 */

import { useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import { RegionPanel } from "@/components/RegionPanel";
import { ZoomControls } from "@/components/ZoomControls";
import { useMapStore } from "@/store/mapStore";

import type { MouseEvent, ReactElement } from "react";

const GEO_URL = "/world.json";

/** The default fill for unassigned regions. */
const DEFAULT_FILL = "#d1cdc6";

/** The fill for unassigned regions on hover. */
const HOVER_FILL = "#b8b2ab";

/** The stroke color between countries. */
const STROKE_COLOR = "#a09890";

/** Maximum zoom level for the world map. */
const MAX_ZOOM = 8;

/** A region selected by the user, with its click position for panel placement. */
type SelectedRegion = {
  /** GeoJSON feature id, used as the store region key. */
  id: string;
  /** Human-readable country name shown in the panel header. */
  name: string;
  /** Click coordinates relative to the map container. */
  position: { x: number; y: number };
};

/**
 * Full world map rendered with react-simple-maps.
 *
 * Each country is colored by its assigned legend category. Clicking or
 * pressing Enter/Space on a country opens a RegionPanel near the click point.
 * The panel uses chip buttons for immediate one-click legend assignment.
 * Clicking the map background closes the panel. Supports pan and zoom via
 * ZoomableGroup and the ZoomControls overlay.
 *
 * @returns An interactive SVG world map with a floating region panel and zoom controls.
 */
export const WorldMap = (): ReactElement => {
  const { legends, regions } = useMapStore();
  const [selected, setSelected] = useState<SelectedRegion | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const containerRef = useRef<HTMLDivElement>(null);

  const legendColors = Object.fromEntries(legends.map((l) => [l.id, l.color]));

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z * 1.5, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z / 1.5, 1));
  };

  const handleReset = () => {
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
      data-screenshot="world-map"
      onClick={() => setSelected(null)}
    >
      <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: "100%", height: "100%" }}>
        <ZoomableGroup
          zoom={zoom}
          center={center}
          maxZoom={MAX_ZOOM}
          onMoveEnd={({ coordinates, zoom: newZoom }) => {
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
        </ZoomableGroup>
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
