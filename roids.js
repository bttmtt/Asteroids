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

    if (r == Math.ceil(ROIDS_SIZE / 2)) {// size large
        roids.push(newAsteroid(x, y, Math.ceil(r / 2)));
        roids.push(newAsteroid(x, y, Math.ceil(r / 2)));
        score += ROIDS_PTS_LGE;
        fxHitLrg.play();
    } else if (r == Math.ceil(ROIDS_SIZE / 4)) { // size medium
        roids.push(newAsteroid(x, y, Math.ceil(r / 2)));
        roids.push(newAsteroid(x, y, Math.ceil(r / 2)));
        score += ROIDS_PTS_MED;
        fxHitMed.play();
    } else { //size small
        newExplRoid(x, y);
        score += ROIDS_PTS_SML;
        fxHitSml.play();
    }

    // destroy the original asteroid
    roids.splice(index, 1);

    // next level when all the asteroids are gone 
    if (roids.length == 0) {
        
        level++;
        newLevel();
    }
}