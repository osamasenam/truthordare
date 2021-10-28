import { useEffect, useRef } from 'react';
import { socket } from './socket';
import { useSelector } from 'react-redux';

export default function Chat() {
    const elemRef = useRef();
    const chatMessages = useSelector(state => state && state.messages);

    const currentRoundStep = useSelector(state => {
        return state && state.gameround && state.gameround.step;
    });

    const currentVictim = useSelector(state => {
        return state && state.gameround && state.gameround.victim;
    });

    const activePlayer = useSelector(state => {
        return state && state.gameround && state.gameround.activePlayerId;
    });

    // this will be undefined for you right now!
    // you'll have to run your chat sql file, do your inserts, write your query and your action creator, work with your reducer and ADD it to the global state so that thennnn you can retrieve/see them!
    // console.log('here are my last 10 chat messages: ', chatMessages);

    // you'll want to run this useEffect everytime we get a newChatMsg
    useEffect(() => {
        console.log("chat hooks component has MOUNTED");
        // console.log("elem Ref is ==> ", elemRef);

        // console.log("scroll top: ", elemRef.current.scrollTop);
        // console.log("clientHeight: ", elemRef.current.clientHeight);
        // console.log("scrollHeight: ", elemRef.current.scrollHeight);

        elemRef.current.scrollTop =
            elemRef.current.scrollHeight - elemRef.current.clientHeight;
    }, [chatMessages]);

    const keyCheck = e => {
        if (e.key === 'Enter') {
            e.preventDefault(); // this will prevent going to the next line
            socket.emit('my new chat message', e.target.value, currentRoundStep, currentVictim, activePlayer);
            e.target.value = ""; // clears input field after we click enter
        }
    };

    return (
        <div className="chat">
            <h2 className='chat-title'>Truth & Dare Chat Box</h2>
            <div className='chat-messages-container' ref={elemRef}>
                {chatMessages && chatMessages.map((msg, i) => (
                    <div key={i}>
                        {msg.image? <img src={msg.image}></img> : <img src="/default.jpg"></img>}
                        <p > {msg.first} {msg.last}: {msg.message}</p>
                    </div>  
                ))}
            </div>
            <textarea placeholder='Add your message here' onKeyDown={keyCheck}></textarea>
        </div>
    );
}