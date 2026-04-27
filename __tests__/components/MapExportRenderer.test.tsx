import { render, waitFor } from "@testing-library/react";

import {
  MapExportRenderer,
  MapExportView,
  StatsExportView,
  EXPORT_W,
  EXPORT_H,
} from "@/components/MapExportRenderer";
import { useMapStore } from "@/store/mapStore";

import { createLegend } from "../factories/createLegend";
import { createMapState } from "../factories/createMapState";

jest.mock("@/store/mapStore");
jest.mock("react-simple-maps", () => ({
  ComposableMap: ({ children }: { children: React.ReactNode }) => <svg>{children}</svg>,
  Geographies: ({
    children,
  }: {
    children: (arg: { geographies: object[] }) => React.ReactNode;
  }) => <>{children({ geographies: [{ rsmKey: "geo-1", id: "1", properties: {} }] })}</>,
  Geography: ({ style }: { style: { default: { fill: string } } }) => (
    <path data-testid="geography" fill={style.default.fill} />
  ),
}));

const mockUseMapStore = useMapStore as jest.MockedFunction<typeof useMapStore>;

const setupStore = (state = createMapState()) => {
  mockUseMapStore.mockReturnValue({
    ...state,
    setWorld: jest.fn(),
    addLegend: jest.fn(),
    removeLegend: jest.fn(),
    updateLegend: jest.fn(),
    assignRegion: jest.fn(),
    unassignRegion: jest.fn(),
    setRegionNote: jest.fn(),
    clearData: jest.fn(),
    hydrate: jest.fn(),
    importState: jest.fn(),
  } as ReturnType<typeof useMapStore>);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("StatsExportView", () => {
  it("renders at the correct export dimensions", () => {
    setupStore();
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { container } = render(<StatsExportView ref={ref} />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveStyle({ width: `${EXPORT_W}px`, height: `${EXPORT_H}px` });
  });

  it("renders world and US section titles", () => {
    setupStore(createMapState({ legends: [createLegend()] }));
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { getByText } = render(<StatsExportView ref={ref} />);
    expect(getByText("World")).toBeInTheDocument();
    expect(getByText("United States")).toBeInTheDocument();
  });

  it("renders legend category names and counts", () => {
    const legend = createLegend({ name: "Visited" });
    setupStore(
      createMapState({
        legends: [legend],
        regions: { "region-1": { legendId: legend.id, note: "", world: true } },
      })
    );
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { getAllByText } = render(<StatsExportView ref={ref} />);
    expect(getAllByText("Visited").length).toBeGreaterThan(0);
  });
});

describe("MapExportView", () => {
  it("renders at the correct export dimensions", () => {
    setupStore();
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { container } = render(
      <MapExportView
        ref={ref}
        geoUrl="/world.json"
        projection="geoMercator"
        projectionConfig={{ scale: 153 }}
      />
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveStyle({ width: `${EXPORT_W}px`, height: `${EXPORT_H}px` });
  });

  it("renders geography paths for each geo feature", () => {
    setupStore();
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { getAllByTestId } = render(
      <MapExportView
        ref={ref}
        geoUrl="/world.json"
        projection="geoMercator"
        projectionConfig={{ scale: 153 }}
      />
    );
    expect(getAllByTestId("geography").length).toBeGreaterThan(0);
  });

  it("colors assigned regions with their legend color", () => {
    const legend = createLegend({ color: "#ff0000" });
    setupStore(
      createMapState({
        legends: [legend],
        regions: { "1": { legendId: legend.id, note: "" } },
      })
    );
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { getByTestId } = render(
      <MapExportView
        ref={ref}
        geoUrl="/world.json"
        projection="geoMercator"
        projectionConfig={{ scale: 153 }}
      />
    );
    expect(getByTestId("geography")).toHaveAttribute("fill", "#ff0000");
  });

  it("shows the legend overlay when legends exist", () => {
    const legend = createLegend({ name: "Visited" });
    setupStore(createMapState({ legends: [legend] }));
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { getByText } = render(
      <MapExportView
        ref={ref}
        geoUrl="/world.json"
        projection="geoMercator"
        projectionConfig={{ scale: 153 }}
      />
    );
    expect(getByText("Visited")).toBeInTheDocument();
  });

  it("hides the legend overlay when there are no legends", () => {
    setupStore(createMapState({ legends: [] }));
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    const { queryByText } = render(
      <MapExportView
        ref={ref}
        geoUrl="/world.json"
        projection="geoMercator"
        projectionConfig={{ scale: 153 }}
      />
    );
    expect(queryByText("Visited")).not.toBeInTheDocument();
  });
});

describe("MapExportRenderer", () => {
  it("calls onReady with three div refs once maps have path elements", async () => {
    setupStore();
    const onReady = jest.fn();
    render(<MapExportRenderer onReady={onReady} />);
    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1), { timeout: 2000 });
    const refs = onReady.mock.calls[0][0] as {
      stats: HTMLDivElement;
      world: HTMLDivElement;
      us: HTMLDivElement;
    };
    expect(refs.stats).toBeInstanceOf(HTMLDivElement);
    expect(refs.world).toBeInstanceOf(HTMLDivElement);
    expect(refs.us).toBeInstanceOf(HTMLDivElement);
  });

  it("renders the container with aria-hidden", () => {
    setupStore();
    const { container } = render(<MapExportRenderer onReady={jest.fn()} />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("stops polling and does not call onReady if paths never appear", () => {
    jest.useFakeTimers();
    setupStore();
    const onReady = jest.fn();

    jest.spyOn(HTMLElement.prototype, "querySelectorAll").mockReturnValue({
      length: 0,
    } as unknown as NodeListOf<Element>);

    render(<MapExportRenderer onReady={onReady} />);

    // Advance past MAX_ATTEMPTS (80) * 100ms = 8000ms
    jest.advanceTimersByTime(8100);

    expect(onReady).not.toHaveBeenCalled();

    jest.restoreAllMocks();
    jest.useRealTimers();
  });
});
