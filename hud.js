function drawHud() {
    // draw lives 
    for (var i = 0; i < lives; i++) {
        drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.3, SHIP_SIZE * 1.25, 0.5 * Math.PI);
    }

    // draw the score
    ctx.textAlign = "right";
    ctx.fillStyle = score < bestScore ? "#ffffff" : "#ffff00";
    ctx.font = TEXT_SIZE + "px 'Lato', sans-serif";
    ctx.fillText(score, canv.width - SHIP_SIZE / 2, SHIP_SIZE * 1.75);

    // say new best score
    if (score > bestScore && textNewBestAlpha > 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 0, " + textNewBestAlpha + ")";
        ctx.font = (TEXT_SIZE * 0.5) + "px 'Lato', sans-serif";
        ctx.fillText("NEW BEST SCORE!", canv.width / 2, SHIP_SIZE * 1.75);
        textNewBestAlpha -= (1.0 / TEXT_FADE_TIME / FPS);
    }

}