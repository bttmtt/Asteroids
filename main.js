var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

const FPS = 60;
const FRICTION = 0.7;
const ROIDS_NUM = 5; // starting number of asteroids
const ROIDS_SIZE = 100; // starting size in px
const ROIDS_SPD = 555; // max starting speed 
const ROIDS_VERT = 10; // average number of vertices 
const ROIDS_JAG = 0.4; // jaggedness (0 = none, 1 = lots)
const SHIP_SIZE = 20; // height in px
const SHIP_THRUST = 3; // accelleration
const TURN_SPEED = 2 * Math.PI; // rad per sec

var ship = {
    x: canv.width / 2,
    y: canv.height / 2,
    r: SHIP_SIZE / 2, // radius
    a: 90 / 180 * Math.PI, // direction of movement
    rot: 0, //rotation
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

//set up asteroids
var roids = [];
createAsteroidBelt();

// game loop
setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
    roids = [];
    var x, y;

    for (var i = 0; i < ROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r)
        roids.push(newAsteroid(x, y));
    }
}

function newAsteroid(x, y) {
    var roid = {
        x: x,
        y: y,
        vx: ROIDS_SPD / FPS * (Math.random() * 2 - 1),
        vy: ROIDS_SPD / FPS * (Math.random() * 2 - 1),
        r: ROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offs: []
    }

    //create vertex offsets array
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG)
    }

    return roid;
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

//event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(evt) {
    switch (evt.keyCode) {
        case 37: //left arrow (rotate ship left)
            ship.rot = TURN_SPEED / FPS;
            break;
        case 38: // up arrow (ship move forward)
            ship.thrusting = true;
            break;
        case 39: // rigth arrow (rotate ship rigth)
            ship.rot = -TURN_SPEED / FPS;
            break;
    }
}

function keyUp(evt) {
    switch (evt.keyCode) {
        case 37: //left arrow (stop ship rotating left)
            ship.rot = 0;
            break;
        case 38: // up arrow (stop ship moving forward)
            ship.thrusting = false;
            break;
        case 39: // rigth arrow (stop ship rotating rigth)
            ship.rot = 0;
            break;
    }
}



//!!!!
function update() {

    //draw space
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // draw ship
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
        ship.x + ship.r * Math.cos(ship.a) * 1.5,
        ship.y - ship.r * Math.sin(ship.a) * 1.5
    );
    ctx.lineTo(
        ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo(
        ship.x,
        ship.y
    );
    ctx.lineTo(
        ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    // rotate ship
    ship.a += ship.rot;

    //move ship
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        //draw thruster
        ctx.strokeStyle = "#FFFF00";
        ctx.lineWidth = SHIP_SIZE / 20;
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();
        ctx.moveTo(
            ship.x - 0.4 * ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y + 0.4 * ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
        );
        ctx.lineTo(
            ship.x - 1.2 * ship.r * Math.cos(ship.a),
            ship.y + 1.2 * ship.r * Math.sin(ship.a)
        );
        ctx.lineTo(
            ship.x - 0.4 * ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y + 0.4 * ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
        );
        ctx.lineTo(
            ship.x,
            ship.y
        );
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    handleEdgeOfScreen(ship);

    // asteroids
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = SHIP_SIZE / 20;
    var x, y, r, a, vert, offs;
    for (var i = 0; i < roids.length; i++) {
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;
        offs = roids[i].offs;

        // draw polygon
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );
        for (var j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        // move asteroids

        roids[i].x += roids[i].vx;
        roids[i].y += roids[i].vy;

        handleEdgeOfScreen(roids[i]);
    }
}

function handleEdgeOfScreen(obj) {
    if (obj.x < 0 - obj.r) {
        obj.x = canv.width + obj.r;
    } else if (obj.x > canv.width + obj.r) {
        obj.x = 0 - obj.r;
    }

    if (obj.y < 0 - obj.r) {
        obj.y = canv.height + obj.r;
    } else if (obj.y > canv.height + obj.r) {
        obj.y = 0 - obj.r;
    }
}