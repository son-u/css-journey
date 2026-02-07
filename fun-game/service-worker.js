const CACHE_NAME = 'valentine-game-v15';
const ASSETS = [
    './',
    './index.html',
    './valentine.html',
    './snake.html',
    './style.css',
    './script.js',
    './snake-style.css',
    './snake-script.js',
    'assets/hero.gif',
    'https://media.tenor.com/gUiu1zyxfzYAAAAi/bear-kiss-bear-kisses.gif',
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2764.png',
    'assets/faaah.mp3',
    'assets/fart.mp3',
    'assets/bubble-burst-swoosh.mp3',
    'assets/yay.mp3',
    'assets/food.jpeg'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS);
            })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
