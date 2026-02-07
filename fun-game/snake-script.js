const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score');
const pauseScreen = document.getElementById('pause-screen');


let GRID_SIZE = 20; 
let TILE_SIZE = 0; 
const GAME_SPEED = 150; 


let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoopId;
let isPaused = false;
let isGameRunning = false;


const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();


const foodImg = new Image();
foodImg.src = 'assets/food.jpeg';


const eatSound = new Audio('assets/faaah.mp3');

const collisionSound = new Audio('assets/fart.mp3');

function playTone(freq, type = 'sine', duration = 0.1) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Initialization
function init() {
    highScoreElement.textContent = highScore;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('keydown', handleKeyDown);
    initTouchControls();

    // UI Event Listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('resume-btn').addEventListener('click', togglePause);

    // Toggle pause on canvas tap
    canvas.addEventListener('click', () => {
        if (isGameRunning) togglePause();
    });
}

function resizeCanvas() {
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

   
    const reservedHeight = 130;
    const availableHeight = viewportHeight - reservedHeight;

    
    const widthBasedSize = Math.min(viewportWidth * 0.92, 450);
    const heightBasedSize = availableHeight * 0.95;

    const maxSize = Math.min(widthBasedSize, heightBasedSize);

    
    TILE_SIZE = Math.floor(maxSize / GRID_SIZE);
    const canvasSize = TILE_SIZE * GRID_SIZE;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    canvas.style.maxWidth = canvasSize + 'px';

    if (!isGameRunning && score === 0) {
        draw();
    }
}

function startGame() {
    // Reset State
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    direction = 'right';
    nextDirection = 'right';
    isGameRunning = true;
    isPaused = false;

    scoreElement.textContent = score;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');

    placeFood();

    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(gameLoop, GAME_SPEED);
}

function togglePause() {
    if (!isGameRunning) return;

    isPaused = !isPaused;

    if (isPaused) {
        clearInterval(gameLoopId);
        pauseScreen.classList.remove('hidden');
    } else {
        pauseScreen.classList.add('hidden');
        gameLoopId = setInterval(gameLoop, GAME_SPEED);
    }
}

function gameOver() {
    clearInterval(gameLoopId);
    isGameRunning = false;

    collisionSound.currentTime = 0;
    collisionSound.play().catch(() => { }); 

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }

    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function placeFood() {
    let valid = false;
    while (!valid) {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };

        valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function gameLoop() {
    update();
    draw();
}

function update() {
    // Move Snake
    const head = { ...snake[0] };
    direction = nextDirection;

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Wrap Around Logic
    if (head.x < 0) head.x = GRID_SIZE - 1;
    if (head.x >= GRID_SIZE) head.x = 0;
    if (head.y < 0) head.y = GRID_SIZE - 1;
    if (head.y >= GRID_SIZE) head.y = 0;

    // Check Collision (Self)
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check Food
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreElement.textContent = score;
        eatSound.currentTime = 0;
        eatSound.play().catch(() => { }); // Play sound, ignore errors
        placeFood();
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.fillStyle = '#1a1a1d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    let sizeMultiplier = Math.min(1.4 + (score * 0.05), 2.0);
    let currentFoodSize = TILE_SIZE * sizeMultiplier;

   
    if (foodImg.complete) {
        ctx.save();

        
        const foodCenterX = food.x * TILE_SIZE + TILE_SIZE / 2;
        const foodCenterY = food.y * TILE_SIZE + TILE_SIZE / 2;

        
        ctx.beginPath();
        const radius = currentFoodSize / 2;
        ctx.arc(foodCenterX, foodCenterY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        
        ctx.drawImage(
            foodImg,
            foodCenterX - radius,
            foodCenterY - radius,
            currentFoodSize,
            currentFoodSize
        );
        ctx.restore();
    } else {
        ctx.fillStyle = '#ff4d6d';
        ctx.beginPath();
        const foodCenterX = food.x * TILE_SIZE + TILE_SIZE / 2;
        const foodCenterY = food.y * TILE_SIZE + TILE_SIZE / 2;
        const radius = (currentFoodSize / 2) - 1;
        ctx.arc(foodCenterX, foodCenterY, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Glow effect (keep it subtle)
    ctx.shadowColor = '#ff4d6d';
    ctx.shadowBlur = 5;
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00cec9' : '#00b894';
        const padding = 1;
        ctx.fillRect(
            segment.x * TILE_SIZE + padding,
            segment.y * TILE_SIZE + padding,
            TILE_SIZE - padding * 2,
            TILE_SIZE - padding * 2
        );

        if (index === 0) {
            ctx.fillStyle = '#1a1a1d';
            // Simple eyes could be added here
        }
    });
}

function handleKeyDown(e) {
    if (!isGameRunning) return;

    const key = e.key;
    if ((key === 'ArrowUp' || key === 'w') && direction !== 'down') nextDirection = 'up';
    if ((key === 'ArrowDown' || key === 's') && direction !== 'up') nextDirection = 'down';
    if ((key === 'ArrowLeft' || key === 'a') && direction !== 'right') nextDirection = 'left';
    if ((key === 'ArrowRight' || key === 'd') && direction !== 'left') nextDirection = 'right';
}

function initTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let hasMoved = false;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
        hasMoved = false;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isGameRunning || isPaused) return;

        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const threshold = 15;

        if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
            hasMoved = true;
        }

        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > threshold) {
                if (dx > 0 && direction !== 'left') {
                    nextDirection = 'right';
                    touchStartX = touchEndX;
                    touchStartY = touchEndY;
                } else if (dx < 0 && direction !== 'right') {
                    nextDirection = 'left';
                    touchStartX = touchEndX;
                    touchStartY = touchEndY;
                }
            }
        } else {
            if (Math.abs(dy) > threshold) {
                if (dy > 0 && direction !== 'up') {
                    nextDirection = 'down';
                    touchStartX = touchEndX;
                    touchStartY = touchEndY;
                } else if (dy < 0 && direction !== 'down') {
                    nextDirection = 'up';
                    touchStartX = touchEndX;
                    touchStartY = touchEndY;
                }
            }
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;

        
        if (!hasMoved && touchDuration < 300 && isGameRunning) {
            togglePause();
        }
    }, { passive: false });
}

init();
