const initialState = {
    world: true,
    legends: [{ color: "#02A", name: "Visited" }]
}
  
  // Use the initialState as a default value
export default function appReducer(state = initialState, action) {
  // The reducer normally looks at the action type field to decide what happens
  switch (action.type) {
      // Do something here based on the different types of actions
      case "SWITCH_MAP":
        return {world: !state.world};
      case "ADD_LEGEND":
        console.log(action);
        return {world: state.world, legends: [...state.legends, action.payload]};
      default:
        // If this reducer doesn't recognize the action type, or doesn't
        // care about this specific action, return the existing state unchanged
        return state;
    }
}