import  {
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import Selector from "../selector/selector";
import { useSelector } from "react-redux";
import { State } from "../../types";
import {MapProps} from '../../types';

export default function Map({geoUrl, location}: MapProps) {      
    let geographies = useSelector((state: State) => state.geographies);
    let statuses = useSelector((state: State) => state.legends);

    const getFill = (geo: { id: string }) => {
        let geography = geographies.find((geography) => geography?.id == geo?.id)
        if(geography?.legendIndex || geography?.legendIndex == 0) {
            return statuses[geography?.legendIndex]?.color
        }
        else {
            return "#525666";
        }
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
                                    hover: { outline: "none", fill: "#6f88e8" },
                                    pressed: { outline: "none"},
                                }}
                                fill={getFill(geo)}
                            />
                        </Selector>
                    ))
                }
            </Geographies>
        </ZoomableGroup>
    );
}