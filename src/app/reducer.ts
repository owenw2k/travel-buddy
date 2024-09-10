import stateData from '../../public/americaMap.json';
import countryData from '../../public/worldMap.json';
import {Geography, Action, Legend, State} from './types';

let geographies: Array<Geography> = [];
stateData.objects.states.geometries.map((state) => {
  // Removes some erroneous undefined id's
  if(state.id) {
    geographies.push({id: state.id, name: state.properties.name, legendIndex: null});
  }
});
countryData.objects.countries.geometries.map((country) => {
  // Removes some erroneus undefined id's
  if(country.id) {
    geographies.push({id: country.id, name: country.properties.name, legendIndex: null})
  }
});

const initialState: State = {
    world: true,
    legends: [{color: "#02A", name: "Visited" },
              {color: "#fc0330", name: "Driven"},
              {color: "#21942c", name: "Lived"}
    ],
    geographies
}

const updateStatus = (state: State, action: Action) => {
    let changedGeographies = state.geographies.map((geography) => {
      if(geography?.id == action.payload.id) {
        let changedGeography = {id: geography.id, name: geography.name, legendIndex: action.payload.legendIndex}
        return changedGeography;
      }
      return geography
    })
    return {world: state.world, legends: state.legends, geographies: changedGeographies}
}
  
// Use the initialState as a default value
export default function appReducer(state: State = initialState, action: Action) {
  switch (action.type) {
      case "SWITCH_MAP":
        return {world: !state.world, legends: state.legends, geographies: state.geographies};
      case "ADD_LEGEND":
        return {world: state.world, legends: [...state.legends, action.payload], geographies: state.geographies};
      case "UPDATE_STATUS":
        return updateStatus(state, action);
      default:
        // If this reducer doesn't recognize the action type, or doesn't
        // care about this specific action, return the existing state unchanged
        return state;
    }
}