export default function gameroundReducer(state = null, action) {
    if (action.type == "gameround/new") {
        // console.log("step...",action.payload.data);
        state = {
            new: false,
            angle: null ,
            maxId: null ,
            activePlayerId: action.payload.data 
        };
    } else if (action.type == "gameround/start") {
        state = {...state,
            new: true
        };
    } else if (action.type == "gameround/angle") {
        state = {...state,
            angle: action.payload.data 
        };
    } else if (action.type == "gameround/id") {
        state = {...state,
            maxId: action.payload.data 
        };
    }
    return state;
}

//////////////////////// Action Creators //////////////////////////


export function gameround(data) {
    // console.log("action creator step", data);
    return {
        type: "gameround/new",
        payload: { data },
    };
}

export function gamestart() {
    console.log("action creator gamestart");
    return {
        type: "gameround/start",
    };
}

export function bottleAngle(data) {
    console.log("action creator bottleAngle");
    return {
        type: "gameround/angle",
        payload: { data },
    };
}

export function bottleId(data) {
    console.log("action creator bottleAngle");
    return {
        type: "gameround/id",
        payload: { data },
    };
}