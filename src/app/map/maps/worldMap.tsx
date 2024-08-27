import {
    ComposableMap,
} from "react-simple-maps";
import Map from '../map';


export default function WorldMap() {  
  return (
    <ComposableMap projection="geoMercator">
      <Map geoUrl={'/worldMap.json'}/>
    </ComposableMap>
  );
}
