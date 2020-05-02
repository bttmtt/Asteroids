function newShip() {
    fxExtraShip.play();
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

function drawShip(x, y, a, color = "#ffffff") {
    ctx.strokeStyle = color;
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

function explodeShip() {
    ship.explodeTime = SHIP_EXPL_DUR * FPS;
    r1 = SHIP_EXPL_RADIUS / 3;
    fxExplShip.play();
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
        fxProj.play();
    }

    // only one shot at a time can be fired
    ship.canShoot = false;
}

function teleport() {
    if (ship.explodeTime == 0) {
        var x, y, distance;
        do {
            distance = true;
            x = Math.random() * canv.width;
            y = Math.random() * canv.height;
            for (var i = 0; i < roids.length; i++) {
                if (distBetweenPoints(x, y, roids[i].x, roids[i].y) < 20 + ship.r + roids[i].r) distance = false;
            }
        } while (!distance);

        ship.x = x;
        ship.y = y;
        ship.a = Math.random() * 2 * Math.PI;
    }
}