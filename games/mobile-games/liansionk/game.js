// ── Canvas & context ──────────────────────────────────────────────────────────
const canvas   = document.getElementById('game-canvas');
const ctx      = canvas.getContext('2d');
const gameArea = document.getElementById('game-area');

// Resize the canvas to exactly fill its parent div every time the window changes.
function resize() {
    canvas.width  = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;
    buildPlatforms();   // rebuild platform positions from new canvas size
}

// ── Desktop warning ───────────────────────────────────────────────────────────
// Show a dismissible warning if the viewport is wider than a typical phone.
const MOBILE_MAX_WIDTH  = 600;
const desktopWarning    = document.getElementById('desktop-warning');
const warningDismissBtn = document.getElementById('warning-dismiss');

if (window.innerWidth > MOBILE_MAX_WIDTH) {
    desktopWarning.classList.add('visible');
}
warningDismissBtn.addEventListener('click', () => {
    desktopWarning.classList.remove('visible');
});

// ── Input state ───────────────────────────────────────────────────────────────
// Tracks which controller buttons are currently held and the last directional
// button that was pressed (used to aim shots).
const input = {
    left:    false,
    right:   false,
    up:      false,
    down:    false,
    a:       false,
    b:       false,
    lastDir: 'right',   // default shot direction before any button is pressed
};

// Edge-detection flags — true only on the frame the button transitions to pressed.
// Computed at the top of each game loop tick from the raw input state.
let aPrev = false;
let bPrev = false;

// ── Controller button wiring ──────────────────────────────────────────────────
// Attaches touch + mouse listeners to a controller button.
// Directional buttons also update input.lastDir so shots aim correctly.
function wireButton(id, key) {
    const el = document.getElementById(id);
    if (!el) return;

    const press = () => {
        input[key] = true;
        el.classList.add('pressed');
        // Record direction so the next A press fires toward it
        if (key === 'left')  input.lastDir = 'left';
        if (key === 'right') input.lastDir = 'right';
        if (key === 'up')    input.lastDir = 'up';
        if (key === 'down')  input.lastDir = 'down';
    };
    const release = () => {
        input[key] = false;
        el.classList.remove('pressed');
    };

    el.addEventListener('touchstart',  e => { e.preventDefault(); press();   }, { passive: false });
    el.addEventListener('touchend',    e => { e.preventDefault(); release(); }, { passive: false });
    el.addEventListener('touchcancel', e => { e.preventDefault(); release(); }, { passive: false });
    // Mouse fallback for desktop testing
    el.addEventListener('mousedown',  press);
    el.addEventListener('mouseup',    release);
    el.addEventListener('mouseleave', release);
}

wireButton('btn-up',    'up');
wireButton('btn-down',  'down');
wireButton('btn-left',  'left');
wireButton('btn-right', 'right');
wireButton('btn-a',     'a');
wireButton('btn-b',     'b');

// Start button: reset player to spawn position
document.getElementById('btn-start').addEventListener('click', resetPlayer);

// ── Game constants ────────────────────────────────────────────────────────────
const GRAVITY      = 0.40;  // pixels / frame² downward pull
const PLAYER_SPEED = 3.0;   // pixels / frame horizontal walk speed
const JUMP_VEL     = -9.5;  // pixels / frame upward impulse on jump
const BULLET_SPEED = 7;     // pixels / frame bullet travel speed
const BULLET_LIMIT = 6;     // maximum bullets on screen at once
const GRID_STEP    = 24;    // pixels per grid cell (used in background, tooltip, and platform placement)

// Player hitbox size (square, retro pixel block)
const PW = 20;
const PH = 20;

// Enemy size and walk speed
const EW           = 16;   // enemy width in pixels
const EH           = 16;   // enemy height in pixels
const ENEMY_SPEED  = 1.2;  // pixels per frame patrol speed

// ── Platform layout ───────────────────────────────────────────────────────────
// Stored as absolute pixel rectangles, rebuilt whenever the canvas is resized.
// Fraction-based platforms scale with screen size; cell-based ones snap to the grid.
let platforms = [];

// Converts a 1-based grid cell number to its top-left pixel coordinate.
// Used to place platforms at specific numbered cells visible in the background grid.
function cellToPixel(n) {
    const cols = Math.ceil(canvas.width / GRID_STEP);
    const col  = (n - 1) % cols;
    const row  = Math.floor((n - 1) / cols);
    return { x: col * GRID_STEP, y: row * GRID_STEP };
}

