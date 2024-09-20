import { Popover, Radio, Group} from '@mantine/core';
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from 'react';
import { State, SelectorProps } from '../../types';
import {get} from "local-storage";


export default function Selector({children, location}: SelectorProps) {

    const name = children?.props?.geography?.properties?.name;
    const id = children?.props?.geography?.id;
    let legends = useSelector((state: State) => state.legends);
    let localState: State = get('reduxState');
    let legendIndex = localState.geographies.find(geography => geography.id == id)?.legendIndex;
    
    const [position, setPosition] = useState({x: 0, y: 0});
    const [value, setValue] = useState<string | null>(legendIndex?.toString() ?? null);
    const dispatch = useDispatch();
   

    const updateStatus = (value: string) => {
        dispatch({type: "UPDATE_STATUS", payload: {id, legendIndex: Number(value)}});
        setValue(value);
    }

    let radioOptions: JSX.Element[] = [];
    for (let [index, legend] of legends.entries()){
        radioOptions.push(<Radio key={index} value={index.toString()} label={legend.name}/>)
    }

    const getPosition = () => {
        setPosition({x: location?.x, y: location?.y})
    }

    return (
        <Popover width={300} shadow="md" onOpen={getPosition}>
            <Popover.Target>
                {children}
            </Popover.Target>
            <Popover.Dropdown style={{position: 'absolute', top: position?.y, left: position?.x - 150}}>
                <Radio.Group
                    name="selector"
                    label={name}
                    value={value}
                    onChange={(value: string) => updateStatus(value)}
                >
                    <Group mt="xs">
                        {radioOptions}
                    </Group>
                </Radio.Group>
            </Popover.Dropdown>
        </Popover>
    );
}