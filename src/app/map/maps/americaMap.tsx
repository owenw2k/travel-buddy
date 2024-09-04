import {
    ComposableMap,
} from "react-simple-maps";
import Map from './map';

export default function AmericaMap({location}: any) {
    return (
        <ComposableMap
            projection='geoAlbersUsa'
            height={350}
            projectionConfig={{ scale:700}}
        >
            <Map geoUrl={'/americaMap.json'} location={location}/>
        </ComposableMap>
    );
}