function buildPlatforms() {
    const W = canvas.width;
    const H = canvas.height;

    // Cell 342 platform — pinned to the grid so it always sits on the numbered cell.
    // Width spans 4 cells so there is room to land and stand.
    const c342 = cellToPixel(342);

    platforms = [
        // Ground — spans full width, 18 px tall
        { x: 0,         y: H - 18,      w: W,              h: 18 },
        // Floating platforms (x, y fractions chosen to make a reachable layout)
        { x: W * 0.04,  y: H * 0.70,   w: W * 0.26,       h: 11 },
        { x: W * 0.38,  y: H * 0.53,   w: W * 0.24,       h: 11 },
        { x: W * 0.68,  y: H * 0.36,   w: W * 0.28,       h: 11 },
        { x: W * 0.08,  y: H * 0.36,   w: W * 0.22,       h: 11 },
        { x: W * 0.44,  y: H * 0.18,   w: W * 0.18,       h: 11 },
        // Cell 342
        { x: c342.x,    y: c342.y,      w: GRID_STEP * 4,  h: 11 },
    ];

    buildEnemies(); // one enemy per platform, rebuilt whenever platforms change
}

// ── Player state ──────────────────────────────────────────────────────────────
const player = {
    x:        0,
    y:        0,
    vx:       0,
    vy:       0,
    onGround: false,
    facingLeft: false,   // used for the eye direction detail
};

// Places the player on the ground at the horizontal centre.
function resetPlayer() {
    player.x        = canvas.width  / 2 - PW / 2;
    player.y        = canvas.height - 18 - PH;
    player.vx       = 0;
    player.vy       = 0;
    player.onGround = false;
    player.facingLeft = false;
}

// ── Enemy pool ────────────────────────────────────────────────────────────────
// One enemy per platform. Each enemy patrols its home platform edge-to-edge.
let enemies = [];

// Spawns one enemy per platform, starting at the centre facing right.
function buildEnemies() {
    enemies = [];
    for (const p of platforms) {
        enemies.push({
            x:        p.x + p.w / 2 - EW / 2,  // horizontal centre of the platform
            y:        p.y - EH,                  // sitting on top of the platform surface
            vx:       ENEMY_SPEED,               // start patrolling rightward
            platform: p,                         // reference used for edge clamping
        });
    }
}

// Moves each enemy; reverses direction when it reaches either end of its platform.
function updateEnemies() {
    for (const e of enemies) {
        e.x += e.vx;
        if (e.x <= e.platform.x) {
            e.x  = e.platform.x;
            e.vx = ENEMY_SPEED;
        } else if (e.x + EW >= e.platform.x + e.platform.w) {
            e.x  = e.platform.x + e.platform.w - EW;
            e.vx = -ENEMY_SPEED;
        }
    }
}

// ── Bullet pool ───────────────────────────────────────────────────────────────
// Each bullet is {x, y, vx, vy, w, h} — dimensions match travel direction.
const bullets = [];

// Fires a bullet from the player centre in input.lastDir.
// Horizontal bullets are wide (8×4), vertical bullets are tall (4×8).
function shoot() {
    if (bullets.length >= BULLET_LIMIT) return;

    const dir = input.lastDir;
    let vx = 0, vy = 0, bw, bh;

    if      (dir === 'right') { vx =  BULLET_SPEED; bw = 8; bh = 4; }
    else if (dir === 'left')  { vx = -BULLET_SPEED; bw = 8; bh = 4; }
    else if (dir === 'up')    { vy = -BULLET_SPEED; bw = 4; bh = 8; }
    else                      { vy =  BULLET_SPEED; bw = 4; bh = 8; } // down

    bullets.push({
        x:  player.x + PW / 2 - bw / 2,
        y:  player.y + PH / 2 - bh / 2,
        vx, vy, w: bw, h: bh,
    });
}

