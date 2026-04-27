"use client";

/**
 * Off-screen components used exclusively for image export.
 *
 * All three views render at 1200x675 (16:9) hidden outside the viewport.
 * The parent mounts this tree when the user requests image download, waits
 * for the maps to finish rendering their SVG paths, then captures each view
 * with html-to-image before unmounting.
 */

import { useEffect, useRef } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { useMapStore } from "@/store/mapStore";

import type { Legend, RegionEntry } from "@/types";
import type { ReactElement, RefObject } from "react";

export const EXPORT_W = 1200;
export const EXPORT_H = 675;

const WORLD_TOTAL = 195;
const US_TOTAL = 50;

// ─── Stats export view ────────────────────────────────────────────────────────

type StatsSectionProps = {
  /** Section heading, e.g. "World". */
  title: string;
  /** Sub-label, e.g. "Countries". */
  subtitle: string;
  /** All legend categories. */
  legends: Legend[];
  /** Region entries filtered to this map type. */
  entries: RegionEntry[];
  /** Maximum possible regions for the progress bar. */
  mapTotal: number;
};

/**
 * One column of the stats export view showing counts per legend category
 * and a progress bar.
 *
 * @param props - Section data.
 * @returns A styled column for the stats image.
 */
const StatsSection = ({
  title,
  subtitle,
  legends,
  entries,
  mapTotal,
}: StatsSectionProps): ReactElement => {
  const countsByLegend: Record<string, number> = Object.fromEntries(legends.map((l) => [l.id, 0]));
  for (const entry of entries) {
    if (entry.legendId in countsByLegend) {
      countsByLegend[entry.legendId]++;
    }
  }
  const total = entries.length;
  const pct = Math.min(100, (total / mapTotal) * 100);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <p className="font-heading text-3xl font-bold text-foreground">{title}</p>
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-foreground/10">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="tabular-nums text-muted-foreground">
          {total} / {mapTotal}
        </p>
      </div>
      <div className="space-y-3">
        {legends.map((l) => (
          <div key={l.id} className="flex items-center gap-3">
            <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: l.color }} />
            <span className="flex-1 text-foreground">{l.name}</span>
            <span className="tabular-nums font-semibold text-foreground">
              {countsByLegend[l.id]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Stats card view rendered off-screen for image export.
 *
 * @param ref - Ref forwarded to the root div for html-to-image capture.
 * @returns A 1200x675 stats card.
 */
export const StatsExportView = ({
  ref,
}: {
  ref: RefObject<HTMLDivElement | null>;
}): ReactElement => {
  const { legends, regions } = useMapStore();

  const assigned = Object.values(regions).filter((r) => r.legendId);
  const worldEntries = assigned.filter((r) => r.world !== false);
  const usEntries = assigned.filter((r) => r.world === false);

  return (
    <div
      ref={ref}
      className="bg-surface"
      style={{ width: EXPORT_W, height: EXPORT_H, padding: 72, boxSizing: "border-box" }}
    >
      <div className="mb-10">
        <p className="font-heading text-4xl font-bold text-foreground">Travel Buddy</p>
        <p className="mt-1 text-xl text-muted-foreground">Your Travels</p>
      </div>
      <div className="flex gap-16">
        <StatsSection
          title="World"
          subtitle="Countries"
          legends={legends}
          entries={worldEntries}
          mapTotal={WORLD_TOTAL}
        />
        <div className="w-px bg-border" />
        <StatsSection
          title="United States"
          subtitle="States"
          legends={legends}
          entries={usEntries}
          mapTotal={US_TOTAL}
        />
      </div>
    </div>
  );
};

// ─── Map export view ──────────────────────────────────────────────────────────

type MapExportViewProps = {
  /** Public path to the GeoJSON file. */
  geoUrl: string;
  /** react-simple-maps projection name. */
  projection: string;
  /** Projection scale config. */
  projectionConfig: { scale: number };
  /** Forwarded ref for capture. */
  ref: RefObject<HTMLDivElement | null>;
};

/**
 * Simplified non-interactive map rendered off-screen for image export.
 * Regions are colored by their legend assignment. Legend is overlaid
 * at the bottom-left corner.
 *
 * @param props - GeoJSON URL, projection, and capture ref.
 * @returns A 1200x675 map with a legend overlay.
 */
export const MapExportView = ({
  geoUrl,
  projection,
  projectionConfig,
  ref,
}: MapExportViewProps): ReactElement => {
  const { legends, regions } = useMapStore();
  const legendColors = Object.fromEntries(legends.map((l) => [l.id, l.color]));

  return (
    <div
      ref={ref}
      className="relative"
      style={{
        width: EXPORT_W,
        height: EXPORT_H,
        backgroundColor: "var(--map-ocean)",
      }}
    >
      <ComposableMap
        projection={projection}
        projectionConfig={projectionConfig}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const entry = regions[String(geo.id)];
              const fill = entry?.legendId
                ? (legendColors[entry.legendId] ?? "var(--map-land)")
                : "var(--map-land)";
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill,
                      stroke: "var(--map-border)",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: { fill, stroke: "var(--map-border)", strokeWidth: 0.5, outline: "none" },
                    pressed: {
                      fill,
                      stroke: "var(--map-border)",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {legends.length > 0 && (
        <div
          className="absolute bottom-5 left-5 rounded-xl border border-border/60 px-4 py-3"
          style={{ backgroundColor: "var(--surface)", opacity: 0.92 }}
        >
          <div className="flex flex-col gap-2">
            {legends.map((l) => (
              <div key={l.id} className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-sm font-medium text-foreground">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Combined renderer ────────────────────────────────────────────────────────

type MapExportRendererProps = {
  /** Called once both maps have fully rendered their SVG paths. */
  onReady: (refs: { stats: HTMLDivElement; world: HTMLDivElement; us: HTMLDivElement }) => void;
};

/**
 * Mounts all three export views off-screen and fires `onReady` once both
 * react-simple-maps instances have rendered their SVG path elements.
 *
 * Poll interval is 100ms; gives up after 8 seconds.
 *
 * @param props - onReady callback receiving refs to all three views.
 * @returns A visually hidden container with all three export views.
 */
export const MapExportRenderer = ({ onReady }: MapExportRendererProps): ReactElement => {
  const statsRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const usRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 80;

    const check = () => {
      const worldPaths = worldRef.current?.querySelectorAll("path").length ?? 0;
      const usPaths = usRef.current?.querySelectorAll("path").length ?? 0;

      if (worldPaths > 0 && usPaths > 0 && statsRef.current && worldRef.current && usRef.current) {
        onReady({
          stats: statsRef.current,
          world: worldRef.current,
          us: usRef.current,
        });
        return;
      }

      attempts++;
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(check, 100);
      }
    };

    check();
  }, [onReady]);

  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", top: -9999, left: -9999, pointerEvents: "none" }}
    >
      <StatsExportView ref={statsRef} />
      <MapExportView
        ref={worldRef}
        geoUrl="/world.json"
        projection="geoMercator"
        projectionConfig={{ scale: 153 }}
      />
      <MapExportView
        ref={usRef}
        geoUrl="/us.json"
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
      />
    </div>
  );
};
