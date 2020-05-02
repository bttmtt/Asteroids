function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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