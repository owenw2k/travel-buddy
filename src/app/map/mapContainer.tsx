import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useMouse } from '@custom-react-hooks/use-mouse';
import WorldMap from './maps/worldMap';
import AmericaMap from './maps/americaMap';
import { State, Location } from '../types'

export default function MapContainer() {
    const containerRef = useRef(null);
    const mousePosition: Location = useMouse(containerRef);
    const[world, setWorld] = useState<Boolean>(true);
    const reduxWorld = useSelector((state: State) => state.world);
    useEffect(() => {
        setWorld(reduxWorld);
    }, [reduxWorld]);

    return(
        <div ref={containerRef}>
            {world ? <WorldMap location={mousePosition}/> : <AmericaMap location={mousePosition}/>}
        </div>
    );
}