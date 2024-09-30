import  {
    ZoomableGroup,
    Geographies,
    Geography,
} from "react-simple-maps";
import Selector from "../selector/selector";
import {MapProps} from '../../types';
import EventEmitter from 'events';

export default function Map({geoUrl, location}: MapProps) {    
    
    const emitter = new EventEmitter();
    emitter.setMaxListeners(100);

    return (
        <ZoomableGroup onMoveStart={() => emitter.emit("map-click")}>
            <Geographies geography={geoUrl}>
                
                {({ geographies }) =>
                    geographies.map((geo) => (
                        <Selector key={geo.rsmKey} location={location} emitter={emitter} geo={geo}/>
                    ))
                }
            </Geographies>
        </ZoomableGroup>
    );
}