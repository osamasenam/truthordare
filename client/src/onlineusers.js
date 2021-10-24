import { useEffect, useRef } from 'react';
import { socket } from './socket';
import { useDispatch, useSelector } from "react-redux";
import { onlineusers } from './redux/onlineusers/slice.js';

export default function OnlineUsers() {
    const dispatch = useDispatch();

    const onlineIds = useSelector(state => state && state.onlineid);
    const onlines = useSelector(state => state && state.onlineusers);

    useEffect(() => {
        let allUsersArr = [];

        if(onlineIds) {
            console.log("online users component has MOUNTED",onlineIds);
            onlineIds.forEach(async function fn(elem) {
                // console.log("elem:", elem);
                const response = await fetch(`/user/${elem}`);
                const userOnline = await response.json();

                // console.log("userOnline",userOnline);
                allUsersArr.push(userOnline);
                
            });
            // console.log("allUsersArr",allUsersArr);
            dispatch(onlineusers(allUsersArr));
    };
       
    }, [onlineIds]);

    return (
        <div className="online-users">
            <h2>Online Users:</h2>
            <div className="container">
                {!onlines && <h1>tryyyy</h1>}
                {onlines && onlines.map((user, i) => (
                    <div key={i}>
                        <p >{user.first}</p>
                        <div>
                            <img src={user.image} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}