// ── AABB helper ───────────────────────────────────────────────────────────────
// Returns true when rectangles a and b overlap.
function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// ── Player physics ────────────────────────────────────────────────────────────
// Integrates movement one frame: horizontal pass then vertical pass, each
// followed by platform collision resolution.
function updatePlayer() {
    // ── Horizontal movement ──
    if      (input.left)  { player.vx = -PLAYER_SPEED; player.facingLeft = true;  }
    else if (input.right) { player.vx =  PLAYER_SPEED; player.facingLeft = false; }
    else                  { player.vx = 0; }

    player.x += player.vx;

    // Keep inside canvas horizontally
    player.x = Math.max(0, Math.min(canvas.width - PW, player.x));

    // Horizontal platform collision (stops player walking into platform sides)
    for (const p of platforms) {
        if (overlaps(player.x, player.y, PW, PH, p.x, p.y, p.w, p.h)) {
            if (player.vx > 0) player.x = p.x - PW;
            else               player.x = p.x + p.w;
        }
    }

    // ── Vertical movement ──
    player.vy += GRAVITY;
    player.y  += player.vy;
    player.onGround = false;

    // Vertical platform collision (land on top or bump head on underside)
    for (const p of platforms) {
        if (overlaps(player.x, player.y, PW, PH, p.x, p.y, p.w, p.h)) {
            if (player.vy > 0) {
                // Falling → land on platform surface
                player.y        = p.y - PH;
                player.vy       = 0;
                player.onGround = true;
            } else {
                // Rising → hit platform from below
                player.y  = p.y + p.h;
                player.vy = 0;
            }
        }
    }

    // Fell below canvas — respawn (no lives system in this version)
    if (player.y > canvas.height + 40) resetPlayer();
}

// ── Bullet physics ────────────────────────────────────────────────────────────
// Moves bullets and removes any that leave the canvas or hit a platform.
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        // Off-screen check
        if (b.x + b.w < 0 || b.x > canvas.width ||
            b.y + b.h < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
            continue;
        }

        // Enemy impact — bullet and enemy both removed on contact
        let hitEnemy = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (overlaps(b.x, b.y, b.w, b.h, e.x, e.y, EW, EH)) {
                enemies.splice(j, 1);
                hitEnemy = true;
                break;
            }
        }
        if (hitEnemy) { bullets.splice(i, 1); continue; }

        // Platform impact check
        let hit = false;
        for (const p of platforms) {
            if (overlaps(b.x, b.y, b.w, b.h, p.x, p.y, p.w, p.h)) {
                hit = true;
                break;
            }
        }
        if (hit) bullets.splice(i, 1);
    }
}

// ── Rendering ─────────────────────────────────────────────────────────────────

// Draws the background grid with sequential numbers in each cell (left→right, top→bottom).
function drawBackground() {
    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cols = Math.ceil(canvas.width  / GRID_STEP);
    const rows = Math.ceil(canvas.height / GRID_STEP);

    // Grid lines
    ctx.strokeStyle = '#12122a';
    ctx.lineWidth   = 1;
    for (let x = 0; x < canvas.width; x += GRID_STEP) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += GRID_STEP) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Sequential number in each cell, centered, starting at 1
    ctx.font      = '7px monospace';
    ctx.fillStyle = '#1a1a38';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const n   = row * cols + col + 1;
            const cx  = col * GRID_STEP + GRID_STEP / 2;
            const cy  = row * GRID_STEP + GRID_STEP / 2;
            ctx.fillText(n, cx, cy);
        }
    }
    // Reset text alignment so other draw calls aren't affected
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';
}

// Draws all platforms with a bright top edge to indicate walkable surface.
function drawPlatforms() {
    for (const p of platforms) {
        // Dark body
        ctx.fillStyle = '#0d1f0d';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        // Bright green top edge — the "walkable" indicator
        ctx.fillStyle = '#33cc55';
        ctx.fillRect(p.x, p.y, p.w, 2);
        // Slightly lighter left/right thin edges for a 3-D feel
        ctx.fillStyle = '#1a441a';
        ctx.fillRect(p.x,           p.y + 2, 2, p.h - 2);
        ctx.fillRect(p.x + p.w - 2, p.y + 2, 2, p.h - 2);
    }
}

