import { useSelector } from 'react-redux'
import WorldMap from './maps/worldMap';
import AmericaMap from './maps/americaMap';

export default function MapContainer() {
    let world = useSelector((state: any) => state.world)
    return(
        <>
            {world ? <WorldMap/> : <AmericaMap/>}
        </>
    );
}