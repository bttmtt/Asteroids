// initiate page
var canv = document.getElementById("gameCanvas");
canv.width = innerWidth * 0.60;
canv.height = innerHeight * 0.70;
document.getElementById("divCanvas").style.display = "none";
document.getElementById("inpText").value = "player" + (Math.ceil(Math.random() * 999));

var ctx = canv.getContext("2d");

updateLeaderboard();


// set up sound effects
var soundOn = true;
var fxProj = new Sound("sounds/projectile.m4a", 10, 0.05);
var fxExplShip = new Sound("sounds/explode.m4a");
var fxHitLrg = new Sound("sounds/bangLarge.wav", 5, 0.6);
var fxHitMed = new Sound("sounds/bangMedium.wav", 5, 0.6);
var fxHitSml = new Sound("sounds/bangSmall.wav", 5, 0.6);
var fxExtraShip = new Sound("sounds/extraShip.wav");
var fxThruster = new Sound("sounds/thrrrust.m4a", 1, 0.15);

// set up music
var musicOn = true;
var music = new Music("sounds/music-low.m4a", "sounds/music-high.m4a");

// set up the game parameters
var user, status = "MENU", level, lives, score, personalBest = 0, globalBest = 2500, ship, roids = [], explRoids = [],
    text, textAlpha, textNewBestAlpha, textWelcome, welcomeAlpha, welcome = true, gameNumber = 0;

// variables for drawing ship explosions
var x1, y1, r1, a1, vert1, offs1;

//event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// game loop
setInterval(checkStatus, 1000 / FPS);

function checkStatus() {
    if (status == "PLAY") {
        update();
    } else if (status == "PAUSE") {
        drawPause();
    }
}

function newGame() {
    status = "";
    menu();

    gameNumber++;
    status = "PLAY";
    level = 0;
    score = 0;
    lives = GAME_LIVES;
    ship = newShip();
    textNewBestAlpha = 1.0;
    welcomeAlpha = 0;

    // get the user name
    user = document.getElementById("frm1").elements[0].value;
    textWelcome = "Bentornato " + user + "!";

    // hilight the player on the leaderboard and say welcome
    highlight(user);

    // get the personal and global best from database
    $.ajax({
        type: "get",
        url: "elabora/selectBest.php",
        data: "name=" + user,
        success: function (response) {
            let pos = response.indexOf(";");
            personalBest = parseInt(response.slice(0, pos));
            globalBest = parseInt(response.slice(pos + 1));
        }
    });

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
    if (score > personalBest) {
        personalBest = score;
    }
    ship.dead = true;
    text = "GAME OVER";
    status = "OVER";
    textAlpha = 1.0;
    insertScore(user, score);
}

function drawPause() {
    ctx.lineWidth = LINES_WIDTH;
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    ctx.font = "small-caps " + TEXT_SIZE + "px atariClassic";
    text = "GAME PAUSED";
    ctx.fillText(text, canv.width / 2, canv.height * 0.25);

    text = "Press esc again to resume";
    ctx.font = "small-caps " + (TEXT_SIZE * 0.8) + "px atariClassic";
    ctx.fillText(text, canv.width / 2, canv.height * 0.40);
}

function showTutorial() {
    document.getElementById("gameMenu").style.display = "none";
    document.getElementById("gameTutorial").style.display = "block";
}

function hideTutorial() {
    document.getElementById("gameTutorial").style.display = "none";
    document.getElementById("gameMenu").style.display = "block";
}

function menu() {
    if (status == "PLAY" || status == "OVER" || status == "PAUSE") {
        gameOver();
        document.getElementById("divCanvas").style.display = "none";
        document.getElementById("gameMenu").style.display = "block";
        document.getElementById("page").style.backgroundColor = "rgb(134, 28, 28)";
        document.getElementById("bod").style.backgroundColor = "rgb(134, 28, 28)";
        document.getElementById("scoreTable").style.backgroundColor = "rgb(134, 28, 28)";
        document.getElementById("restartIcon").style.display = "none";
        document.getElementById("homeIcon").style.display = "none";
        document.getElementById("soundOnIcon").style.display = "none";
        document.getElementById("soundOffIcon").style.display = "none";
    } else {
        document.getElementById("page").style.backgroundColor = "rgb(11, 18, 117)";
        document.getElementById("bod").style.backgroundColor = "rgb(11, 18, 117)";
        document.getElementById("scoreTable").style.backgroundColor = "rgb(11, 18, 117)";
        document.getElementById("divCanvas").style.display = "block";
        document.getElementById("gameMenu").style.display = "none";
        document.getElementById("restartIcon").style.display = "block";
        document.getElementById("homeIcon").style.display = "block";
        if (soundOn) {
            document.getElementById("soundOnIcon").style.display = "block";
        } else {
            document.getElementById("soundOffIcon").style.display = "block";
        }
    }
}

function updateLeaderboard() {
    $.ajax({
        type: "get",
        url: "elabora/selectAll.php",
        success: function (response) {
            document.getElementById("sb").innerHTML = response;
            if (status == "PLAY") {
                document.getElementById("scoreTable").style.backgroundColor = "rgb(11, 18, 117)";
            }
            highlight(user);
        }
    });
}

function insertScore(n, s) {
    $.ajax({
        type: "POST",
        url: "elabora/insertNew.php",
        data: "name=" + n + "&score=" + s,
        success: function () {
            updateLeaderboard();
        }
    });
}

function highlight(name) {
    for (let i = 1; i <= 15 && document.getElementById("n" + i); i++) {
        if (document.getElementById("n" + i).innerHTML == name) {

            document.getElementById("r" + i).style.color = "#ff0000";
            document.getElementById("n" + i).style.color = "#ff0000";
            document.getElementById("s" + i).style.color = "#ff0000";
            if (welcome) {
                welcomeAlpha = 1.0;
                welcome = false;
            }
        }
    }
}