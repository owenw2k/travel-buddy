"use client";

/**
 * Modal showing per-legend region counts and donut charts, split between
 * the world map and the US states map.
 */

import { BarChart2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMapStore } from "@/store/mapStore";

import type { Legend, RegionEntry } from "@/types";
import type { ReactElement } from "react";

// ─── Donut chart ─────────────────────────────────────────────────────────────

/** One arc segment in the donut chart. */
type DonutSegment = {
  /** Display name of the legend category. */
  name: string;
  /** CSS hex color for the arc. */
  color: string;
  /** Number of regions assigned to this category. */
  count: number;
};

/** Props for DonutChart. */
type DonutChartProps = {
  /** All legend categories with their counts for this map section. */
  segments: DonutSegment[];
  /** Total assigned regions in this section. */
  total: number;
};

/** Outer radius of the donut ring (SVG units). */
const OUTER_R = 52;
/** Inner radius of the donut hole (SVG units). */
const INNER_R = 34;
/** Side length of the square SVG canvas. */
const CHART_SIZE = 120;
/** Center of the SVG canvas. */
const CX = CHART_SIZE / 2;
const CY = CHART_SIZE / 2;

/**
 * Converts an angle and radius to a Cartesian point on the chart.
 *
 * @param angle - Angle in radians, measured from the positive x-axis.
 * @param r - Radius from the chart center.
 * @returns x/y coordinates relative to the SVG origin.
 */
const polar = (angle: number, r: number): { x: number; y: number } => ({
  x: CX + r * Math.cos(angle),
  y: CY + r * Math.sin(angle),
});

/**
 * Builds the SVG `d` attribute for a donut arc between two angles.
 *
 * @param startAngle - Start angle in radians.
 * @param endAngle - End angle in radians.
 * @returns SVG path string for the arc segment.
 */
