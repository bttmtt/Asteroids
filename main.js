var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

const FPS = 30;
const SHIP_SIZE = 30; // height in pixels

var ship = {
    x: canv.width / 2,
    y: canv.heigth / 2,
    r: SHIP_SIZE / 2, // radius
    a: 90 / 180 * Math.PI // direction of movement
}

// game loop
setInterval(update, 1000 / FPS);

function update() {

    //draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // draw ship
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = SHIP_SIZE / 20;
}