import stateData from '../../public/americaMap.json';
import countryData from '../../public/worldMap.json';

let geographies = []
stateData.objects.states.geometries.map((state) => {
  geographies.push({id: state.id, name: state.properties.name, legendIndex: null})
})
countryData.objects.countries.geometries.map((country) => {
  geographies.push({id: country.id, name: country.properties.name, legendIndex: null})
})

const initialState = {
    world: true,
    legends: [{color: "#02A", name: "Visited" },
              {color: "#fc0330", name: "Driven"},
              {color: "#21942c", name: "Lived"}
    ],
    geographies
}
  
// Use the initialState as a default value
export default function appReducer(state = initialState, action) {
  // The reducer normally looks at the action type field to decide what happens
  switch (action.type) {
      // Do something here based on the different types of actions
      case "SWITCH_MAP":
        return {world: !state.world, legends: state.legends, geographies: state.geographies};
      case "ADD_LEGEND":
        return {world: state.world, legends: [...state.legends, action.payload], geographies: state.geographies};
      case "SET_LEGEND":
        let changedGeographies = [...state.geographies];
        changedGeographies.find(geography => geography.id == action.payload.id).legendIndex = action.payload.legendIndex;
        return {world: state.world, legends: state.legends, geographies: changedGeographies}
      default:
        // If this reducer doesn't recognize the action type, or doesn't
        // care about this specific action, return the existing state unchanged
        return state;
    }
}