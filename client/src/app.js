// function component
import { BrowserRouter, Route} from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { loggeduser } from "./redux/loggeduser/slice.js";
import { Link } from "react-router-dom";

import Chat from "./chat.js";
import OnlineUsers from "./onlineusers.js";
import Game from "./game.js";

export default function App() {
    const dispatch = useDispatch();

    const profile = useSelector(state => state && state.loggeduser);

    useEffect(() => {
        console.log("App just mounted");

        fetch("/user.json")
            .then(res => res.json())
            .then((data) => {
                // console.log("data:", data);
                dispatch(loggeduser(data));
            })     
            .catch(console.log());
    },[]);

    return (
        <div className="app-container">
            {profile && (
                <div className="profile">
                    <h1>Welcome {profile.first} {profile.last}</h1>
                    <div className="profile-pic">
                        {profile.image? <img src={profile.image}></img> : <img src="/default.jpg"></img>}
                    </div>
                </div>
            )}
            <button><a href="/logout">Logout</a></button>
            <OnlineUsers />
            <Game />
            <Chat />
        </div>
    );
}