const buildArcPath = (startAngle: number, endAngle: number): string => {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const o1 = polar(startAngle, OUTER_R);
  const o2 = polar(endAngle, OUTER_R);
  const i2 = polar(endAngle, INNER_R);
  const i1 = polar(startAngle, INNER_R);
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${i1.x} ${i1.y}`,
    "Z",
  ].join(" ");
};

/**
 * SVG donut chart with a hoverable legend breakdown and total in the center.
 *
 * Hovering an arc segment dims the others and shows the hovered category's
 * name and count in the center hole. When nothing is hovered, the center
 * shows the total assigned count for this map section.
 *
 * @param props - Segment data and total count.
 * @returns An inline SVG donut chart.
 */
const DonutChart = ({ segments, total }: DonutChartProps): ReactElement => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeSegments = segments.filter((s) => s.count > 0);

  let currentAngle = -Math.PI / 2;
  const arcs = activeSegments.map((seg, i) => {
    const sweep = (seg.count / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    // Clamp slightly under 2π to keep the path valid when one segment fills the ring.
    const endAngle = currentAngle + Math.min(sweep, 2 * Math.PI - 0.001);
    currentAngle += sweep;
    return { ...seg, path: buildArcPath(startAngle, endAngle), index: i };
  });

  const hovered = hoveredIndex !== null ? arcs[hoveredIndex] : null;

  return (
    <svg
      width={CHART_SIZE}
      height={CHART_SIZE}
      viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
      role="img"
      aria-label={`${total} regions assigned`}
    >
      {total === 0 ? (
        <circle cx={CX} cy={CY} r={OUTER_R} fill="var(--muted)" opacity={0.35} />
      ) : (
        arcs.map((arc) => (
          <path
            key={arc.index}
            d={arc.path}
            fill={arc.color}
            style={{
              opacity: hoveredIndex === null || hoveredIndex === arc.index ? 1 : 0.35,
              transition: "opacity 150ms",
            }}
            onMouseEnter={() => setHoveredIndex(arc.index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          />
        ))
      )}
      <circle cx={CX} cy={CY} r={INNER_R} fill="var(--card)" />
      <text
        x={CX}
        y={CY - 4}
        textAnchor="middle"
        style={{
          fontSize: "18px",
          fontWeight: "700",
          fill: "var(--foreground)",
          fontFamily: "var(--font-heading)",
        }}
      >
        {hovered?.count ?? total}
      </text>
      <text
        x={CX}
        y={CY + 13}
        textAnchor="middle"
        style={{
          fontSize: "10px",
          fill: "var(--muted-foreground)",
          fontFamily: "var(--font-heading)",
        }}
      >
        {hovered?.name ?? "total"}
      </text>
    </svg>
  );
};

// ─── Map section ─────────────────────────────────────────────────────────────

/** Total number of UN-recognized sovereign states tracked in the world map. */
const WORLD_TOTAL = 195;

/** Total number of US states tracked in the US map. */
const US_TOTAL = 50;

/** Props for MapSection. */
type MapSectionProps = {
  /** Primary label for the section, e.g. "World". */
  title: string;
  /** Secondary label shown below the title, e.g. "Countries". */
  subtitle: string;
  /** All legend categories. */
  legends: Legend[];
  /** Region entries already filtered to this map type. */
  entries: RegionEntry[];
  /** Total possible regions in this map, used to render the progress bar. */
  mapTotal: number;
  /** testid applied to the section root for scoped test queries. */
  testId: string;
};

/**
 * One column in the stats modal — a donut chart and progress bar for one map
 * (world or US).
 *
 * Hovering an arc shows that category's count in the donut center. The slim
 * progress bar below the title shows how many regions have been marked out of
 * the total possible for this map.
 *
 * @param props - Section labels, legends, filtered region entries, and map total.
 * @returns A section with a donut chart, title, and progress bar.
 */
const MapSection = ({
  title,
  subtitle,
  legends,
  entries,
  mapTotal,
  testId,
}: MapSectionProps): ReactElement => {
  const countsByLegend: Record<string, number> = Object.fromEntries(legends.map((l) => [l.id, 0]));
  for (const entry of entries) {
    if (entry.legendId in countsByLegend) {
      countsByLegend[entry.legendId]++;
    }
  }

  const total = entries.length;
  const segments: DonutSegment[] = legends.map((l) => ({
    name: l.name,
    color: l.color,
    count: countsByLegend[l.id],
  }));

  const progressPct = Math.min(100, (total / mapTotal) * 100);

  return (
    <div className="flex flex-1 flex-col items-center gap-3" data-testid={testId}>
      <DonutChart segments={segments} total={total} />
      <div className="w-full space-y-1.5 text-center">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-foreground/10"
          role="progressbar"
          aria-valuenow={total}
          aria-valuemin={0}
          aria-valuemax={mapTotal}
          aria-label={`${total} of ${mapTotal} ${subtitle.toLowerCase()} marked`}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          {total} / {mapTotal}
        </p>
      </div>
    </div>
  );
};

// ─── StatsModal ───────────────────────────────────────────────────────────────

/**
 * Header button that opens a stats modal breaking down how many regions have
 * been assigned to each legend category, split between the world map and the
 * US states map. Each section displays a hoverable donut chart with the total
 * in the center.
 *
 * Reads directly from the Zustand store — no props needed. Region entries
 * without a `world` field (saved before this field was introduced) are treated
 * as world-map entries.
 *
 * @returns A ghost icon button that opens the stats dialog when clicked.
 */
export const StatsModal = (): ReactElement => {
  const { legends, regions } = useMapStore();
  const [open, setOpen] = useState(false);

  const assignedEntries = Object.values(regions).filter((r) => r.legendId);
  const total = assignedEntries.length;

  // Entries without a `world` field default to the world map (backwards compat).
  const worldEntries = assignedEntries.filter((r) => r.world !== false);
  const usEntries = assignedEntries.filter((r) => r.world === false);

  const totalLabel =
    total === 0 ? "No regions marked yet." : `${total} region${total === 1 ? "" : "s"} marked`;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        aria-label="View stats"
        onClick={() => setOpen(true)}
      >
        <BarChart2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Your Travels</DialogTitle>
            <DialogDescription>{totalLabel}</DialogDescription>
          </DialogHeader>
          {legends.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No legend categories yet. Add some in the legend panel.
            </p>
          ) : (
            <div className="flex gap-6 pt-1">
              <MapSection
                title="World"
                subtitle="Countries"
                legends={legends}
                entries={worldEntries}
                mapTotal={WORLD_TOTAL}
                testId="stats-world"
              />
              <MapSection
                title="United States"
                subtitle="States"
                legends={legends}
                entries={usEntries}
                mapTotal={US_TOTAL}
                testId="stats-us"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
