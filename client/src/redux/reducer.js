import { combineReducers } from "redux";
import errormsgReducer from "./errormsg/slice.js";
import loggeduserReducer from "./loggeduser/slice.js";
import stepReducer from "./step/slice.js";
import messagesReducer from "./messages/slice.js";
import onlineidReducer from "./onlineid/slice.js";
import onlineusersReducer from "./onlineusers/slice.js";

const rootReducer = combineReducers({
    errormsg: errormsgReducer,
    loggeduser: loggeduserReducer,
    step: stepReducer,
    messages: messagesReducer,
    onlineid: onlineidReducer,
    onlineusers: onlineusersReducer
});

export default rootReducer;