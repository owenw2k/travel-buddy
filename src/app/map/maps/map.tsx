import  {
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import { useState, useRef } from "react";
import Selector from "../selector/selector";

export default function Map({geoUrl, location}: any) {      
    const [clickedStates, setClickedStates] = useState<string[]>([]);

    const handleClick = () => {
        console.log('hi')
    }

    return (
        <ZoomableGroup>
            <Geographies geography={geoUrl}>
                
                {({ geographies}) =>
                    geographies.map((geo) => (
                        <Selector key={geo.rsmKey} location={location}>
                            <Geography
                                key={geo.rsmKey} 
                                geography={geo}  
                                style={{
                                    default: { outline: "none"},
                                    hover: { outline: "none", fill: clickedStates.includes(geo.properties.name) ? "#02A" : "#6f88e8" },
                                    pressed: { outline: "none"},
                                }}
                                fill={clickedStates.includes(geo.properties.name) ? "#02A" : "#525666"}
                                onClick={handleClick}
                            />
                        </Selector>
                    ))
                }
            </Geographies>
        </ZoomableGroup>
    );
}