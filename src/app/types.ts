
export type Geography = {
    id: string,
    name: string,
    legendIndex: number | null
};
  
export type Action = {
    type: string,
    payload: any
}

export type Legend = {
    color: string,
    name: string
  }
  
export type State = {
    world: boolean,
    legends: Array<Legend>,
    geographies: Array<Geography>
};

export type Location = {
    x: number,
    y: number,
    position: string
}

export type MapProps = {
    geoUrl?: string,
    location: Location
};

export type SelectorProps = {
    children: JSX.Element,
    location: Location
}
  