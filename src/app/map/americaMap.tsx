import {
    ComposableMap,
    ZoomableGroup,
    Geographies,
    Geography,
    Marker,
} from "react-simple-maps";

export default function AmericaMap() {

  const geoUrl = '/americaMap.json';
  
  return (
    <div className="map-container">
        <ComposableMap
            projection='geoAlbersUsa'
            projectionConfig={{ scale: 1000 }}
            width={980}
            height={551}
            style={{
                width: "100%",
                height: "auto",
            }}
        >
             <ZoomableGroup center={[ -97, 40 ]} disablePanning>
                <Geographies  geography={geoUrl}>  
                    {({ geographies}) =>
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
                </ Geographies>
             </ZoomableGroup>
        </ComposableMap>
    </div>
  );
}
