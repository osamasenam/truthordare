import { useEffect, useRef } from 'react';
import { socket } from './socket';
import { useDispatch, useSelector } from "react-redux";

export default function OnlineUsers() {
    const dispatch = useDispatch();

    const onlines = useSelector(state => {
        return state && state.onlineusers;
    });

    useEffect(() => {
        console.log("online users component has MOUNTED");       
    }, []);

    return (
        <div className="online-users">
            <h2>Online Users:</h2>
            <div className="container">
                {onlines && onlines.map((user, i) => {
                    return(
                        <div key={i}>
                            <p >{user.first}</p>
                            <div>
                                <img src={user.image} />
                            </div>
                        </div>
                    );
                }
                    
                )}
            </div>
        </div>
    );
}