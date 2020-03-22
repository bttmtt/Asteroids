// get html elements
var canv = document.getElementById("gameCanvas");
var ctx = canv.getContext("2d");

// set up sound effects
var fxProj = new Sound("sounds/projectile.m4a", 10, 0.05);
var fxExplShip = new Sound("sounds/explode.m4a");
var fxHitLrg = new Sound("sounds/bangLarge.wav", 5, 0.6);
var fxHitMed = new Sound("sounds/bangMedium.wav", 5, 0.6);
var fxHitSml = new Sound("sounds/bangSmall.wav", 5, 0.6);
var fxExtraShip = new Sound("sounds/extraShip.wav");
var fxThruster = new Sound("sounds/thrrrust.m4a", 1, 0.15);

// set up music
var music = new Music("sounds/music-low.m4a", "sounds/music-high.m4a");

// set up the game parameters
var level, lives, score, bestScore, ship, roids = [], explRoids = [], text, textAlpha, textNewBestAlpha;
newGame();

// variables for drawing ship explosions
var x1, y1, r1, a1, vert1, offs1;

//event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// game loop
setInterval(update, 1000 / FPS);




function newGame() {
    level = 0;
    score = 0;
    lives = GAME_LIVES;
    ship = newShip();
    textNewBestAlpha = 1.0;

    // get the best score from local storage
    cookieStr = getCookie(SAVE_KEY_SCORE);
    bestScore = (cookieStr == "") ? 0 : parseInt(cookieStr);

    newLevel();
}

function newLevel() {
    text = "LEVEL " + (level + 1);
    textAlpha = 1.0;
    roidsMax = (ROIDS_NUM + level) * 4;
    createAsteroidBelt();
}

function gameOver() {
    // check Best score
    if (score > bestScore) {
        bestScore = score;
        setCookie(SAVE_KEY_SCORE, bestScore, 9999);
    }
    
    ship.dead = true;
    text = "GAME OVER";
    textAlpha = 1.0;
}