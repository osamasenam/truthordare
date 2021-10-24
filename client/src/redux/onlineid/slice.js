export default function onlineidReducer(state = null, action) {
    if (action.type == "onlineid/onlineid") {
        // console.log("loggeduser...",action.payload.data);
        state = action.payload.data;
    }
    return state;
}

//////////////////////// Action Creators //////////////////////////


export function onlineid(data) {
    // console.log("action creator loggeduser", data);
    return {
        type: "onlineid/onlineid",
        payload: { data },
    };
}