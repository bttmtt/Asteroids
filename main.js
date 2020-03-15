var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

const FPS = 60;
const FRICTION = 0.7;
const ROIDS_NUM = 10; // starting number of asteroids
const ROIDS_SIZE = 100; // starting size in px
const ROIDS_SPD = 55; // max starting speed 
const ROIDS_VERT = 10; // average number of vertices 
const ROIDS_JAG = 0.35; // jaggedness (0 = none, 1 = lots)
const SHIP_SIZE = 20; // height in px
const SHIP_THRUST = 3; // accelleration
const SHIP_EXPLOSION_DUR = 2; // exploding animation in sec
const SHIP_INV_DUR = 3; // ship invulnerability when respawning in sec
const SHIP_BLINK_DUR = 0.2; // duration of one blink in sec
const EXPLOSION_RADIUS = SHIP_SIZE * 1.5;
const TURN_SPEED = 2 * Math.PI; // rad per sec
const SHOW_COLLISION_CIRCLES = false;

var ship = newShip();

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: SHIP_SIZE / 2, // radius
        a: 90 / 180 * Math.PI, // direction of movement
        rot: 0, //rotation
        thrusting: false,
        blinkFrames: Math.ceil(SHIP_BLINK_DUR * FPS),
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        explodeTime: 0,
        v: {
            x: 0,
            y: 0
        }
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

// variables for drawing the explosions
var x1, y1, r1, a1, vert1, offs1;

//!!!!
function update() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;

    //draw space
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canv.width, canv.height);

    if (ship.blinkNum == 0) {
        //check collisions
        for (var i = 0; i < roids.length; i++) {
            if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r && ship.explodeTime == 0) {
                ship.explodeTime = SHIP_EXPLOSION_DUR * FPS;
                r1 = EXPLOSION_RADIUS / 4;
            }
        }
    }
    if (!exploding) {

        if (ship.blinkNum == 0 || blinkOn) {

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

            // draw thruster
            if (ship.thrusting) {

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
            }
        }

        // handle blinking
        if (ship.blinkNum > 0) {
            ship.blinkFrames--;
            if (ship.blinkFrames == 0) {
                ship.blinkFrames = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }

        // thruster and friction 
        if (ship.thrusting) {
            ship.v.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
            ship.v.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
        } else {
            ship.v.x -= FRICTION * ship.v.x / FPS;
            ship.v.y -= FRICTION * ship.v.y / FPS;
        }

        // ship collision circle 
        if (SHOW_COLLISION_CIRCLES) {
            ctx.strokeStyle = "#00FF00";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        // rotate ship
        ship.a += ship.rot;

        // move ship
        ship.x += ship.v.x;
        ship.y += ship.v.y;
        handleEdgeOfScreen(ship);

    } else { // if the ship is exploding

        // draw exploding amimation
        ctx.strokeStyle = "#FF0000";
        boom = newAsteroid(ship.x, ship.y);
        x1 = boom.x;
        y1 = boom.y;
        a1 = boom.a;
        vert1 = boom.vert;
        offs1 = boom.offs;

        r1 += 3 / 4 * EXPLOSION_RADIUS / (SHIP_EXPLOSION_DUR * FPS);

        ctx.beginPath();
        ctx.moveTo(
            x1 + r1 * offs1[0] * Math.cos(a1),
            y1 + r1 * offs1[0] * Math.sin(a1)
        );
        for (var j = 1; j < vert1; j++) {
            ctx.lineTo(
                x1 + r1 * offs1[j] * Math.cos(a1 + j * Math.PI * 2 / vert1),
                y1 + r1 * offs1[j] * Math.sin(a1 + j * Math.PI * 2 / vert1)
            );
        }
        ctx.closePath();
        ctx.stroke();

        //timer
        ship.explodeTime--;
        if (ship.explodeTime == 0) ship = newShip();
    }

    // asteroids
    var x, y, r, a, vert, offs;
    for (var i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "#777777";
        ctx.lineWidth = SHIP_SIZE / 20;

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

        //asteroids collision circle 
        if (SHOW_COLLISION_CIRCLES) {
            ctx.strokeStyle = "#00FF00";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        // move asteroids
        roids[i].x += roids[i].vx;
        roids[i].y += roids[i].vy;
        handleEdgeOfScreen(roids[i]);
    }
}