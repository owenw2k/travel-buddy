"use client";

/**
 * Interactive SVG US states map component.
 */

import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import { RegionPopover } from "@/components/RegionPopover";
import { ZoomControls } from "@/components/ZoomControls";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

const GEO_URL = "/us.json";

/** The default fill for unassigned states. */
const DEFAULT_FILL = "#d1cdc6";

/** The fill for unassigned states on hover. */
const HOVER_FILL = "#b8b2ab";

/** The stroke color between states. */
const STROKE_COLOR = "#a09890";

/** Maximum zoom level for the US map. */
const MAX_ZOOM = 8;

/** A region selected by the user, awaiting dialog interaction. */
type SelectedRegion = {
  /** FIPS state code, used as the store region key. */
  id: string;
  /** Human-readable state name shown in the dialog title. */
  name: string;
};

/**
 * Opens the region dialog for the given feature.
 *
 * @param id - Stringified feature id (FIPS code).
 * @param name - State name from GeoJSON properties.
 * @param setSelected - Setter from useState.
 */
const selectRegion = (id: string, name: string, setSelected: (r: SelectedRegion) => void) => {
  setSelected({ id, name });
};

/**
 * US states map rendered with react-simple-maps using the Albers USA projection.
 *
 * Each state is colored by its assigned legend category. Clicking or pressing
 * Enter/Space on a state opens a RegionDialog for legend assignment and note
 * editing. Supports pan and zoom via ZoomableGroup (both mouse/touch and the
 * ZoomControls overlay buttons).
 *
 * The Albers USA projection repositions Alaska and Hawaii as insets. Center
 * is tracked for controlled zoom so programmatic zoom-in stays anchored to
 * the current view position.
 *
 * The GeoJSON is fetched lazily from /us.json (served from public/).
 *
 * @returns An interactive SVG US map with a region dialog overlay and zoom controls.
 */
export const AmericaMap = (): ReactElement => {
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
      <div className="relative h-full w-full" data-screenshot="us-map">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 900 }}
          style={{ width: "100%", height: "100%" }}
        >
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
