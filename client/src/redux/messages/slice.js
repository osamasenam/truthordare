export default function messagesReducer(state = null, action) {
    if (action.type == "messages/lastTenMessages") {
        console.log("adding last Ten Messages...");
        state = action.payload.dbMessages;
    } 
    else if (action.type == "messages/newMessage") {
        console.log("adding a new msg...");
        state = [...state,action.payload.dbMessage];
    } 
    else if (action.type == "messages/lastTenMessagesPrivate") {
        console.log("adding last Ten Private Messages...");
        state = [...state,action.payload.dbMessagesPrivate];
    } 
    else if (action.type == "messages/newMessagePrivate") {
        console.log("adding a new Private msg...");
        state = [...state,action.payload.dbMessagePrivate];
    } 
    return state;
}

//////////////////////// Action Creators //////////////////////////

export function lastTenMessages(dbMessages) {
    // console.log("action creator lastTenMessages", dbMessages);
    return {
        type: "messages/lastTenMessages",
        payload: { dbMessages },
    };
}

export function newMessage(dbMessage) {
    // console.log("action creator newMessage", dbMessage);
    return {
        type: "messages/newMessage",
        payload: { dbMessage },
    };
}

export function lastTenMessagesPrivate(dbMessagesPrivate) {
    // console.log("action creator lastTenMessages", dbMessages);
    return {
        type: "messages/lastTenMessagesPrivate",
        payload: { dbMessagesPrivate },
    };
}

export function newMessagePrivate(dbMessagePrivate) {
    // console.log("action creator newMessage", dbMessage);
    return {
        type: "messages/newMessagePrivate",
        payload: { dbMessagePrivate },
    };
}