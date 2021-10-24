export default function errormsgReducer(state = null, action) {
    if (action.type == "errormsg/errormsg") {
        // console.log("errormsg...",action.payload.data);
        state = action.payload.data;
    }
    return state;
}

//////////////////////// Action Creators //////////////////////////


export function errormsg(data) {
    // console.log("action creator errormsg", data);
    return {
        type: "errormsg/errormsg",
        payload: { data },
    };
}