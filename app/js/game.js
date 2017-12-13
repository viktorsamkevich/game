window.onload = init;
//Create all variables
var map;
var ctxMap;

var pl;
var ctxPl;

var enymeCv;
var ctxEnemy;

var dropCv;
var ctxDrop;

var stats;
var ctxStats;

var drawButton;
var clearButton;

var gameWidth = 800;
var gameHeight = 500;

var background = new Image();
background.src = "./img/bg.png";

var background1 = new Image();
background1.src = "./img/bg.png";

var tiles = new Image();
tiles.src = "./img/sprite.png";

var dropImg = new Image();
dropImg.src = "./img/sprite.png";

var player;
var enemies = [];
var drops = [];

var isPlaying;
var health;
var level = 1;
var score = 0;

var map1X = gameWidth;
var mapX = 0;

//For creating enemies
var spawnInterval;
var spawnTime = 8000;
var spawnAmount = 4;

var spawnIntervalDrop;
var spawnTimeDrop = 6000;
var spawnAmountDrop = 4;

var mouseX;
var mouseY;

var mouseControl = true;

var isGameOver;
var isFirstPlay = true;

var requestAnimFrame = window.requestAnimationFrame ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       window.msRequestAnimationFrame;

//Initialization function
function init() {
    map = document.getElementById("map");
    ctxMap = map.getContext("2d");

    pl = document.getElementById("player");
    ctxPl = pl.getContext("2d");

    enymeCv = document.getElementById("enemy");
    ctxEnemy = enymeCv.getContext("2d");

    dropCv = document.getElementById("drop");
    ctxDrop = dropCv.getContext("2d");

    stats = document.getElementById("stats");
    ctxStats = stats.getContext("2d");

    map.width = gameWidth;
    map.height = gameHeight;

    pl.width = gameWidth;
    pl.height = gameHeight;

    enymeCv.width = gameWidth;
    enymeCv.height = gameHeight;

    dropCv.width = gameWidth;
    dropCv.height = gameHeight;

    stats.width = gameWidth;
    stats.height = gameHeight;

    ctxStats.fillStyle = "green";
    ctxStats.font = "bold 24px Arial";
   
    player = new Player();

    resetHealth();
    
    startLoop();
    updateStats();

    document.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("click", mouseClick, false);
    document.addEventListener("keydown", checkKeyDown, false);
    document.addEventListener("keyup", checkKeyUp, false);

    render();
    reset();
    document.getElementById('play').addEventListener('click', function() {
        isFirstPlay = true;
        document.getElementById('introduction').style.display = 'none';
        reset();
        startLoop();
    });
    document.getElementById('play-again').addEventListener('click', function() {
        if (!isGameOver) {
            level = 1;
            isFirstPlay = true;
            isGameOver = true;
            document.getElementById('game-over').style.display = 'none';
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('status').innerHTML = 'GAME OVER';
            document.getElementById('congratulations').innerHTML = '';
            document.getElementById('home').style.display = 'none';
        }
        reset();
        resetHealth();
        startLoop();
    });
}

//Create the background of the game
function drawBg() {
    ctxMap.clearRect(0, 0, gameWidth, gameHeight);
    ctxMap.drawImage(background, 0, 0, 800, 450, mapX, 0, gameWidth, gameHeight);
    ctxMap.drawImage(background1, 0, 0, 800, 450, map1X, 0, gameWidth, gameHeight);
}
//Animate the background of the game
function moveBg() {
    mapX -= 4;
    map1X -=4;
    if(mapX + gameWidth < 0) {
        mapX = gameWidth - 5;
    }
    if(map1X + gameWidth < 0) {
        map1X = gameWidth - 5;
    }
}

//Create the enemy object
function Enemy() {
    this.srcX = 0;
    this.srcY = 120;
    this.drawX = Math.floor(Math.random() * gameWidth) + gameWidth;
    this.drawY = Math.floor(Math.random() * gameHeight);
    this.width = 50;
    this.height = 50;
    this.speed = 1;
}

