import {
    ComposableMap,
} from "react-simple-maps";
import Map from './map';


export default function WorldMap({location}: any) {  
  return (
    <ComposableMap projection="geoMercator">
      <Map geoUrl={'/worldMap.json'} location={location}/>
    </ComposableMap>
  );
}
