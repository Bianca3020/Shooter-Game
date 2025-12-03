// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI
const homeScreen = document.getElementById("homeScreen");
const pauseScreen = document.getElementById("pauseScreen");
const hud = document.getElementById("hud");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const continueBtn = document.getElementById("continueBtn");
const exitBtn = document.getElementById("exitBtn");

// HUD text
let highScore = localStorage.getItem("shooterHighScore") || 0;
document.getElementById("highScore").textContent = highScore;
document.getElementById("highScoreTop").textContent = highScore;

// GAME STATE
let gameRunning = false;
let paused = false;
let gameOver = false;

let gameTime = 30;
let score = 0;

// INPUT
let keys = {};
document.addEventListener("keydown", e => { keys[e.key] = true; });
document.addEventListener("keyup", e => { keys[e.key] = false; });

// PLAYER
const player = {
    x: 100,
    y: canvas.height / 2,
    speed: 6
};

// BULLETS
let bullets = [];
let lastShot = 0;
const shootDelay = 200;

function shoot() {
    const now = Date.now();
    if (now - lastShot > shootDelay && gameRunning && !paused) {
        bullets.push({ x: player.x + 30, y: player.y, speed: 9 });
        lastShot = now;
    }
}

document.addEventListener("keydown", e => {
    if (e.key === " ") shoot();
});

// ENEMIES
let enemies = [];

function spawnEnemies() {
    enemies = [];
    for (let i = 0; i < 5; i++) {
        enemies.push({
            x: Math.random() * 300 + 650,
            y: Math.random() * (canvas.height - 100) + 50,
            size: 25,
            speed: (Math.random() * 1.5) + 0.5,
            dir: Math.random() < 0.5 ? -1 : 1
        });
    }
}

// STARFIELD
let stars = [];
for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 1 + 0.5
    });
}

// GAME TIMER
let timerInterval = null;

function startTimer() {
    gameTime = 30;
    document.getElementById("timer").textContent = gameTime;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!paused && gameRunning && gameTime > 0) {
            gameTime--;
            document.getElementById("timer").textContent = gameTime;
        }

        if (gameTime <= 0 && !gameOver) {
            gameOver = true;
            endGame();
        }
    }, 1000);
}

// END GAME
function endGame() {
    paused = true;
    clearInterval(timerInterval);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("shooterHighScore", highScore);
        document.getElementById("highScore").textContent = highScore;
        document.getElementById("highScoreTop").textContent = highScore;
    }

    pauseScreen.classList.remove("hidden");
    document.getElementById("pauseTitle").textContent = "GAME OVER";
}

// MAIN GAME LOOP
function update() {
    if (!gameRunning || paused) return;

    // Background stars
    stars.forEach(s => {
        s.x -= s.speed;
        if (s.x < 0) {
            s.x = canvas.width;
            s.y = Math.random() * canvas.height;
        }
    });

    // Player movement
    if (keys["ArrowUp"]) player.y -= player.speed;
    if (keys["ArrowDown"]) player.y += player.speed;
    player.y = Math.max(30, Math.min(canvas.height - 30, player.y));

    // Bullets
    bullets.forEach(b => b.x += b.speed);
    bullets = bullets.filter(b => b.x < canvas.width);

    // Enemies
    enemies.forEach(e => {
        e.y += e.speed * e.dir;
        if (e.y < 50 || e.y > canvas.height - 50) e.dir *= -1;
    });

    // Collision
    enemies.forEach((enemy, i) => {
        bullets.forEach((b, j) => {
            if (Math.abs(b.x - enemy.x) < 25 && Math.abs(b.y - enemy.y) < 25) {
                score++;
                document.getElementById("score").textContent = score;

                bullets.splice(j, 1);

                enemy.x = Math.random() * 300 + 650;
                enemy.y = Math.random() * (canvas.height - 100) + 50;
            }
        });
    });

    draw();
    requestAnimationFrame(update);
}

// DRAW EVERYTHING
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = "white";
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Player
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(player.x - 20, player.y + 20);
    ctx.lineTo(player.x - 20, player.y - 20);
    ctx.fill();

    // Bullets
    ctx.fillStyle = "red";
    bullets.forEach(b => ctx.fillRect(b.x, b.y - 2, 10, 4));

    // Enemies
    ctx.fillStyle = "purple";
    enemies.forEach(e => {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i;
            const px = e.x + Math.cos(angle) * e.size;
            const py = e.y + Math.sin(angle) * e.size;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    });
}

// START GAME
startBtn.onclick = () => {
    homeScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    canvas.classList.remove("hidden");

    gameRunning = true;
    paused = false;
    gameOver = false;
    score = 0;

    document.getElementById("score").textContent = score;
    document.getElementById("highScoreTop").textContent = highScore;

    spawnEnemies();
    startTimer();
    update();
};

// PAUSE
pauseBtn.onclick = () => {
    paused = true;
    pauseScreen.classList.remove("hidden");
    document.getElementById("pauseTitle").textContent = "PAUSED";
};

// CONTINUE
continueBtn.onclick = () => {
    paused = false;
    pauseScreen.classList.add("hidden");
    update();
};

// EXIT
exitBtn.onclick = () => {
    paused = false;
    gameRunning = false;

    pauseScreen.classList.add("hidden");
    hud.classList.add("hidden");
    canvas.classList.add("hidden");
    homeScreen.classList.remove("hidden");
};