Enemy.prototype.draw = function() {
    
    ctxEnemy.drawImage(tiles, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
}

Enemy.prototype.update = function() {
    this.drawX -=7;
    if(this.drawX + this.width < 0) {
       this.destroy();
    }
}

Enemy.prototype.destroy = function() {
    enemies.splice(enemies.indexOf(this), 1);
}

function spawnEnemy(count) {
    for(var i = 0; i < count; i++) {
        enemies[i] = new Enemy();
    }
}

function startCreatingEnemies() {
    stopCreatingEnemies();
    spawnInterval = setInterval(function(){spawnEnemy(spawnAmount)}, spawnTime);
}

function stopCreatingEnemies() {
    clearInterval(spawnInterval);
}

//Create the drop object
function Drop() {
    this.srcX = 0;
    this.srcY = 190;
    this.drawX = Math.floor(Math.random() * gameWidth) + gameWidth;
    this.drawY = Math.floor(Math.random() * gameHeight);
    this.width = 60;
    this.height = 70;
    this.speed = 10;
}

Drop.prototype.draw = function() {
    ctxDrop.drawImage(dropImg, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
}

Drop.prototype.update = function() {
    this.drawX -=10;
    if(this.drawX + this.width < 0) {
       this.destroyD();
    }
}

Drop.prototype.destroyD = function() {
    drops.splice(drops.indexOf(this), 1);
}

function spawnDrop(count) {
    for(var i = 0; i < count; i++) {
        drops[i] = new Drop();
    }
}

function startCreatingDrops() {
    stopCreatingDrops();
    spawnIntervalDrop = setInterval(function(){spawnDrop(spawnAmountDrop)}, spawnTimeDrop);
}

function stopCreatingDrops() {
    clearInterval(spawnIntervalDrop)
}

//Create the player object
function Player() {
    this.srcX = 0;
    this.srcY = 0;
    this.drawX = 0;
    this.drawY = 0;
    this.width = 120;
    this.height = 120;
    this.speed = 10;

    //For driving
    this.isUp = false;
    this.isDown = false;
    this.isRight = false;
    this.isLeft = false;
}

Player.prototype.draw = function() {
    clearCtxPlayer();
    ctxPl.drawImage(tiles, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
}

Player.prototype.update = function() {
    this.chooseDir();

    if(health < 0) {
        gameOver();
    }

    if(health <=2) {
        ctxStats.fillStyle = "red";
    }
    //Player collisions with walls
    if(this.drawX < 0) {
        this.drawX = 0;
    }
    if(this.drawX > gameWidth - this.width - 100) {
        this.drawX = gameWidth - this.width - 100;
    }
    if(this.drawY < 0) {
        this.drawY = 0;
    }
    if(this.drawY > gameHeight - this.height) {
        this.drawY = gameHeight - this.height;
    }
    //Player collisions with enemies
    for(var i = 0; i < enemies.length; i++) {
        if(this.drawX >= enemies[i].drawX && 
            this.drawY >= enemies[i].drawY &&
            this.drawX <= enemies[i].drawX + enemies[i].width &&
            this.drawY <= enemies[i].drawY + enemies[i].height) {
            health--;
        }
    }
    //Player collisions with drops   
    for(var i = 0; i < drops.length; i++) {
        if(this.drawX >= drops[i].drawX &&
            this.drawY >= drops[i].drawY &&
            this.drawX <= drops[i].drawX + drops[i].width &&
            this.drawY <= drops[i].drawY + drops[i].height) {
            score++;
        }
    }
}

Player.prototype.chooseDir = function() {
    if(this.isUp) {
        this.drawY -= this.speed;
    }
    if(this.isDown) {
        this.drawY += this.speed;
    }
    if(this.isRight) {
        this.drawX += this.speed;
    }
    if(this.isLeft) {
        this.drawX -= this.speed;
    }
}

//Draw objects
function draw() {
    player.draw();
    clearCtxEnemy();
    clearCtxDrop();

    for(var i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }

    for(var i = 0; i < drops.length; i++) {
        drops[i].draw();
    }
}

//Create the game loop
function loop() {
    if(isPlaying) {
        draw();
        update();
        requestAnimFrame(loop);
    }
}
function startLoop() {
    isPlaying = true;
    loop();
    startCreatingEnemies();
    startCreatingDrops();
}
function stopLoop() {
    isPlaying = false;
}

//Create game levels
function levelOne() {
        level = 1;
        spawnAmount = 4;
        spawnTime = 8000;
        spawnAmountDrop = 4;
}
function levelTwo() {
        level = 2;
        spawnAmount = 6;
        spawnTime = 7500;
        spawnAmountDrop = 3;
}
function levelThree() {
        level = 3;
        spawnAmount = 8;
        spawnTime = 7000;
        spawnAmountDrop = 2;
}
function levelFour() {
        level = 4;
        spawnAmount = 9;
        spawnTime = 6500;
        spawnAmountDrop = 2;
}
function startNextLevel() {
    if (level == 2) {
        levelTwo();            
    } else if (level == 3) {
        levelThree();
    } else if (level == 4) {
        levelFour();
    }
}

//Functions for cleaning the context
function clearRect() {
    ctxMap.clearRect(0, 0, 800, 500);
}
function clearCtxPlayer() {
    ctxPl.clearRect(0, 0, 800, 500);
}
function clearCtxEnemy() {
    ctxEnemy.clearRect(0, 0, 800, 500);
}
function clearCtxDrop() {
    ctxDrop.clearRect(0, 0, 800, 500);
}

//Functions for updating
function resetHealth() {
    health = 4;
}
function update() {
    moveBg();
    drawBg();
    updateStats();
    player.update();

    if (score >= 50) {
        level = 2;
        startNextLevel();
    } 
    if (score >= 100) {
        level = 3;
        startNextLevel();
    }
    if (score >= 200) {
        level = 4;
        startNextLevel();
    }
    if (score >= 500) {
        stopLoop();
        document.getElementById('win').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }

    for(var i = 0; i < enemies.length; i++) {
        enemies[i].update();
    }

    for(var i = 0; i < drops.length; i++) {
        drops[i].update();
    }
}

function updateStats() {
    ctxStats.clearRect(0, 0, gameWidth, gameHeight);
    ctxStats.fillText(("Health:" + health)+("; ")+("Score:" + score)+("; ")+("Level:" + level), 10, 20);
}

//Player control by WASD keys
function checkKeyDown(e) {
    var keyId = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyId);
    document.getElementById("gameName").innerHTML = "Управление WASD";
    if(keyChar == "W") {
        player.isUp = true;
        e.preventDefaut();
    }
    if(keyChar == "S") {
        player.isDown = true;
        e.preventDefaut();
    }
    if(keyChar == "D") {
        player.isRight = true;
        e.preventDefaut();
    }
    if(keyChar == "A") {
        player.isLeft = true;
        e.preventDefaut();
    }
}
function checkKeyUp(e) {
    var keyId = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyId);

    if(keyChar == "W") {
        player.isUp = false;
        e.preventDefaut();
    }
    if(keyChar == "S") {
        player.isDown = false;
        e.preventDefaut();
    }
    if(keyChar == "D") {
        player.isRight = false;
        e.preventDefaut();
    }
    if(keyChar == "A") {
        player.isLeft = false;
        e.preventDefaut();
    }
}

//Player control by MOUSE
function mouseMove(e) {
    if (!mouseControl) {
        return;
    }
    mouseX = e.pageX - map.offsetLeft;
    mouseY = e.pageY - map.offsetTop;

    player.drawX = mouseX - player.width / 2;
    player.drawY = mouseY - player.height / 2;
    document.getElementById("gameName").innerHTML = "Управление мышью";
   //document.getElementById("gameName").innerHTML = "X: "+mouseX+"Y: "+mouseY;
}
function mouseClick(e) {
    if (!mouseControl) {
        document.getElementById("gameName").innerHTML = "Управление WASD";
        return;
    }
}

//System functions
function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
    isGameOver = true;
    stopLoop();
    levelOne();
}
function reset() {
    if (isGameOver) {
        document.getElementById('game-over').style.display = 'none';
        isGameOver = false;
        score = 0;
        gameTime = 0;
        clearRect();
    }
    document.getElementById('overlay').style.display = 'none';
}
function render() {
    if (isFirstPlay) {
        document.getElementById('introduction').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    }
    stopLoop();
}
