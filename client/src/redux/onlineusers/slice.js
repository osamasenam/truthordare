export default function onlineusersReducer(state = null, action) {
    if (action.type == "onlineusers/onlineusers") {
        // console.log("loggeduser...",action.payload.data);
        state = action.payload.data;
    }
    return state;
}

//////////////////////// Action Creators //////////////////////////


export function onlineusers(data) {
    // console.log("action creator loggeduser", data);
    return {
        type: "onlineusers/onlineusers",
        payload: { data },
    };
}