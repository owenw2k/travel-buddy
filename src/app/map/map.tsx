import  {
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import { useState } from "react";

export default function Map({geoUrl}: any) {      
    const [clickedStates, setClickedStates] = useState<string[]>([]);

    const handleClick = (geo: { properties: { name: any; }; }) => {
        if(clickedStates.includes(geo.properties.name)) {
            setClickedStates(clickedStates.filter(state => {return state != geo.properties.name}))
        }
        else {
            setClickedStates([...clickedStates, geo.properties.name]);
        }
    }

    return (
        <ZoomableGroup>
            <Geographies geography={geoUrl}>
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
            </Geographies>
        </ZoomableGroup>
    );
}