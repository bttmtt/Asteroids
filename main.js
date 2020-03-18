const FPS = 60;
const LINES_WIDTH = 1;
const GAME_LIVES = 1; // starting number of lives
const FRICTION = 0.7;
const ROIDS_NUM = 1; // starting number of asteroids
const ROIDS_SIZE = 100; // starting size in px
const ROIDS_SPD = 55; // max starting speed 
const ROIDS_VERT = 10; // average number of vertices 
const ROIDS_JAG = 0.35; // jaggedness (0 = none, 1 = lots)
const ROIDS_EXPL_PIECES = 25; // number of pieces when the roids breaks
const ROIDS_EXPL_TIME = 0.65; // sec
const ROIDS_EXPL_RADIUS = ROIDS_SIZE / 4 * 0.5;
const SHIP_SIZE = 20; // height in px
const SHIP_THRUST = 3; // accelleration
const SHIP_EXPLOSION_DUR = 1.7; // exploding animation in sec
const SHIP_INV_DUR = 3; // ship invulnerability when respawning in sec
const SHIP_BLINK_DUR = 0.2; // duration of one blink in sec
const SHIP_EXPLOSION_RADIUS = SHIP_SIZE * 1.2;
const SHIP_TURN_SPEED = 1.3 * Math.PI; // rad per sec
const SHOW_COLLISION_CIRCLES = false;
const PROJ_MAX = 10; // maximum number of projectiles on screen at once
const PROJ_SPEED = 500; // speed of projectiles 
const PROJ_MAX_DIST = 0.6; // maximum distance a proj can travel as fraction of screen width
const TEXT_FADE_TIME = 2.5; //text fade time is sec
const TEXT_SIZE = 35; //text font height in px

var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

// set up the game parameters
var level, lives, ship, roids = [], explRoids = [], text, textAlpha;
newGame();

function newGame() {
    level = 0;
    lives = GAME_LIVES;
    ship = newShip();
    newLevel();
}

function newLevel() {
    text = "Level " + (level + 1);
    textAlpha = 1.0;
    createAsteroidBelt();
}

function gameOver() {
    ship.dead = true;
    text = "Game Over";
    textAlpha = 1.0;
}

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: SHIP_SIZE / 2, // radius
        a: 90 / 180 * Math.PI, // direction of movement
        rot: 0, //rotation
        thrusting: false,
        dead: false,
        canShoot: true,
        proj: [],
        blinkFrames: Math.ceil(SHIP_BLINK_DUR * FPS),
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        explodeTime: 0,
        v: {
            x: 0,
            y: 0
        }
    }
}

function drawShip(x, y, a) {
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(  // nose
        x + ship.r * Math.cos(a) * 1.5,
        y - ship.r * Math.sin(a) * 1.5
    );
    ctx.lineTo( // rear left
        x - ship.r * (Math.cos(a) + Math.sin(a)),
        y + ship.r * (Math.sin(a) - Math.cos(a))
    );
    ctx.lineTo( // center
        x,
        y
    );
    ctx.lineTo( // rear right
        x - ship.r * (Math.cos(a) - Math.sin(a)),
        y + ship.r * (Math.sin(a) + Math.cos(a))
    );
    ctx.closePath();
    ctx.stroke();
}

var x1, y1, r1, a1, vert1, offs1; // variables for drawing ship explosions

