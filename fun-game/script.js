// Game Logic
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const question = document.getElementById('question');
const mainImage = document.getElementById('main-image');
const gameContent = document.getElementById('game-content');
const successContent = document.getElementById('success-content');

const noBtnRect = noBtn.getBoundingClientRect();

// Runaway Button Logic
let isRunning = false;
let yesBtnFontSize = 1.2; // rem
let yesBtnPadding = 12; // px

// Web Audio API Context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function unlockAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    // Remove listeners once unlocked
    document.body.removeEventListener('click', unlockAudio);
    document.body.removeEventListener('touchstart', unlockAudio);
    document.body.removeEventListener('keydown', unlockAudio);
}

document.body.addEventListener('click', unlockAudio);
document.body.addEventListener('touchstart', unlockAudio);
document.body.addEventListener('keydown', unlockAudio);

const buffers = {
    no: null,
    burst: null,
    success: null
};

async function loadSound(url, key) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        buffers[key] = audioBuffer;
    } catch (error) {
        console.error(`Error loading sound ${key}:`, error);
    }
}

// Preload sounds
loadSound('assets/faaah.mp3', 'no');
loadSound('assets/bubble-burst-swoosh.mp3', 'burst');
loadSound('assets/yay.mp3', 'success');

function playSound(key) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (buffers[key]) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffers[key];
        source.connect(audioCtx.destination);
        source.start(0);
    }
}

function moveNoButton() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;

    // Play Sound
    // Play Sound
    playSound('no');

    // Increase Yes button size
    yesBtnFontSize *= 1.3;
    yesBtnPadding *= 1.2;
    yesBtnFontSize *= 1.3;
    yesBtnPadding *= 1.2;
    yesBtn.style.fontSize = `${yesBtnFontSize}rem`;
    yesBtn.style.padding = `${yesBtnPadding}px ${yesBtnPadding * 2}px`;

    // Check if Yes button is too big (covers > 70% of screen width)
    if (yesBtn.offsetWidth > windowWidth * 0.7) {
        // Reset Logic
        yesBtnFontSize = 1.2;
        yesBtnPadding = 12;
        yesBtn.style.fontSize = `${yesBtnFontSize}rem`;
        yesBtn.style.padding = `${yesBtnPadding}px ${yesBtnPadding * 2}px`;

        // Play Burst Sound
        // Play Burst Sound
        playSound('burst');

        // Visual Burst
        yesBtn.classList.add('resetting');
        setTimeout(() => {
            yesBtn.classList.remove('resetting');
        }, 400);

        // Confetti Burst from button center
        if (typeof confetti === 'function') {
            const rect = yesBtn.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / windowWidth;
            const y = (rect.top + rect.height / 2) / windowHeight;
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { x, y },
                colors: ['#ff4d4d', '#ffe6e6', '#ffffff'] // Theme colors
            });
        }
    }

    // First time interaction: Initialize position matching current static placement
    if (!isRunning) {
        isRunning = true;
        const rect = noBtn.getBoundingClientRect();

        // Set inline styles to match current position so it doesn't jump visualy
        noBtn.style.left = `${rect.left}px`;
        noBtn.style.top = `${rect.top}px`;

        // Add class to switch to fixed positioning and enable transition
        noBtn.classList.add('running');

        // Trigger impact animation
        noBtn.classList.add('impacting');
        setTimeout(() => {
            noBtn.classList.remove('impacting');
        }, 300);

       
        setTimeout(() => {
            setRandomPosition(windowWidth, windowHeight, btnWidth, btnHeight);
        }, 50);
    } else {
        // Trigger impact animation
        noBtn.classList.add('impacting');
        setTimeout(() => {
            noBtn.classList.remove('impacting');
        }, 300);

        setRandomPosition(windowWidth, windowHeight, btnWidth, btnHeight);
    }
}

function setRandomPosition(windowWidth, windowHeight, btnWidth, btnHeight) {
    // Calculate random position within viewport
    // Ensure button stays fully visible
    const randomX = Math.random() * (windowWidth - btnWidth);
    const randomY = Math.random() * (windowHeight - btnHeight);

    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;

    // Add z-index to ensure it stays on top
    noBtn.style.zIndex = '100';
}

noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default click action just in case
    moveNoButton();
});

yesBtn.addEventListener('click', () => {
    // Hide game content
    gameContent.classList.add('hidden');

   
    successContent.classList.remove('hidden');

    
    playSound('success');

    // Trigger confetti
    triggerConfetti();
});

function triggerConfetti() {
    // Trigger canvas confetti
    if (typeof confetti === 'function') {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const random = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }
}

// Background Hearts Generation
function createHearts() {
    const heartsContainer = document.querySelector('.hearts-container');
    const heartCount = 20;

    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 5 + 5 + 's'; // 5-10s
        heart.style.animationDelay = Math.random() * 10 + 's';
        heart.style.fontSize = Math.random() * 10 + 20 + 'px';
        heartsContainer.appendChild(heart);
    }
}

createHearts();


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// GIF Loop Hack
const gifDuration = 3500; 
setInterval(() => {
    
    if (!gameContent.classList.contains('hidden')) {
        const currentSrc = mainImage.src.split('?')[0];
        mainImage.src = `${currentSrc}?t=${Date.now()}`;
    }
}, gifDuration);
