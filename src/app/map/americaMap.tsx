import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup
  } from "react-simple-maps";


export default function AmericaMap() {

  const geoUrl = '/americaMap.json';
  
  return (
    <div>
      <ComposableMap projection="geoMercator">
        <ZoomableGroup center={[0, 0]} zoom={9}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography 
                  key={geo.rsmKey} 
                  geography={geo}  
                  style={{
                    default: { outline: "none", fill: "#525666" },
                    hover: { outline: "none", fill: "#6f88e8" },
                    pressed: { outline: "none", fill: "#02A" },
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
