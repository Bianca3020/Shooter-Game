// ====================
// GAME INITIALIZATION
// ====================

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let gameRunning = true;
let gameTime = 90; // 1 minute 30 seconds in seconds
let timerInterval;
const TARGET_SCORE = 30;
const TIME_LIMIT = 90; // 1:30 in seconds

// DOM Elements
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const finalScoreElement = document.getElementById('finalScore');
const finalTimeElement = document.getElementById('finalTime');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverTitle = document.getElementById('gameOverTitle');
const resultMessage = document.getElementById('resultMessage');
const restartButton = document.getElementById('restartButton');

// Player object (blue triangle)
const player = {
    x: 100,
    y: canvas.height / 2,
    size: 30,
    speed: 6,
    color: '#3498db'
};

// Enemy object (purple pentagon)
const enemy = {
    x: canvas.width - 150,
    y: canvas.height / 2,
    size: 40,
    color: '#9b59b6',
    alive: true
};

// Bullets array
const bullets = [];
const bulletSpeed = 8;
const bulletRadius = 8;

// Particles array for explosion effects
const particles = [];

// Keyboard state
const keys = {};

// ====================
// TIMER FUNCTIONS
// ====================

function startTimer() {
    gameTime = TIME_LIMIT;
    updateTimerDisplay();
    
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerInterval = setInterval(() => {
        if (gameRunning) {
            gameTime--;
            updateTimerDisplay();
            
            // Check if time is up
            if (gameTime <= 0) {
                gameTime = 0;
                updateTimerDisplay();
                gameOver(false); // Time's up, didn't reach 30 points
            }
            
            // Change timer color when time is running out
            if (gameTime <= 10) {
                timerElement.style.color = '#ff5555';
                timerElement.style.animation = 'pulse 1s infinite';
            } else if (gameTime <= 30) {
                timerElement.style.color = '#ffaa00';
            } else {
                timerElement.style.color = '#ffaa00';
                timerElement.style.animation = 'none';
            }
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerElement.textContent = formattedTime;
}

// ====================
// SCORE FUNCTIONS
// ====================

function updateScoreDisplay() {
    scoreElement.textContent = score;
    
    // Check if target score reached
    if (score >= TARGET_SCORE) {
        gameOver(true); // Won the game
    }
    
    // Update score color based on progress
    const progress = score / TARGET_SCORE;
    if (progress >= 1) {
        scoreElement.style.color = '#4aff4a';
    } else if (progress >= 0.7) {
        scoreElement.style.color = '#ffaa00';
    } else {
        scoreElement.style.color = '#4aff4a';
    }
}

// ====================
// GAME OVER FUNCTIONS
// ====================

function gameOver(isWin) {
    gameRunning = false;
    stopTimer();
    
    // Update game over screen
    if (isWin) {
        gameOverTitle.textContent = "🎉 VICTORY!";
        gameOverTitle.className = "win";
        resultMessage.textContent = "You scored 30 points in time!";
    } else {
        gameOverTitle.textContent = "💀 GAME OVER";
        gameOverTitle.className = "lose";
        resultMessage.textContent = "Time's up! You needed 30 points.";
    }
    
    // Update final stats
    finalScoreElement.textContent = score;
    finalTimeElement.textContent = timerElement.textContent;
    
    // Show game over screen
    gameOverScreen.classList.remove('hidden');
    
    console.log(isWin ? "🎉 VICTORY!" : "💀 GAME OVER");
    console.log("Final Score:", score, "/", TARGET_SCORE);
    console.log("Time Remaining:", timerElement.textContent);
}

// ====================
// EVENT LISTENERS
// ====================

// Keyboard controls
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Shoot with SPACE
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (gameRunning) {
            shootBullet();
        }
    }
    
    // Restart game with R key
    if (e.key === 'r' || e.key === 'R') {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Restart button
restartButton.addEventListener('click', restartGame);

// ====================
// GAME FUNCTIONS
// ====================

// Shoot bullet function
function shootBullet() {
    bullets.push({
        x: player.x + player.size,
        y: player.y,
        radius: bulletRadius,
        color: '#e74c3c'
    });
}

// Create explosion particles
function createParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1.0,
            color: enemy.color
        });
    }
}