// Draws the player square with a simple pixel face that shows facing direction.
function drawPlayer() {
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    // Body
    ctx.fillStyle = '#00ffee';
    ctx.fillRect(x, y, PW, PH);

    // Slightly darker shading on the bottom half to suggest depth
    ctx.fillStyle = '#009988';
    ctx.fillRect(x, y + PH - 5, PW, 5);

    // Eye — positioned on the side the player is facing
    ctx.fillStyle = '#001a1a';
    const eyeX = player.facingLeft ? x + 3 : x + PW - 8;
    ctx.fillRect(eyeX, y + 5, 5, 5);

    // Tiny highlight dot inside eye
    ctx.fillStyle = '#00ffee';
    const hlX = player.facingLeft ? eyeX + 3 : eyeX + 1;
    ctx.fillRect(hlX, y + 6, 2, 2);
}

// Draws all active bullets as bright yellow rectangles.
function drawBullets() {
    ctx.fillStyle = '#ffff44';
    for (const b of bullets) {
        ctx.fillRect(Math.round(b.x), Math.round(b.y), b.w, b.h);
        // Small trail: dimmer rectangle one step behind travel direction
        ctx.fillStyle = '#aaaa1188';
        ctx.fillRect(Math.round(b.x - b.vx * 0.6), Math.round(b.y - b.vy * 0.6), b.w, b.h);
        ctx.fillStyle = '#ffff44';
    }
}

// Draws all living enemies as red pixel squares with a direction-aware eye.
function drawEnemies() {
    for (const e of enemies) {
        const x = Math.round(e.x);
        const y = Math.round(e.y);

        // Body
        ctx.fillStyle = '#ff2244';
        ctx.fillRect(x, y, EW, EH);

        // Darker bottom strip for depth
        ctx.fillStyle = '#aa1133';
        ctx.fillRect(x, y + EH - 4, EW, 4);

        // Eye on the side the enemy is walking toward
        ctx.fillStyle = '#1a0008';
        const eyeX = e.vx > 0 ? x + EW - 7 : x + 2;
        ctx.fillRect(eyeX, y + 4, 4, 4);

        // Highlight dot inside eye
        ctx.fillStyle = '#ff6688';
        ctx.fillRect(e.vx > 0 ? eyeX + 2 : eyeX, y + 5, 2, 2);
    }
}

// Renders the game title and last-direction indicator in the top-left corner.
function drawHUD() {
    ctx.font      = '10px monospace';
    ctx.fillStyle = '#333355';
    ctx.fillText('LIANSIONK', 8, 16);

    // Show which direction the next shot will travel
    const dirSymbol = { right: '►', left: '◄', up: '▲', down: '▼' }[input.lastDir];
    ctx.fillStyle = '#444488';
    ctx.fillText('aim ' + dirSymbol, 8, 30);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
function loop() {
    requestAnimationFrame(loop);

    // Detect rising edges for A (shoot) and B (jump) — fire once per press.
    const aJustPressed = input.a && !aPrev;
    const bJustPressed = input.b && !bPrev;
    aPrev = input.a;
    bPrev = input.b;

    if (aJustPressed) shoot();
    if (bJustPressed && player.onGround) {
        player.vy       = JUMP_VEL;
        player.onGround = false;
    }

    updatePlayer();
    updateEnemies();
    updateBullets();

    drawBackground();
    drawPlatforms();
    drawEnemies();
    drawBullets();
    drawPlayer();
    drawHUD();
}

// ── Cell tooltip on hover ─────────────────────────────────────────────────────
// Shows a small floating box with the hovered grid cell's sequential number.
const cellTooltip = document.getElementById('cell-tooltip');

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;

    const col  = Math.floor(mx / GRID_STEP);
    const row  = Math.floor(my / GRID_STEP);
    const cols = Math.ceil(canvas.width / GRID_STEP);
    const n    = row * cols + col + 1;

    cellTooltip.textContent = n;
    cellTooltip.style.display = 'block';

    // Keep the tooltip inside the game-area: offset 12 px from cursor,
    // flip sides if it would overflow the right or bottom edge.
    const PAD   = 12;
    const tipW  = cellTooltip.offsetWidth;
    const tipH  = cellTooltip.offsetHeight;
    const left  = mx + PAD + tipW > canvas.width  ? mx - PAD - tipW : mx + PAD;
    const top   = my + PAD + tipH > canvas.height ? my - PAD - tipH : my + PAD;
    cellTooltip.style.left = left + 'px';
    cellTooltip.style.top  = top  + 'px';
});

canvas.addEventListener('mouseleave', () => {
    cellTooltip.style.display = 'none';
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
resize();
window.addEventListener('resize', resize);
resetPlayer();
loop();
