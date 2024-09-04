import  {
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import Selector from "../selector/selector";
import { useSelector } from "react-redux";

export default function Map({geoUrl, location}: any) {      
    let geographies = useSelector((state: any) => state.geographies);
    let legends = useSelector((state: any) => state.legends);

    const getFill = (geo: { id: any; }) => {
        let geography = geographies.find((geography: { id: any; }) => geography.id == geo?.id)
        return legends[geography?.legendIndex]?.color ?? "#525666";
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