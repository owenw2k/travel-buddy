import {
    ComposableMap,
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import Map from '../map';

export default function AmericaMap() {
    return (
        <ComposableMap
            projection='geoAlbersUsa'
            height={375}
            projectionConfig={{ scale:700}}
        >
            <Map geoUrl={'/americaMap.json'}/>
        </ComposableMap>
    );
}
