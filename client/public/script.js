var can = document.getElementById('canv');
var ctx = can.getContext('2d');
console.log(ctx);

ctx.strokeStyle = 'black';
ctx.lineWidth = 5;
ctx.arc(300,150,100,0,2*Math.PI);
ctx.stroke();

function drawBody(x1,y1,x2,y2) {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

//body
drawBody(300,250,300,450);
//legs
drawBody(300,450,200,550);
drawBody(300,450,400,550);
//arms
drawBody(300,350,200,250);
drawBody(300,350,400,250);
