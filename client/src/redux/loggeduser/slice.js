export default function loggeduserReducer(state = null, action) {
    if (action.type == "loggeduser/loggeduser") {
        // console.log("loggeduser...",action.payload.data);
        state = action.payload.data;
    }
    return state;
}

//////////////////////// Action Creators //////////////////////////


export function loggeduser(data) {
    // console.log("action creator loggeduser", data);
    return {
        type: "loggeduser/loggeduser",
        payload: { data },
    };
}