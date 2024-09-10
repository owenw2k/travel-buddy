import {
    ComposableMap,
} from "react-simple-maps";
import Map from './map';
import {MapProps} from '../../types';

export default function AmericaMap({location}: MapProps) {
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
