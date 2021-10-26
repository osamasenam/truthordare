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
        if(onlines) {
            const img1 = onlines.length>0? onlines[0].image : '/default.jpg';
            const img2 = onlines.length>1? onlines[1].image : '/default.jpg';
            const img3 = onlines.length>2? onlines[2].image : '/default.jpg';
            const img4 = onlines.length>3? onlines[3].image : '/default.jpg';
            const img5 = '/bottle.png';
        
            var images = [img1,img2,img3,img4, img5];
            var loadedImages = {};
            var promiseArray = images.map(function(imgurl){
                var prom = new Promise(function(resolve,reject){
                    var img = new Image();
                    img.onload = function(){
                        loadedImages[imgurl] = img;
                        resolve();
                    };
                    img.src = imgurl;
                });
                return prom;
            });

            Promise.all(promiseArray).then(imagesLoaded);

            function imagesLoaded(){
            //start canvas work.
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");

                ctx.font = 'normal 30px Arial';
                const radius = canvas.width / 4;
            

                // draw circle
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

                // insert the player's images
                const imgW = 50;
                let imgArr = [new Image(100,100), new Image(100,100), new Image(100,100), new Image(100,100)];
                imgArr[0].src = onlines[0].image;
                imgArr[1].src = onlines[1].image;
                imgArr[2].src = '/default.jpg';
                imgArr[3].src = '/default.jpg';

                if(onlines[0]) {
                    ctx.drawImage(loadedImages[img1], cornersArr[0]-imgW/2, cornersArr[1]-imgW/2, 50, 50);
                    ctx.fillText('player1', cornersArr[0]-imgW/2, cornersArr[1]-imgW/2);
                }
                if(onlines[1]) {
                    ctx.drawImage(loadedImages[img2], cornersArr[2]-imgW/2, cornersArr[3]-imgW/2, 50, 50);
                    ctx.fillText('player2', cornersArr[2]-imgW/2, cornersArr[3]-imgW/2);
                }
                if(onlines[2]) {
                    ctx.drawImage(loadedImages[img3], cornersArr[4]-imgW/2, cornersArr[5]-imgW/2, 50, 50);
                    ctx.fillText('player3', cornersArr[4]-imgW/2, cornersArr[5]-imgW/2);
                }
                if(onlines[3]) {
                    ctx.drawImage(loadedImages[img4], cornersArr[6]-imgW/2, cornersArr[7]-imgW/2, 50, 50);
                    ctx.fillText('player4', cornersArr[6]-imgW/2, cornersArr[7]-imgW/2);
                }

                var angle = Math.floor(Math.random() * 360);
                var inc = 1;
                var fps = 15;
                let id;
                let maxId = Math.floor(Math.random() * (100 - 50 + 1) + 50);
                let endMove = false;
                function draw() {
                    setTimeout(function() {
                        if(endMove) {
                            return;
                        }
                        // console.log("angle",angle);
                        if(id > maxId && angle>=270) {
                            angle = 270;
                            endMove = true;
                        } else if(id > maxId && angle>=180) {
                            angle = 180;
                            endMove = true;
                        } else if(id > maxId && angle>=90) {
                            angle = 90;
                            endMove = true;
                        } else if(id > maxId && angle>=0) {
                            angle = 0;
                            endMove = true;
                        }

                        id = requestAnimationFrame(draw);
                        // console.log("move id:",id);
                        
                        // Drawing code goes here
                        // the spinning bottle 
                        ctx.save();
                        ctx.translate(canvas.width / 2, canvas.width / 2);
                        ctx.clearRect(-150+50,  -radius/2, 300-50, radius);
                        ctx.rotate(angle*Math.PI/180);
                        ctx.drawImage(loadedImages[img5],  -150,  -radius/2, 300, radius);
                        ctx.restore();
                        
                        
                        
                        if(inc >= 360) {
                            inc = 90;
                        } else {
                            inc = inc*1.1;
                        }
                        

                        if(angle >= 360) {
                            angle = 0;
                        } else {
                            angle = angle + inc;
                        }
                    }, 1000 / fps);
                }
                draw();
                
                // setTimeout( function() { 
                //     console.log("stop id:", id);
                //     cancelAnimationFrame(id);
                // }, 3000 );

                // // the spinning bottle 
                // ctx.save();
                // ctx.translate(canvas.width / 2, canvas.width / 2);
                // ctx.rotate(Math.PI/2);
                // ctx.drawImage(loadedImages[img5],  -150,  -2*radius/2, 300, 2*radius);
                // ctx.restore();

            

            }


        
        
        }  

    }, [onlines]);

    

    return (
        <div className="game">
            <h1>Game</h1>
            <canvas ref={canvasRef} id="canv" width="800" height="800" />
             
            {/* <Helmet>
                <script src="/script.js"></script>
            </Helmet> */}
        </div>
    );
}