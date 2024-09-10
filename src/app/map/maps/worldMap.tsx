import {
    ComposableMap,
} from "react-simple-maps";
import Map from './map';
import {MapProps} from '../../types';

export default function WorldMap({location}: MapProps) {  
  return (
    <ComposableMap projection="geoMercator">
      <Map geoUrl={'/worldMap.json'} location={location}/>
    </ComposableMap>
  );
}
