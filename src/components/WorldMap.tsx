"use client";

/**
 * Interactive SVG world map component.
 */

import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

import { RegionDialog } from "@/components/RegionDialog";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

const GEO_URL = "/world.json";

/** The default fill for unassigned regions. */
const DEFAULT_FILL = "#d1cdc6";

/** The fill for unassigned regions on hover. */
const HOVER_FILL = "#b8b2ab";

/** The stroke color between countries. */
const STROKE_COLOR = "#a09890";

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
 * assignment and note editing. Supports pan and zoom via ZoomableGroup.
 *
 * The GeoJSON is fetched lazily from /world.json (served from public/).
 *
 * @returns An interactive SVG world map with a region dialog overlay.
 */
export const WorldMap = (): ReactElement => {
  const { legends, regions } = useMapStore();
  const [selected, setSelected] = useState<SelectedRegion | null>(null);

  const legendColors = Object.fromEntries(legends.map((l) => [l.id, l.color]));

  return (
    <>
      <div className="h-full w-full" data-screenshot="world-map">
        <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: "100%", height: "100%" }}>
          <ZoomableGroup>
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
      </div>
      {selected && (
        <RegionDialog
          key={selected.id}
          regionId={selected.id}
          regionName={selected.name}
          isOpen={true}
          onClose={() => {
            setSelected(null);
          }}
        />
      )}
    </>
  );
};
