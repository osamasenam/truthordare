import { useEffect, useRef } from 'react';
import { socket } from './socket';
import { useDispatch, useSelector } from "react-redux";
import {Helmet} from "react-helmet";


export default function Game() {

    const onlines = useSelector(state => {
        return state && state.onlineusers;
    });

    const canvasRef = useRef();
    const contextRef = useRef();

    useEffect(async () => {
        console.log("Game component has MOUNTED");

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const radius = canvas.width / 4;
        // draw circle
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'red';
        ctx.stroke();

        // draw the center point
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.fillStyle = '#353535';
        ctx.strokeStyle = '#0C3D4A';
        ctx.stroke();

        //
        let cornersArr = [];
        // draw a pointer for each online player
        for (let i = 0; i < 4; i++) {
            const angle = i * (Math.PI * 2) / 4;       
            ctx.lineWidth = 1;            
            ctx.beginPath();

            var x1 = (canvas.width / 2) + Math.cos(angle) * (radius);
            var y1 = (canvas.height / 2) + Math.sin(angle) * (radius);
            var x2 = (canvas.width / 2) + Math.cos(angle) * (radius - (radius / 10));
            var y2 = (canvas.height / 2) + Math.sin(angle) * (radius - (radius / 10));

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            ctx.strokeStyle = '#466B76';
            ctx.stroke();

            cornersArr.push(x1);
            cornersArr.push(y1);

        }

        if(onlines) {
            // insert the player's image
            const imgW = 50;
            let imgArr = [new Image(100,100), new Image(100,100), new Image(100,100), new Image(100,100)];
            imgArr[0].src = onlines[0].image;
            imgArr[1].src = onlines[1].image;
            imgArr[2].src = '/default.jpg';
            imgArr[3].src = '/default.jpg';

            if(onlines[0]) {
                imgArr[0].onload = function fn() {
                    ctx.drawImage(imgArr[0], cornersArr[0]-imgW/2, cornersArr[1]-imgW/2, 50, 50);
                };
            }
            if(onlines[1]) {
                imgArr[1].onload = function fn() {
                    ctx.drawImage(imgArr[1], cornersArr[2]-imgW/2, cornersArr[3]-imgW/2, 50, 50);
                };
            }
            if(onlines[2]) {
                imgArr[2].onload = function fn() {
                    ctx.drawImage(imgArr[2], cornersArr[4]-imgW/2, cornersArr[5]-imgW/2, 50, 50);
                };
            }
            if(onlines[3]) {
                imgArr[3].onload = function fn() {
                    ctx.drawImage(imgArr[3], cornersArr[6]-imgW/2, cornersArr[7]-imgW/2, 50, 50);
                };
            }
        }

    }, [onlines]);

    

    return (
        <div className="game">
            <h1>Game</h1>
            <canvas ref={canvasRef} id="canv" width="600" height="600" />
             
            {/* <Helmet>
                <script src="/script.js"></script>
            </Helmet> */}
        </div>
    );
}