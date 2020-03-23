function keyDown(evt) {
    if (!ship.dead) {
        switch (evt.keyCode) {
            case 96: // num pad 0 (teleport)
                teleport();
                break;
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
    switch (evt.keyCode) {
        case 27: // esc (pause/unpause the game)
            if (status == "PAUSE") status = "PLAY";
            else if (status == "PLAY") status = "PAUSE";
            break;
    }
}

function keyUp(evt) {
    if (!ship.dead) {
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
}