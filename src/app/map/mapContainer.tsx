import { useSelector } from 'react-redux'
import { useRef } from 'react';
import { useMouse } from '@custom-react-hooks/use-mouse';
import WorldMap from './maps/worldMap';
import AmericaMap from './maps/americaMap';

export default function MapContainer() {
    const containerRef = useRef(null);
    const mousePosition = useMouse(containerRef);
    let world = useSelector((state: any) => state.world)
    return(
        <div ref={containerRef}>
            {world ? <WorldMap location={mousePosition}/> : <AmericaMap location={mousePosition}/>}
        </div>
    );
}