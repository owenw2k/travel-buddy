import { Popover, Radio, Group, Text, Portal} from '@mantine/core';
import { useSelector } from "react-redux"


export default function Selector({children, location}: any) {

    let legends = useSelector((state: any) => state.legends)
    let radioOptions: any[] = [];
    {legends.forEach((legend: any) => {
        radioOptions.push(<Radio key={legend.name} value={legend.name} label={legend.name}/>)
    })}
    const locationClick = {x: location?.x, y: location?.y};
    //console.log(locationClick);
    return (
        <Popover width={200} position="bottom" shadow="md">
            <Popover.Target>
                {children}
            </Popover.Target>
            <Portal>
                <Popover.Dropdown style={{position: 'absolute', top: location?.y, left: location?.x - 100}}>
                    <Radio.Group
                        name="selector"
                        label="Select"
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