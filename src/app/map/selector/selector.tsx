import { Popover, Radio, Group, Text, Portal} from '@mantine/core';
import { useSelector } from "react-redux"
import { useState } from 'react';


export default function Selector({children, location}: any) {
    const [position, setPosition] = useState({x: 0, y: 0});
    const name = children?.props?.geography?.properties?.name;

    let legends = useSelector((state: any) => state.legends)
    let radioOptions: any[] = [];
    {legends.forEach((legend: any) => {
        radioOptions.push(<Radio key={legend.name} value={legend.name} label={legend.name}/>)
    })}

    const getPosition = () => {
        setPosition({x: location?.x, y: location?.y})
    }
    
    return (
        <Popover width={300} shadow="md" onOpen={getPosition}>
            <Popover.Target>
                {children}
            </Popover.Target>
            <Portal>
                <Popover.Dropdown style={{position: 'absolute', top: position?.y, left: position?.x - 150}}>
                    <Radio.Group
                        name="selector"
                        label={name}
                    >
                        <Group mt="xs">
                            {radioOptions}
                        </Group>
                    </Radio.Group>
                </Popover.Dropdown>
            </Portal>
        </Popover>
    );
}