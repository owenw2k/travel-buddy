import { Popover, Radio, Group} from '@mantine/core';
import { useSelector, useDispatch } from "react-redux"
import { useState, useEffect } from 'react';


export default function Selector({children, location}: any) {
    
    const [position, setPosition] = useState({x: 0, y: 0});
    const [value, setValue] = useState(null);
    const dispatch = useDispatch();
    const name = children?.props?.geography?.properties?.name;
    const id = children?.props?.geography?.id;

    const updateStatus = (value: any) => {
        dispatch({type: "UPDATE_STATUS", payload: {id, legendIndex: value}});
        setValue(value);
    }

    let legends = useSelector((state: any) => state.legends)
    let radioOptions: any[] = [];
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