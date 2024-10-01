import { Popover, Radio, Group, CloseButton, Grid} from '@mantine/core';
import { useSelector, useDispatch } from "react-redux"
import { useState } from 'react';
import { State, SelectorProps } from '../../types';
import {get} from "local-storage";
import { Geography } from 'react-simple-maps';


export default function Selector({ location, emitter, geo}: SelectorProps) {

    const name = geo?.properties?.name;
    const id = geo?.id;
    let legends = useSelector((state: State) => state.legends);
    let localState: State = get('reduxState');
    let legendIndex = localState?.geographies?.find(geography => geography.id == id)?.legendIndex;
    
    const [position, setPosition] = useState({x: 0, y: 0});
    const [value, setValue] = useState<string | null>(legendIndex?.toString() ?? null);
    const [opened, setOpened] = useState(false);
    const dispatch = useDispatch();
   

    const updateStatus = (newValue: string) => {
        if (value != newValue){
            dispatch({type: "UPDATE_STATUS", payload: {id, legendIndex: Number(newValue)}});
            setValue(newValue);
        }
        else {
            dispatch({type: "UPDATE_STATUS", payload: {id, legendIndex: null}});
            setValue(null);
        }
    }

    let radioOptions: JSX.Element[] = [];
    for (let [index, legend] of legends.entries()){
        radioOptions.push(<Radio key={index} value={index.toString()} label={legend.name}/>)
    }

    const getPosition = () => {
        setPosition({x: location?.x, y: location?.y})
    }

    let geographies = useSelector((state: State) => state.geographies);
    let statuses = useSelector((state: State) => state.legends);

    const getFill = (geo: { id: string }) => {
        let geography = geographies?.find((geography) => geography?.id == geo?.id)
        if(geography?.legendIndex || geography?.legendIndex == 0) {
            return statuses[geography?.legendIndex]?.color
        }
        else {
            return "#525666";
        }
    }

    if(opened) {
        emitter.on("map-click", () => {
            setOpened(false);
        });
    }

    return (
        <Popover width={300} shadow="md" onOpen={getPosition} opened={opened}>
            <Popover.Target>
                <Geography
                    key={geo.rsmKey} 
                    geography={geo}  
                    style={{
                        default: { outline: "none"},
                        hover: { outline: "none", fill: "#6f88e8" },
                        pressed: { outline: "none"},
                    }}
                    fill={getFill(geo)}
                    onClick={() => setOpened(!opened)}
                />
            </Popover.Target>
            <Popover.Dropdown style={{position: 'absolute', top: position?.y, left: position?.x - 150}}>
                <Grid>
                    <Grid.Col span={11} pl={5} pr={0}>
                        <Radio.Group
                            name="selector"
                            label={name}
                            value={value}
                            onClick={(e) => updateStatus((e.target as HTMLInputElement)?.value)}
                        >
                            <Group mt="xs">
                                {radioOptions}
                            </Group>
                        </Radio.Group>
                    </Grid.Col>
                    <Grid.Col span={1} p={0}>
                        <CloseButton className='' variant="transparent" onClick={() => setOpened(!opened)} />
                    </Grid.Col>
                </Grid>
            </Popover.Dropdown>
        </Popover>
    );
}