function createAsteroidBelt() {
    roids = [];
    var x, y;

    for (var i = 0; i < ROIDS_NUM + level; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r)
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function newAsteroid(x, y, r) {
    var lvlMult = 1 + 0.1 * level;
    var roid = {
        x: x,
        y: y,
        vx: ROIDS_SPD * lvlMult / FPS * (Math.random() * 2 - 1),
        vy: ROIDS_SPD * lvlMult / FPS * (Math.random() * 2 - 1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offs: [],
    }

    //create vertex offsets array
    for (var i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }
    return roid;
}

function newExplRoid(x, y) {
    var explRoid = {
        x: x,
        y: y,
        r: ROIDS_EXPL_RADIUS / 3,
        explTime: Math.ceil(ROIDS_EXPL_TIME * FPS),
        offs: []
    }

    //create offsets array
    for (var i = 0; i < ROIDS_EXPL_PIECES; i++) {
        explRoid.offs.push(Math.random() * ROIDS_SIZE / 10);
    }
    explRoids.push(explRoid);
}

function destroyAsteroid(index) {
    var x = roids[index].x;
    var y = roids[index].y;
    var r = roids[index].r;

    // if asteroid size is big or medium
    if (r != Math.ceil(Math.ceil(Math.ceil(ROIDS_SIZE / 2) / 2) / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(r / 2)));
        roids.push(newAsteroid(x, y, Math.ceil(r / 2)));
    } else { // if asteroid size is small
        // add breaking animation
        newExplRoid(x, y);
    }

    // destroy the original asteroid
    roids.splice(index, 1);

    if (roids.length == 0) {
        level++;
        newLevel();
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function shoot() {
    // create projectiles object
    if (ship.canShoot && ship.proj.length < PROJ_MAX && ship.explodeTime == 0) {
        ship.proj.push({
            x: ship.x + ship.r * Math.cos(ship.a) * 1.5,
            y: ship.y - ship.r * Math.sin(ship.a) * 1.5,
            vx: PROJ_SPEED * Math.cos(ship.a) / FPS,
            vy: PROJ_SPEED * Math.sin(ship.a) / FPS,
            r: SHIP_SIZE / 15,
            dist: 0
        })
    }
}

//event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(evt) {
    if (ship.dead) return;
    switch (evt.keyCode) {
        case 32: //spacebar (shoot)
            shoot();
            break;
        case 37: //left arrow (rotate ship left)
            ship.rot = SHIP_TURN_SPEED / FPS;
            break;
        case 38: // up arrow (ship move forward)
            ship.thrusting = true;
            break;
        case 39: // rigth arrow (rotate ship rigth)
            ship.rot = -SHIP_TURN_SPEED / FPS;
            break;
    }
}

function keyUp(evt) {
    if (ship.dead) return;
    switch (evt.keyCode) {
        case 32: //spacebar (allow shooting again)
            ship.canShoot = true;
            break;
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

// game loop
setInterval(update, 1000 / FPS);

function update() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;

    ctx.lineWidth = LINES_WIDTH;

    //draw space
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canv.width, canv.height);

    if (ship.blinkNum == 0 && !ship.dead) { // if the ship is not invulnerable
        //check collisions
        for (var i = 0; i < roids.length; i++) {
            if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) <
                ship.r + roids[i].r && ship.explodeTime == 0) {
                ship.explodeTime = SHIP_EXPLOSION_DUR * FPS;
                r1 = SHIP_EXPLOSION_RADIUS / 3;
                destroyAsteroid(i);
                break;
            }
        }
    }

    if (!exploding) {

        if (blinkOn && !ship.dead) {

            // draw ship
            drawShip(ship.x, ship.y, ship.a);

            // draw thruster
            if (ship.thrusting) {

                ctx.strokeStyle = "#ffff00";
                ctx.fillStyle = "#ffff00";
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
            ctx.strokeStyle = "#00ff00";
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
        ctx.strokeStyle = "#ff0000";
        boom = newAsteroid(ship.x, ship.y);
        x1 = boom.x;
        y1 = boom.y;
        a1 = boom.a;
        vert1 = boom.vert;
        offs1 = boom.offs;

        r1 += 2 / 3 * SHIP_EXPLOSION_RADIUS / (SHIP_EXPLOSION_DUR * FPS);

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
        if (ship.explodeTime == 0) {
            lives--;
            if (lives == 0) {
                gameOver();
            } else {
                ship = newShip();
            }
        }
    }

    // projectiles
    for (var i = 0; i < ship.proj.length; i++) {
        // check distance travelled
        if (ship.proj[i].dist > PROJ_MAX_DIST * canv.width) {
            ship.proj.splice(i, 1);
            continue;
        }

        // draw projectiles
        ctx.fillStyle = "#f59342";
        ctx.beginPath();
        ctx.arc(ship.proj[i].x, ship.proj[i].y, ship.proj[i].r, 0, Math.PI * 2, false);
        ctx.fill();

        // move projectiles
        ship.proj[i].x += ship.proj[i].vx;
        ship.proj[i].y -= ship.proj[i].vy;

        // calculate distance travelled
        ship.proj[i].dist += Math.sqrt(Math.pow(ship.proj[i].vx, 2) + Math.pow(ship.proj[i].vy, 2));

        handleEdgeOfScreen(ship.proj[i]);

        // detect hits
        for (var j = 0; j < roids.length; j++) {
            if (distBetweenPoints(ship.proj[i].x, ship.proj[i].y, roids[j].x, roids[j].y) <
                ship.proj[i].r + roids[j].r) {
                ship.proj.splice(i, 1);
                i--;
                destroyAsteroid(j);
                break;
            }
        }
    }

    // asteroids
    var x, y, r, a, vert, offs;
    for (var i = 0; i < roids.length; i++) {
        ctx.strokeStyle = "#777777";

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
            ctx.strokeStyle = "#00ff00";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }

        // move asteroids
        roids[i].x += roids[i].vx;
        roids[i].y += roids[i].vy;
        handleEdgeOfScreen(roids[i]);
    }

    // draw exploding asteroid animation A
    var ang = 0;
    ctx.strokeStyle = "#777777";
    ctx.lineWidth = 2;
    for (var i = 0; i < explRoids.length; i++) {
        explRoids[i].r += 2 / 3 * ROIDS_EXPL_RADIUS / (ROIDS_EXPL_TIME * FPS);
        for (var j = 0; j < ROIDS_EXPL_PIECES; j++) {
            if (j % 2 == 0) {
                ctx.beginPath();
                ctx.moveTo(
                    explRoids[i].x + (explRoids[i].r + explRoids[i].offs[j]) * Math.cos(ang),
                    explRoids[i].y + (explRoids[i].r + explRoids[i].offs[j]) * Math.sin(ang)
                );
                ctx.lineTo(
                    explRoids[i].x + (explRoids[i].r + explRoids[i].offs[j]) * Math.cos(ang) * 1.1,
                    explRoids[i].y + (explRoids[i].r + explRoids[i].offs[j]) * Math.sin(ang) * 1.1
                );
                ctx.stroke();
            }
            ang += Math.PI * 2 / ROIDS_EXPL_PIECES;
        }
        explRoids[i].explTime--;
        if (explRoids[i].explTime <= 0) {
            explRoids.splice(i, 1);
            i--;
        }
    }

    // draw exploding asteroid animation B
    /*var ang = 0;
    for (var i = 0; i < explRoids.length; i++) {
        explRoids[i].r += 2 / 3 * ROIDS_EXPL_RADIUS / (ROIDS_EXPL_TIME * FPS);
        for (var j = 0; j < ROIDS_EXPL_PIECES; j++) {
            ctx.strokeStyle = "#777777";
            if (j % 2 == 0 ) {
                ctx.beginPath();
                ctx.arc(explRoids[i].x, explRoids[i].y, explRoids[i].r, ang, ang + Math.PI * 2 / ROIDS_EXPL_PIECES, false);
                ctx.stroke();
            } 
            ang += Math.PI * 2 / ROIDS_EXPL_PIECES;
        }
        explRoids[i].explTime--;
        if (explRoids[i].explTime <= 0) {
            explRoids.splice(i, 1);
            i--;
        }
    }*/

    ctx.lineWidth = 1;
    // draw the game text
    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono";
        ctx.fillText(text, canv.width / 2, canv.height * 0.25);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    } else if (ship.dead) {
        newGame();
    }

    // draw lives 
    for (var i = 0; i < lives; i++) {
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.3, SHIP_SIZE * 1.25, 0.5 * Math.PI);
    }
}