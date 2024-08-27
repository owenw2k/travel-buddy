import {
    ComposableMap,
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import { SetStateAction, useState } from "react";

export default function AmericaMap() {
    const [clickedStates, setClickedState] = useState<string[]>([]);
    const geoUrl = '/americaMap.json';

    const handleClick = (geo: { properties: { name: any; }; }) => {
        setClickedState([...clickedStates, geo.properties.name]);
    }
  
    return (
        <div className="map-container">
            <ComposableMap
                projection='geoAlbersUsa'
                projectionConfig={{ scale: 800 }}
                width={980}
                height={551}
                style={{
                    width: "100%",
                    height: "auto",
                }}
            >
                <ZoomableGroup center={[ -97, 40 ]}>
                    <Geographies  geography={geoUrl}>  
                        {({ geographies}) =>
                            geographies.map((geo) => (
                                <Geography 
                                    key={geo.rsmKey} 
                                    geography={geo}  
                                    style={{
                                        default: { outline: "none"},
                                        hover: { outline: "none", fill: "#6f88e8" },
                                        pressed: { outline: "none"},
                                    }}
                                    fill={clickedStates.includes(geo.properties.name) ? "#02A" : "#525666"}
                                    onClick={() => handleClick(geo)}
                                />
                            ))
                        }
                    </ Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
}
