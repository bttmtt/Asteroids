function update() {
    var blinkOn = ship.blinkNum % 2 == 0;
    var exploding = ship.explodeTime > 0;

    ctx.lineWidth = LINES_WIDTH;

    // music
    music.tick();
    music.setTempo(roids.length);

    //draw space
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canv.width, canv.height);

    //check collisions
    if (ship.blinkNum == 0 && !ship.dead) { // if the ship is not invulnerable and not dead
        for (var i = 0; i < roids.length; i++) {
            if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) <
                ship.r + roids[i].r && ship.explodeTime == 0) {
                explodeShip();
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
            fxThruster.play();
            ship.v.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
            ship.v.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
        } else {
            fxThruster.stop();
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
        switch (SHIP_EXPL_ANIM) {
            case "A1":
                // draw ship exploding amimation A1
                ctx.strokeStyle = "#ff0000";
                boom = newAsteroid(ship.x, ship.y);
                x1 = boom.x;
                y1 = boom.y;
                a1 = boom.a;
                vert1 = boom.vert;
                offs1 = boom.offs;

                r1 += 2 / 3 * SHIP_EXPL_RADIUS / (SHIP_EXPL_DUR * FPS);

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
                break;

            case "A2":
                //draw ship exploding amimation A2
                drawShip(ship.x, ship.y, ship.a, "#ff0000");
                break;
        }
        // timer and lives handler
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

    ctx.lineWidth = LINES_WIDTH;
    // draw the game text
    if(welcomeAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 0, " + welcomeAlpha + ")";
        ctx.font = "small-caps " + (TEXT_SIZE) + "px 'Lato', sans-serif";
        ctx.fillText(textWelcome, canv.width / 2, canv.height * 0.1);
        welcomeAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    }

    if (textAlpha >= 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
        ctx.font = "small-caps " + TEXT_SIZE + "px atariClassic";
        ctx.fillText(text, canv.width / 2, canv.height * 0.3);
        textAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    }

    drawHud();
}