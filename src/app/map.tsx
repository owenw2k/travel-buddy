import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
    Marker
  } from "react-simple-maps";

const geoUrl = '/worldMap.json';

export default function Map() {
  return (
    <div>
      <ComposableMap projection="geoMercator">
        <ZoomableGroup center={[0, 0]} zoom={9}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo} />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