// Draw triangle (player)
function drawTriangle(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x - size/2, y - size);
    ctx.lineTo(x - size/2, y + size);
    ctx.closePath();
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw pentagon (enemy)
function drawPentagon(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Draw bullet (circle)
function drawBullet(bullet) {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = bullet.color;
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Draw particles
function drawParticles() {
    particles.forEach((p, index) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Update particle
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Check collision between bullet and enemy
function checkCollision(bullet, enemy) {
    const dx = bullet.x - enemy.x;
    const dy = bullet.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < bullet.radius + enemy.size;
}

// Respawn enemy at random position
function respawnEnemy() {
    enemy.alive = true;
    enemy.y = Math.random() * (canvas.height - 100) + 50;
}

// Draw background grid
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

// ====================
// GAME UPDATE LOGIC
// ====================

function update() {
    if (!gameRunning) return;
    
    // Move player based on keyboard input
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x += player.speed;
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y += player.speed;
    }
    
    // Keep player on left half of screen
    player.x = Math.max(player.size, Math.min(canvas.width / 2 - 50, player.x));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
    
    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.x += bulletSpeed;
        
        // Remove bullet if off screen
        if (bullet.x > canvas.width) {
            bullets.splice(index, 1);
        }
        
        // Check collision with enemy
        if (enemy.alive && checkCollision(bullet, enemy)) {
            score++;
            updateScoreDisplay();
            bullets.splice(index, 1);
            createParticles(enemy.x, enemy.y);
            enemy.alive = false;
            
            // Respawn enemy after delay
            setTimeout(respawnEnemy, 300);
        }
    });
}

// ====================
// GAME RENDER
// ====================

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    drawGrid();
    
    // Draw player (blue triangle)
    drawTriangle(player.x, player.y, player.size, player.color);
    
    // Draw enemy (purple pentagon) if alive
    if (enemy.alive) {
        drawPentagon(enemy.x, enemy.y, enemy.size, enemy.color);
    }
    
    // Draw all bullets
    bullets.forEach(bullet => {
        drawBullet(bullet);
    });
    
    // Draw particles
    drawParticles();
    
    // Draw score progress and timer warning
    drawGameUI();
}

// Draw game UI elements
function drawGameUI() {
    // Score progress bar
    const progressWidth = (score / TARGET_SCORE) * 300;
    
    // Progress bar background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(canvas.width - 320, 20, 300, 20);
    
    // Progress bar fill
    const progressColor = score >= TARGET_SCORE ? '#4aff4a' : 
                         (score >= TARGET_SCORE * 0.7 ? '#ffaa00' : '#4a4aff');
    ctx.fillStyle = progressColor;
    ctx.fillRect(canvas.width - 320, 20, progressWidth, 20);
    
    // Progress bar border
    ctx.strokeStyle = '#4a4aff';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width - 320, 20, 300, 20);
    
    // Progress text
    ctx.fillStyle = '#fff';
    ctx.font = '16px Courier New';
    ctx.fillText(`Score: ${score}/${TARGET_SCORE}`, canvas.width - 310, 35);
    
    // Timer warning when time is low
    if (gameTime <= 10 && gameRunning) {
        ctx.fillStyle = 'rgba(255, 85, 85, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff5555';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(`HURRY! ${gameTime}s`, canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
    
    // Draw time remaining text on canvas
    ctx.fillStyle = gameTime <= 30 ? '#ffaa00' : '#4aff4a';
    ctx.font = '20px Courier New';
    ctx.fillText(`Time: ${timerElement.textContent}`, 20, 40);
}

// ====================
// GAME RESTART
// ====================

function restartGame() {
    // Reset game state
    gameRunning = true;
    score = 0;
    
    // Reset player position
    player.x = 100;
    player.y = canvas.height / 2;
    
    // Reset enemy
    enemy.alive = true;
    enemy.y = canvas.height / 2;
    
    // Clear arrays
    bullets.length = 0;
    particles.length = 0;
    
    // Update displays
    updateScoreDisplay();
    
    // Reset timer display color
    timerElement.style.color = '#ffaa00';
    timerElement.style.animation = 'none';
    
    // Restart timer
    startTimer();
    
    // Hide game over screen
    gameOverScreen.classList.add('hidden');
    
    console.log("🔄 Game restarted!");
}

// ====================
// GAME LOOP
// ====================

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ====================
// START GAME
// ====================

// Initialize game
function init() {
    // Start timer
    startTimer();
    
    // Update initial displays
    updateScoreDisplay();
    
    // Add CSS animation for timer warning
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Start game loop
    gameLoop();
    
    console.log("Space Shooter Game Ready!");
    console.log(`Target: ${TARGET_SCORE} points in ${TIME_LIMIT} seconds`);
    console.log("Controls: W/A/S/D to move, SPACE to shoot, R to restart");
}

// Start game when page loads
window.addEventListener('load', init);

// Debug functions
window.debugGame = function() {
    console.log("=== DEBUG INFO ===");
    console.log("Score:", score, "/", TARGET_SCORE);
    console.log("Time Remaining:", gameTime, "seconds");
    console.log("Game Running:", gameRunning);
    console.log("Bullets:", bullets.length);
    console.log("Particles:", particles.length);
};