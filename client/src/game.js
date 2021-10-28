import { useEffect, useRef } from 'react';
import { socket } from './socket';
import { useDispatch, useSelector } from "react-redux";
import { gamestart } from "./redux/gameround/slice.js";
import { getVictim } from "./redux/gameround/slice.js";
import { updateStep } from "./redux/gameround/slice.js";

export default function Game() {

    const dispatch = useDispatch();

    const canvasRef = useRef(); 

    // inialize new game
    let startFlag = false;
    let spinClicked = false;
    let newRoundClicked = false;
    let victim; // the player whom the spinning bottle points to

    // contact with the server to get which player's turn is now 

    
    const onlines = useSelector(state => {
        return state && state.onlineusers;
    });

    const activePlayer = useSelector(state => {
        return state && state.gameround && state.gameround.activePlayerId;
    });

    const newRound = useSelector(state => {
        return state && state.gameround && state.gameround.new;
    });
    

    const angleServer = useSelector(state => {
        return state && state.gameround && state.gameround.angle;
    });

    const idServer = useSelector(state => {
        return state && state.gameround && state.gameround.maxId;
    });

    const loggedPlayer = useSelector(state => {
        return state && state.loggeduser;
    });

    const currentRoundStep = useSelector(state => {
        return state && state.gameround && state.gameround.step;
    });

    const currentVictim = useSelector(state => {
        return state && state.gameround && state.gameround.victim;
    });

    
    useEffect( () => {
        console.log("Game component has MOUNTED"); 

        if(angleServer && newRound && onlines && onlines.length == 5) {
            console.log("startFlag",startFlag);

            let img1, img2, img3, img4;
            // define which images will be used in the canvas
            if(onlines.length > 1) {
                img1 = onlines[1].image? onlines[1].image : '/default.jpg';
            }
            if(onlines.length > 2) {
                img2 = onlines[2].image? onlines[2].image : '/default.jpg';
            }
            if(onlines.length > 3) {
                img3 = onlines[3].image? onlines[3].image : '/default.jpg';
            }
            if(onlines.length > 4) {
                img4 = onlines[4].image? onlines[4].image : '/default.jpg';
            }
            const img5 = '/bottle.png';
        
            let images = [img1,img2,img3,img4, img5];
            let loadedImages = {};
            let promiseArray = images.map(function(imgurl){
                let prom = new Promise(function(resolve,reject){
                    let img = new Image();
                    img.onload = function(){
                        loadedImages[imgurl] = img;
                        // the promise is resolved when the image is loaded successfully 
                        resolve();
                    };
                    img.src = imgurl;
                });
                return prom;
            });

            // start drawing the canvas only after all images are successfully loaded
            Promise.all(promiseArray).then(imagesLoaded);

            function imagesLoaded(){
                //start canvas work
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                // define the font used for text 
                ctx.font = 'normal 30px Arial';
                // define the radius for the circle
                const radius = canvas.width / 4;

                console.log("clearRect run");
                ctx.clearRect(0,  0, canvas.width, canvas.height);

                // the bottle dimensions 
                const bottleW = 150;
                const bottleL = radius/2;

                // draw circle centered at the canvas center
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
                ctx.lineWidth = 10;
                ctx.strokeStyle = 'red';
                ctx.stroke();

                // // draw the center point
                // ctx.beginPath();
                // ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
                // ctx.lineWidth = 3;
                // ctx.fillStyle = '#353535';
                // ctx.strokeStyle = '#0C3D4A';
                // ctx.stroke();

                
                let cornersArr = [];
                // draw a pointer small line on the circle for each online player
                for (let i = 0; i < 4; i++) {
                    const angle = i * (Math.PI * 2) / 4;       
                    ctx.lineWidth = 1;            
                    ctx.beginPath();

                    let x1 = (canvas.width / 2) + Math.cos(angle) * (radius);
                    let y1 = (canvas.height / 2) + Math.sin(angle) * (radius);
                    let x2 = (canvas.width / 2) + Math.cos(angle) * (radius - (radius / 10));
                    let y2 = (canvas.height / 2) + Math.sin(angle) * (radius - (radius / 10));

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = 'black';
                    ctx.stroke();

                    cornersArr.push(x1);
                    cornersArr.push(y1);

                }

                // insert the player's image & name
                const imgW = 50; // image width/length

                if(onlines[1]) {
                    ctx.drawImage(loadedImages[img1], cornersArr[0]-imgW/2, cornersArr[1]-imgW/2, imgW, imgW);
                    ctx.fillText(onlines[1].first, cornersArr[0]-imgW/2, cornersArr[1]-imgW/2);
                }
                if(onlines[2]) {
                    ctx.drawImage(loadedImages[img2], cornersArr[2]-imgW/2, cornersArr[3]-imgW/2, imgW, imgW);
                    ctx.fillText(onlines[2].first, cornersArr[2]-imgW/2, cornersArr[3]-imgW/2);
                }
                if(onlines[3]) {
                    ctx.drawImage(loadedImages[img3], cornersArr[4]-imgW/2, cornersArr[5]-imgW/2, imgW, imgW);
                    ctx.fillText(onlines[3].first, cornersArr[4]-imgW/2, cornersArr[5]-imgW/2);
                }
                if(onlines[4]) {
                    ctx.drawImage(loadedImages[img4], cornersArr[6]-imgW/2, cornersArr[7]-imgW/2, imgW, imgW);
                    ctx.fillText(onlines[4].first, cornersArr[6]-imgW/2, cornersArr[7]-imgW/2);
                }

                // the spinning bottle draw & animation
                console.log("angle from the server:",angleServer);
                // let angle = Math.floor(Math.random() * 360); // random start position each time the bottle spins
                let angle = angleServer;
                let inc = 1; // the increment for bottle roation angle each animation frame
                let fps = 15; // animation frames per second
                let idManual=0; // the current animation frame id
                // let maxId = Math.floor(Math.random() * (100 - 50 + 1) + 50); // random motion duration each time
                let maxId = idServer;
                let endMove = false; // the flag to stop bottle animation 
                // animation function
                function draw() {
                    // the draw function renders the defined number of times per second
                    setTimeout(function() {
                        // make sure to exit before a new requestAnimationFrame is done since it calls the draw() function again
                        if(endMove) {

                            console.log("idManual", idManual);
                            // cancelAnimationFrame(id);
                            console.log("angle", angle);
                            console.log("victim", victim);
                            dispatch(getVictim(victim));
                            // dispatch(updateStep());
                            socket.emit('next step',currentRoundStep, victim);
                            idManual=0;
                            return;
                        }
                        // we need to make sure the bottle points to any of the players when it stops
                        if(idManual > maxId && angle>=270) {
                            angle = 270;
                            endMove = true;
                            victim = onlines[3];
                        } else if(idManual > maxId && angle>=180) {
                            angle = 180;
                            endMove = true;
                            victim = onlines[2];
                        } else if(idManual > maxId && angle>=90) {
                            angle = 90;
                            endMove = true;
                            victim = onlines[1];
                        } else if(idManual > maxId && angle>=0) {
                            angle = 0;
                            endMove = true;
                            victim = onlines[4];
                        }

                        requestAnimationFrame(draw);
                        idManual++;
                        // console.log("id",id);
                        // Drawing code goes here for the spinning bottle 
                        ctx.save();
                        ctx.translate(canvas.width / 2, canvas.width / 2);
                        // make sure to clear only the old bottle draw every new frame 
                        ctx.clearRect(-150+50,  -radius/2, 300-50, radius);
                        ctx.rotate(angle*Math.PI/180);
                        // the canvas is shifted now at the bottle's center (0,0)
                        ctx.drawImage(loadedImages[img5],  -bottleW,  -bottleL, 2*bottleW, 2*bottleL);
                        ctx.restore();
                        
                        // make sure the inc value does not exceed 360 to keep the motion
                        if(inc >= 360) {
                            inc = 10;
                        } else {
                            inc = inc*1.1;
                        }
                        
                        angle = angle + inc;

                        // avoid having multiples of 360 
                        if(angle >= 360) {
                            angle = 0;
                        } 

                    }, 1000 / fps);
                }
                draw();
            }
        }  
    }, [onlines, activePlayer,newRound,angleServer]);

    

    return (
        <div className="game">
            <div className="game-container">
                <h1>Truth or Dare Game</h1>
                {onlines && onlines.length==5? 
                    (<>
                        {activePlayer && (<h2>only {activePlayer.first} may click</h2>)}
                        <div className="Btn">
                            <button onClick={(e) => {
                                e.preventDefault();
                                spinClicked = true;
                                console.log("spinClicked",spinClicked);
                                if(activePlayer.id === loggedPlayer.id) {
                                    startFlag = true;
                                    socket.emit('new spin');
                                    // dispatch(gamestart()); // change a state to re-run the useEffect
                                    console.log("startFlag",startFlag);
                                }
                            }}>SPIN</button>
                        </div>

                        <div className="Btn">
                            <button onClick={(e) => {
                                e.preventDefault();
                                newRoundClicked = true;
                                console.log("newRoundClicked",newRoundClicked);
                                if(activePlayer.id === loggedPlayer.id) {
                                // emit to get the new active player from the server
                                    socket.emit('new round',onlines);
                                    console.log("msg emitted to server");
                                }
                            }}>NEW ROUND</button>
                        </div>

                        <div className="Btn">
                            <button onClick={(e) => {
                                e.preventDefault();
                                console.log("Erase Scores");
                                fetch("/zeroScores", {
                                    method: "POST",
                                    headers: {"Content-Type": "application/json"},
                                    body: JSON.stringify(onlines),
                                })
                                    .then(res => res.json())
                                    .then((data) => {
                                        if(data.success) {
                                            console.log("scores were erased successfully");
                                        }
                                    })
                                    .catch(console.log());
                            }}>Erase Scores</button>
                        </div>

                        <div className="canv">
                            <canvas ref={canvasRef} id="canv" width="800" height="800" />
                        </div>
                    </>)
                    : (<h3>waiting 4 players to join ...</h3>)
                }
             
            </div>    
        </div>
    );
}