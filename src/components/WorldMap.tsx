"use client";

/**
 * Interactive SVG world map component.
 */

import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import { RegionPopover } from "@/components/RegionPopover";
import { ZoomControls } from "@/components/ZoomControls";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

const GEO_URL = "/world.json";

/** The default fill for unassigned regions. */
const DEFAULT_FILL = "#d1cdc6";

/** The fill for unassigned regions on hover. */
const HOVER_FILL = "#b8b2ab";

/** The stroke color between countries. */
const STROKE_COLOR = "#a09890";

/** Maximum zoom level for the world map. */
const MAX_ZOOM = 8;

/** A region selected by the user, awaiting dialog interaction. */
type SelectedRegion = {
  /** GeoJSON feature id, used as the store region key. */
  id: string;
  /** Human-readable country name shown in the dialog title. */
  name: string;
};

/**
 * Opens the region dialog for the given feature.
 *
 * @param id - Stringified feature id.
 * @param name - Country name from GeoJSON properties.
 * @param setSelected - Setter from useState.
 */
const selectRegion = (id: string, name: string, setSelected: (r: SelectedRegion) => void) => {
  setSelected({ id, name });
};

/**
 * Full world map rendered with react-simple-maps.
 *
 * Each country is colored by its assigned legend category. Clicking or
 * pressing Enter/Space on a country opens a RegionDialog for legend
 * assignment and note editing. Supports pan and zoom via ZoomableGroup (both
 * mouse/touch and the ZoomControls overlay buttons).
 *
 * Zoom and center are controlled: `onMoveEnd` syncs them back after user
 * drag/pinch gestures, and ZoomControls callbacks update them programmatically.
 *
 * The GeoJSON is fetched lazily from /world.json (served from public/).
 *
 * @returns An interactive SVG world map with a region dialog overlay and zoom controls.
 */
export const WorldMap = (): ReactElement => {
  const { legends, regions } = useMapStore();
  const [selected, setSelected] = useState<SelectedRegion | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 0]);

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

  return (
    <>
      <div className="relative h-full w-full" data-screenshot="world-map">
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
                      onClick={() => {
                        selectRegion(regionId, name, setSelected);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          selectRegion(regionId, name, setSelected);
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
      </div>
      {selected && (
        <RegionPopover
          key={selected.id}
          regionId={selected.id}
          regionName={selected.name}
          onClose={() => {
            setSelected(null);
          }}
        />
      )}
    </>
  );
};
