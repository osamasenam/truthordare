export default function stepReducer(state = null, action) {
    if (action.type == "step/step") {
        // console.log("step...",action.payload.data);
        state = action.payload.data;
    }
    return state;
}

//////////////////////// Action Creators //////////////////////////


export function step(data) {
    // console.log("action creator step", data);
    return {
        type: "step/step",
        payload: { data },
    };
}