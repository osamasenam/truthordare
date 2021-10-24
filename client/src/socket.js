import { io } from "socket.io-client";
import {
    lastTenMessages,
    newMessage,
} from "./redux/messages/slice.js";
import { onlineid } from "./redux/onlineid/slice.js";

export let socket;

export const init = (store) => {
    if (!socket) {
        socket = io.connect();

        socket.on("greeting", (msgs) => {
            console.log(msgs);
        }
        );

        socket.on("online users", (msgs) =>{
            console.log("all currently online users:", msgs);
            store.dispatch(onlineid(msgs));
        }
        );

        socket.on("mostRecentMsgs", (msgs) =>
            store.dispatch(lastTenMessages(msgs))
        );

        socket.on("addChatMsg", (msg) => {
            // console.log(`Got a message in the client!! I'm about to start the whoooole Redux process by dispatching in here!!
            // My message is `,msg);
            // this is where you should dispatch an action to put this message in redux
            store.dispatch(newMessage(msg));
        });

        // socket.on("mostRecentMsgsPrivate", (msgs) =>
        //     store.dispatch(lastTenMessagesPrivate(msgs))
        // );

        // socket.on("chatMessage", (msg) =>
        //     store.dispatch(chatMessageReceived(msg))
        // );

        // socket.on("addChatMsgPrivate", (msg) => {
        //     // console.log(`Got a message in the client!! I'm about to start the whoooole Redux process by dispatching in here!!
        //     // My message is `,msg);
        //     // this is where you should dispatch an action to put this message in redux
        //     store.dispatch(newMessagePrivate(msg));
        // });

    }
};