// ── Canvas & context ──────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx    = canvas.getContext('2d');

// Resize canvas to fill the viewport on load and whenever the window resizes.
function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ── Desktop warning ───────────────────────────────────────────────────────────
// Show if the screen is wider than a typical phone in portrait mode (600 px).
// The warning is dismissible — the player can still choose to play.
const MOBILE_MAX_WIDTH  = 600;
const desktopWarning    = document.getElementById('desktop-warning');
const warningDismissBtn = document.getElementById('warning-dismiss');

if (window.innerWidth > MOBILE_MAX_WIDTH) {
    desktopWarning.classList.add('visible');
}
warningDismissBtn.addEventListener('click', () => {
    desktopWarning.classList.remove('visible');
});

// ── Game constants ────────────────────────────────────────────────────────────
const MAX_LIVES        = 3;       // hearts the player starts with
const ORB_RADIUS       = 36;      // pixels — base tap target size
const BASE_ORB_LIFE    = 2.2;     // seconds before an unshot orb expires at score 0
const MIN_ORB_LIFE     = 0.85;    // minimum orb lifetime at max difficulty
const BASE_SPAWN_RATE  = 1.1;     // seconds between spawns at score 0
const MIN_SPAWN_RATE   = 0.22;    // minimum spawn interval at max difficulty
const DIFFICULTY_CAP   = 35;      // score at which max difficulty is reached
const MAX_ORBS         = 14;      // hard cap on simultaneous orbs
const HUD_HEIGHT       = 54;      // pixels reserved at top for lives/score

// Orb colour palette — each entry has a fill colour and a matching glow hex string.
const ORB_COLOURS = [
    { fill: '#00ffee', glow: '#00ffee' },
    { fill: '#ff44aa', glow: '#ff44aa' },
    { fill: '#ffaa44', glow: '#ffaa44' },
    { fill: '#44ff88', glow: '#44ff88' },
    { fill: '#9966ff', glow: '#9966ff' },
];

// ── Game state ────────────────────────────────────────────────────────────────
// state: 'start' | 'playing' | 'gameover'
let state      = 'start';
let score      = 0;
let lives      = MAX_LIVES;
let orbs       = [];       // active orb objects
let spawnTimer = 0;        // seconds until next orb spawn
let last       = 0;        // timestamp of previous frame (ms)

// ── DOM elements ─────────────────────────────────────────────────────────────
const livesEl        = document.getElementById('lives');
const scoreEl        = document.getElementById('score');
const startScreen    = document.getElementById('start-screen');
const gameoverScreen = document.getElementById('gameover-screen');
const finalScoreEl   = document.getElementById('final-score');

// ── Difficulty helpers ────────────────────────────────────────────────────────
// Returns a 0–1 difficulty factor based on current score.
function difficulty() {
    return Math.min(score / DIFFICULTY_CAP, 1);
}

// Returns how long (seconds) a newly spawned orb lives before expiring.
function orbLifetime() {
    return BASE_ORB_LIFE - difficulty() * (BASE_ORB_LIFE - MIN_ORB_LIFE);
}

// Returns the current interval (seconds) between orb spawns.
function spawnInterval() {
    return BASE_SPAWN_RATE - difficulty() * (BASE_SPAWN_RATE - MIN_SPAWN_RATE);
}

// ── Orb factory ───────────────────────────────────────────────────────────────
// Creates a new orb at a random position, avoiding the HUD strip at the top.
function spawnOrb() {
    const pad    = ORB_RADIUS + 12;
    const colour = ORB_COLOURS[Math.floor(Math.random() * ORB_COLOURS.length)];
    orbs.push({
        x:        pad + Math.random() * (canvas.width  - pad * 2),
        y:        HUD_HEIGHT + pad + Math.random() * (canvas.height - HUD_HEIGHT - pad * 2),
        r:        ORB_RADIUS,
        age:      0,             // seconds elapsed since spawn
        lifetime: orbLifetime(),
        colour,
        hit:      false,         // true once the player taps the orb
        hitScale: 1,             // grows > 1 during the pop animation
    });
}

// ── HUD update ────────────────────────────────────────────────────────────────
// Renders the current lives and score into the HUD elements above the canvas.
function updateHUD() {
    livesEl.textContent = '♥ '.repeat(lives).trim();
    scoreEl.textContent = score;
}

// ── Game start / reset ────────────────────────────────────────────────────────
// Resets all state and transitions from the start or gameover screen to playing.
function startGame() {
    state      = 'playing';
    score      = 0;
    lives      = MAX_LIVES;
    orbs       = [];
    spawnTimer = 0;
    startScreen.style.display    = 'none';
    gameoverScreen.style.display = 'none';
    updateHUD();
}

