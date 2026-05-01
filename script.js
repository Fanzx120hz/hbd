// ----- ELEMEN DOM -----
const screens = {
    amplop: document.getElementById('amplopScreen'),
    cake: document.getElementById('cakeScreen'),
    cut: document.getElementById('cutScreen'),
    message: document.getElementById('messageScreen')
};

const envelopeDiv = document.querySelector('.envelope');
const blowBtn = document.getElementById('blowBtn');
const cutBtn = document.getElementById('cutBtn');
const replayBtn = document.getElementById('replayBtn');
const flame = document.getElementById('flame');
const cakeWhole = document.getElementById('cakeWhole');
const blowText = document.getElementById('blowText');

// Canvas kembang api
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
let fireworks = [];
let particles = [];
let animationId = null;
let isFireworksActive = false;

// Ukuran canvas responsif
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ----- FUNGSI KEMBANG API -----
class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.speed = 5;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.radius = 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 65%)`;
        this.exploded = false;
    }
    
    update() {
        if (!this.exploded) {
            this.x += this.vx;
            this.y += this.vy;
            const dx = this.x - this.targetX;
            const dy = this.y - this.targetY;
            if (Math.hypot(dx, dy) < 8) {
                this.exploded = true;
                createExplosion(this.targetX, this.targetY);
                return false;
            }
        }
        return true;
    }
    
    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

function createExplosion(x, y) {
    const particleCount = 50 + Math.floor(Math.random() * 40);
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push({
            x: x, y: y, vx: vx, vy: vy,
            life: 1, maxLife: 0.8 + Math.random() * 0.6,
            color: `hsl(${Math.random() * 360}, 100%, 60%)`,
            size: 3 + Math.random() * 4
        });
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function drawParticles() {
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function animateFireworks() {
    if (!isFireworksActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let anyAlive = false;
    
    for (let i = 0; i < fireworks.length; i++) {
        const alive = fireworks[i].update();
        fireworks[i].draw();
        if (alive) anyAlive = true;
        else {
            fireworks.splice(i, 1);
            i--;
        }
    }
    
    updateParticles();
    drawParticles();
    
    if (fireworks.length > 0 || particles.length > 0) {
        animationId = requestAnimationFrame(animateFireworks);
    } else {
        isFireworksActive = false;
        if (animationId) cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function startFireworks() {
    if (isFireworksActive) {
        fireworks = [];
        particles = [];
        if (animationId) cancelAnimationFrame(animationId);
    }
    isFireworksActive = true;
    
    const centerX = canvas.width / 2;
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            if (isFireworksActive) {
                const randX = 50 + Math.random() * (canvas.width - 100);
                const randY = 80 + Math.random() * (canvas.height - 150);
                const startX = centerX + (Math.random() - 0.5) * 150;
                const startY = canvas.height - 20;
                fireworks.push(new Firework(startX, startY, randX, randY));
                if (!animationId) animateFireworks();
            }
        }, i * 120);
    }
}

// ----- BUKA AMPLOP -----
let isOpened = false;

function openEnvelope() {
    if (isOpened) return;
    isOpened = true;
    envelopeDiv.classList.add('open');
    const heartDiv = document.querySelector('.heart');
    if (heartDiv) heartDiv.innerHTML = '❤️🎂❤️';
    startFireworks();
    setTimeout(() => {
        showScreen('cake');
    }, 800);
}

// ----- TIUP LILIN -----
let candleBlown = false;

function blowCandle() {
    if (candleBlown) return;
    candleBlown = true;
    flame.classList.add('hide');
    blowText.innerHTML = '🎉 Lilin Padam! Saatnya potong kue 🎉';
    blowBtn.style.opacity = '0.5';
    blowBtn.disabled = true;
    startFireworks();
    setTimeout(() => {
        showScreen('cut');
    }, 1500);
}

// ----- POTONG KUE -----
let cutDone = false;

function cutCake() {
    if (cutDone) return;
    cutDone = true;
    cakeWhole.classList.add('cut');
    startFireworks();
    setTimeout(() => {
        showScreen('message');
    }, 800);
}

// ----- PINDAH LAYAR -----
function showScreen(screenName) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

// ----- RESET SEMUA -----
function resetBirthday() {
    isOpened = false;
    candleBlown = false;
    cutDone = false;
    
    if (flame) flame.classList.remove('hide');
    if (blowBtn) {
        blowBtn.disabled = false;
        blowBtn.style.opacity = '1';
        blowText.innerHTML = '🎂 Tiup lilinnya! 🎂';
    }
    if (cakeWhole) cakeWhole.classList.remove('cut');
    if (envelopeDiv) envelopeDiv.classList.remove('open');
    
    const heartDiv = document.querySelector('.heart');
    if (heartDiv) heartDiv.innerHTML = '🎁';
    
    showScreen('amplop');
    isFireworksActive = false;
    fireworks = [];
    particles = [];
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ----- EVENT LISTENER -----
if (envelopeDiv) envelopeDiv.addEventListener('click', openEnvelope);
if (blowBtn) blowBtn.addEventListener('click', blowCandle);
if (cutBtn) cutBtn.addEventListener('click', cutCake);
if (replayBtn) replayBtn.addEventListener('click', resetBirthday);

// Inisialisasi
showScreen('amplop');