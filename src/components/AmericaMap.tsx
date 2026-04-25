"use client";

/**
 * Interactive SVG US states map component.
 */

import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { RegionDialog } from "@/components/RegionDialog";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

const GEO_URL = "/us.json";

/** The default fill for unassigned states. */
const DEFAULT_FILL = "#d1cdc6";

/** The fill for unassigned states on hover. */
const HOVER_FILL = "#b8b2ab";

/** The stroke color between states. */
const STROKE_COLOR = "#a09890";

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
 * editing. The Albers USA projection repositions Alaska and Hawaii insets.
 *
 * The GeoJSON is fetched lazily from /us.json (served from public/).
 *
 * @returns An interactive SVG US map with a region dialog overlay.
 */
export const AmericaMap = (): ReactElement => {
  const { legends, regions } = useMapStore();
  const [selected, setSelected] = useState<SelectedRegion | null>(null);

  const legendColors = Object.fromEntries(legends.map((l) => [l.id, l.color]));

  return (
    <>
      <div className="h-full w-full" data-screenshot="us-map">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 900 }}
          style={{ width: "100%", height: "100%" }}
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