// ── Game over ─────────────────────────────────────────────────────────────────
// Shows the game-over overlay with the final score.
function endGame() {
    state = 'gameover';
    finalScoreEl.textContent     = score + (score === 1 ? ' orb' : ' orbs');
    gameoverScreen.style.display = 'flex';
}

// ── Orb drawing ───────────────────────────────────────────────────────────────
// Draws a single orb onto the canvas.
// Unshot orbs shrink slightly and show a countdown ring as they age.
// Hit orbs expand and fade out during the pop animation.
function drawOrb(orb) {
    const progress = orb.age / orb.lifetime; // 0 (fresh) → 1 (about to expire)

    let radius, alpha;
    if (orb.hit) {
        // Pop animation: expand from original size to 2× while fading out.
        radius = orb.r * orb.hitScale;
        alpha  = Math.max(0, 1 - (orb.hitScale - 1) / 1);
    } else {
        // Unshot: shrink slightly as the orb ages (95% → 68% of original).
        radius = orb.r * (0.95 - progress * 0.27);
        alpha  = 1 - progress * 0.35;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Soft radial glow behind the orb.
    const glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, radius * 2);
    glow.addColorStop(0, orb.colour.glow + '55');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, radius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core glowing ring.
    ctx.shadowBlur  = 16;
    ctx.shadowColor = orb.colour.glow;
    ctx.strokeStyle = orb.colour.fill;
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Countdown arc — sweeps from full circle (fresh) to nothing (expiring).
    // Only drawn while the orb is unshot and has more than 5% life remaining.
    if (!orb.hit && progress < 0.95) {
        ctx.shadowBlur  = 6;
        ctx.strokeStyle = orb.colour.fill + 'aa';
        ctx.lineWidth   = 3.5;
        ctx.beginPath();
        ctx.arc(
            orb.x, orb.y,
            radius + 8,
            -Math.PI / 2,
            -Math.PI / 2 + (1 - progress) * Math.PI * 2
        );
        ctx.stroke();
    }

    ctx.restore();
}

// ── Main loop ─────────────────────────────────────────────────────────────────
// Runs every animation frame. Spawns orbs, ages them, draws them.
function loop(now) {
    requestAnimationFrame(loop);

    const dt = Math.min((now - last) / 1000, 0.05); // cap at 50 ms to avoid death on tab switch
    last = now;

    // Clear canvas each frame.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state !== 'playing') return;

    // ── Spawn ──
    spawnTimer -= dt;
    if (spawnTimer <= 0 && orbs.length < MAX_ORBS) {
        spawnOrb();
        spawnTimer = spawnInterval();
    }

    // ── Update and draw each orb ──
    for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i];

        if (orb.hit) {
            // Advance pop animation; remove orb once it has fully expanded.
            orb.hitScale += dt * 3.5;
            if (orb.hitScale >= 2) {
                orbs.splice(i, 1);
                continue;
            }
        } else {
            // Age the orb; remove it and cost the player a life if it expires.
            orb.age += dt;
            if (orb.age >= orb.lifetime) {
                orbs.splice(i, 1);
                lives = Math.max(0, lives - 1);
                updateHUD();
                if (lives === 0) { endGame(); return; }
                continue;
            }
        }

        drawOrb(orb);
    }
}

// ── Input handling ────────────────────────────────────────────────────────────
// A single tap/click either starts/restarts the game or attempts to hit an orb.
function handleTap(x, y) {
    if (state === 'start' || state === 'gameover') {
        startGame();
        return;
    }

    // Test orbs from the topmost (last-drawn) downward so overlapping orbs
    // are hit in the visually expected order.
    for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i];
        if (orb.hit) continue;
        const dx = x - orb.x;
        const dy = y - orb.y;
        // Slightly enlarged hit radius (1.15×) makes touch feel fair on small screens.
        if (dx * dx + dy * dy <= (orb.r * 1.15) * (orb.r * 1.15)) {
            orb.hit      = true;
            orb.hitScale = 1;
            score++;
            updateHUD();
            break; // one tap hits at most one orb
        }
    }
}

// Touch — use changedTouches[0] so multi-touch works correctly.
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect  = canvas.getBoundingClientRect();
    handleTap(touch.clientX - rect.left, touch.clientY - rect.top);
}, { passive: false });

// Mouse fallback for desktop play.
canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    handleTap(e.clientX - rect.left, e.clientY - rect.top);
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
updateHUD();
requestAnimationFrame(loop);
