import {
    ComposableMap,
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import Map from './map';

export default function AmericaMap() {
    return (
        <ComposableMap
            projection='geoAlbersUsa'
            projectionConfig={{ scale: 800 }}
        >
            <Map geoUrl={'/americaMap.json'}/>
        </ComposableMap>
    );
}
