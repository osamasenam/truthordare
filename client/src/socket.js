import { io } from "socket.io-client";
import {
    lastTenMessages,
    newMessage,
} from "./redux/messages/slice.js";
import { onlineusers } from './redux/onlineusers/slice.js';
import { gameround } from "./redux/gameround/slice.js";
import { bottleAngle } from "./redux/gameround/slice.js";
import { bottleId } from "./redux/gameround/slice.js";
import { gamestart } from "./redux/gameround/slice.js";

export let socket;

export const init = (store) => {
    if (!socket) {
        socket = io.connect();

        socket.on("greeting", (msgs) => {
            console.log(msgs);
        }
        );

        socket.on("online users", (msgs) =>{
            // console.log("all currently online users:", msgs);
            store.dispatch(onlineusers(msgs));
        }
        );

        socket.on("start game", (arg1,arg2) =>{
            store.dispatch(gameround(arg1));
            // store.dispatch(bottleAngle(arg2));
        }
        );

        socket.on("do the spin", (angle,id) =>{
            // console.log("all currently online users:", msgs);
            store.dispatch(bottleAngle(angle));
            store.dispatch(bottleId(id));
            store.dispatch(gamestart());
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



    }
};