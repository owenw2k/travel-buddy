import { useSelector } from 'react-redux'
import WorldMap from './worldMap';
import AmericaMap from './americaMap';

export default function Map() {
    let world = useSelector((state: any) => state.world)
    return(
        <>
            {world ? <WorldMap/> : <AmericaMap/>}
        </>
    );
}