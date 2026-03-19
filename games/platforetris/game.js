import { startRetroSong } from '../music/retro-song.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('cell-tooltip');
const tooltipNumber = document.getElementById('tooltip-number');
const tooltipCoords = document.getElementById('tooltip-coords');

const COLS = 40;
const ROWS = 30;
const CELL = 20;

// ── Grid hover state ───────────────────────────────────────────────────────────
let hoveredCol = -1;
let hoveredRow = -1;

// ── L-piece rotations (clockwise) ─────────────────────────────────────────────
const ROTATIONS = [
  { blocks: [[0,0],[0,1],[0,2],[1,2]], w: 2, h: 3 }, // 0°
  { blocks: [[0,0],[1,0],[2,0],[0,1]], w: 3, h: 2 }, // 90° CW
  { blocks: [[0,0],[1,0],[1,1],[1,2]], w: 2, h: 3 }, // 180°
  { blocks: [[2,0],[0,1],[1,1],[2,1]], w: 3, h: 2 }, // 270° CW
];

const GRAVITY    = 0.45;
const JUMP_VEL   = -10;
const SPEED      = 3;
const SPIN_SPEED = 6;

// ── Platforms ──────────────────────────────────────────────────────────────────
const PLATFORMS = [
  { col: 22, row: 25, color: '#e63946', border: '#ff6b75' },
  { col: 23, row: 25, color: '#2a9d8f', border: '#4ecdc4' },
  { col: 24, row: 25, color: '#e9c46a', border: '#ffd97d' },
];

// ── Filled cells (player color) — cells 991, 993, 994, 995, row 24 ─────────────
// These are solid platforms. Cell 992 (col 31, row 24) is the gap / trigger.
let filledCells = [
  { col: 30, row: 24 }, // 991
  // 992 — gap (trigger)
  { col: 32, row: 24 }, // 993
  { col: 33, row: 24 }, // 994
  { col: 34, row: 24 }, // 995
];

// ── Piece ──────────────────────────────────────────────────────────────────────
// piece.customBlocks = null  → use ROTATIONS normally
// piece.customBlocks = [{dx,dy},...] → arbitrary blocks after explosion
const piece = {
  x: 16 * CELL,
  y: 27 * CELL,
  vx: 0,
  vy: 0,
  onGround: false,
  rotIndex: 0,
  spinAngle: 0,
  spinning:  false,
  customBlocks: null,
  blockNums: [4, 3, 2, 1], // persistent numbers that survive rotation
};

// Permutation applied to blockNums on each 90° CW spin step.
// ROT_PERM[rotIndex][i] = which OLD slot feeds new slot i.
// Derived from the geometric 90° CW rotation of the L-piece bounding box.
const ROT_PERM = [
  [2, 1, 0, 3], // rot 0 → 1
  [3, 0, 1, 2], // rot 1 → 2
  [0, 3, 2, 1], // rot 2 → 3
  [1, 2, 3, 0], // rot 3 → 0
];

function rot() { return ROTATIONS[piece.rotIndex]; }

// Current blocks as pixel offsets {dx,dy} from piece.x, piece.y
function getBlockOffsets() {
  if (piece.customBlocks) return piece.customBlocks;
  return rot().blocks.map(([c, r]) => ({ dx: c * CELL, dy: r * CELL }));
}

// Pixel width/height of current piece bounding box
function blockBounds() {
  const bs = getBlockOffsets();
  if (bs.length === 0) return { w: CELL, h: CELL };
  return {
    w: Math.max(...bs.map(b => b.dx)) + CELL,
    h: Math.max(...bs.map(b => b.dy)) + CELL,
  };
}

// Grid col/row of the centre of a block at offset {dx,dy}
function blockCell(dx, dy) {
  return {
    col: Math.floor((piece.x + dx + CELL / 2) / CELL),
    row: Math.floor((piece.y + dy + CELL / 2) / CELL),
  };
}

// ── Room system ────────────────────────────────────────────────────────────────
let roomX = 0;
let roomY = 0;
const roomIndexMap = new Map([['0,0', 0]]);
let nextRoomIndex = 1;

function getRoomIndex(rx, ry) {
  const key = `${rx},${ry}`;
  if (!roomIndexMap.has(key)) roomIndexMap.set(key, nextRoomIndex++);
  return roomIndexMap.get(key);
}

// ── Transition state ───────────────────────────────────────────────────────────
let transitioning      = false;
let transitionDirX     = 0;
let transitionDirY     = 0;
let transitionProgress = 0;
const TRANSITION_SPEED = 0.055;

// ── Input ──────────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
       'KeyA','KeyD','KeyW','KeyS','Space','Enter'].includes(e.code)) {
    e.preventDefault();
  }
  if (e.code === 'Enter' && !keys['Enter']) triggerSpin();
  keys[e.code] = true;
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

function triggerSpin() {
  if (piece.spinning || transitioning) return;
  piece.spinning  = true;
  piece.spinAngle = 0;
}

// ── Sounds ─────────────────────────────────────────────────────────────────────
let audioCtx = null;
function getAC() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playJumpSound() {
  const ac   = getAC();
  const osc  = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain); gain.connect(ac.destination);
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.07);
  gain.gain.setValueAtTime(0.12, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.13);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.13);
}

function playExplosionSound() {
  const ac      = getAC();
  const bufSize = Math.floor(ac.sampleRate * 0.22);
  const buf     = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data    = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.5);
  }
  const src  = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buf;
  gain.gain.setValueAtTime(0.18, ac.currentTime);
  src.connect(gain); gain.connect(ac.destination);
  src.start();
}

// ── Explosion particles ────────────────────────────────────────────────────────
const particles = [];

function spawnExplosion(cx, cy) {
  for (let i = 0; i < 28; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.03 + Math.random() * 0.03,
      r: 2 + Math.random() * 4,
      hue: 20 + Math.random() * 40, // orange–yellow
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.1; // gentle gravity
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// Draw a fill-progress ring on cell 992 while the timer counts down
function drawFillProgress(offX = 0, offY = 0) {
  if (fillStartTime === null || exploded) return;
  const progress = Math.min((performance.now() - fillStartTime) / FILL_DELAY, 1);
  const cx = TRIGGER_COL * CELL + CELL / 2 + offX;
  const cy = TRIGGER_ROW * CELL + CELL / 2 + offY;
  const r  = CELL / 2 - 1;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();
  ctx.restore();
}

function drawParticles(offX = 0, offY = 0) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = `hsl(${p.hue}, 100%, 60%)`;
    ctx.beginPath();
    ctx.arc(p.x + offX, p.y + offY, p.r * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ── Explosion logic ────────────────────────────────────────────────────────────
let exploded = false;

// Trigger: piece block covers cell 992 (col 31, row 24)
// Destroy zone: cols 30–34, row 24 (cells 991–995)
const TRIGGER_COL  = 31;
const TRIGGER_ROW  = 24;
const DESTROY_ROW  = 24;
const DESTROY_COLS = new Set([30, 31, 32, 33, 34]);

// Find the largest group of adjacent blocks (4-connected) and return them
// with offsets re-normalised so min(dx)=0, min(dy)=0 (adjusts piece.x/y too).
function largestConnected(blocks) {
  if (blocks.length === 0) return [];

  const gb = blocks.map(b => ({
    ...b,                          // preserve num and any other props
    gc: Math.round(b.dx / CELL),
    gr: Math.round(b.dy / CELL),
  }));

  const visited = new Array(gb.length).fill(false);
  let best = [];

  for (let i = 0; i < gb.length; i++) {
    if (visited[i]) continue;
    const group = [];
    const q = [i];
    visited[i] = true;
    while (q.length) {
      const cur = q.shift();
      group.push(gb[cur]);
      for (let j = 0; j < gb.length; j++) {
        if (visited[j]) continue;
        if (Math.abs(gb[cur].gc - gb[j].gc) + Math.abs(gb[cur].gr - gb[j].gr) === 1) {
          visited[j] = true;
          q.push(j);
        }
      }
    }
    if (group.length > best.length) best = group;
  }

  const result = best.map(({ gc, gr, ...rest }) => rest); // drop gc/gr, keep dx/dy/num/etc.

  // Normalise so min(dx)=0 and min(dy)=0 and shift piece position accordingly
  const minDX = Math.min(...result.map(b => b.dx));
  const minDY = Math.min(...result.map(b => b.dy));
  piece.x += minDX;
  piece.y += minDY;
  return result.map(b => ({ ...b, dx: b.dx - minDX, dy: b.dy - minDY }));
}

// Two-step state: block 4 must enter cell 992 before block 3 can trigger.
let block4Entered = false;

// How long (ms) block 2 or 4 has been filling cell 992 while settled.
let fillStartTime = null;
const FILL_DELAY  = 1500; // ms

function checkExplosion() {
  if (exploded || roomX !== 0 || roomY !== 0) return;

  const offsets = getBlockOffsets();

  // Which block number overlaps cell 992 while the piece is grounded?
  // Uses AABB overlap so any partial entry into the gap counts.
  const gLeft   = TRIGGER_COL * CELL;
  const gRight  = gLeft + CELL;
  const gTop    = TRIGGER_ROW * CELL;
  const gBottom = gTop  + CELL;
  let numAtGap = null;
  if (piece.onGround) {
    for (let i = 0; i < offsets.length; i++) {
      const bLeft   = piece.x + offsets[i].dx;
      const bTop    = piece.y + offsets[i].dy;
      const bRight  = bLeft + CELL;
      const bBottom = bTop  + CELL;
      if (bRight > gLeft && bLeft < gRight && bBottom > gTop && bTop < gBottom) {
        numAtGap = piece.blockNums[i];
        break;
      }
    }
  }

  // Step 1: block 4 visits cell 992 — unlock step 2
  if (numAtGap === 4) {
    block4Entered = true;
    fillStartTime = null;
    return;
  }

  // Step 2: block 3 fills (after block 4 entered) OR block 1 fills (independent)
  const qualifying = (block4Entered && numAtGap === 3) || numAtGap === 1;
  if (!qualifying) {
    fillStartTime = null;
    return;
  }

  // Start the timer on first qualifying frame
  if (fillStartTime === null) fillStartTime = performance.now();

  // Wait for 1.5 s of continuous fill
  if (performance.now() - fillStartTime < FILL_DELAY) return;

  // ── Trigger explosion ──
  exploded = true;
  block4Entered = true; // disable hidden stop
  fillStartTime = null;
  playExplosionSound();
  filledCells = [];
  spawnExplosion(TRIGGER_COL * CELL + CELL / 2, TRIGGER_ROW * CELL + CELL / 2);

  // Tag each block with its persistent number before filtering
  const taggedOffsets   = offsets.map((b, i) => ({ ...b, num: piece.blockNums[i] }));
  const survivingTagged = taggedOffsets.filter(({ dx, dy }) => {
    const { col, row } = blockCell(dx, dy);
    return !(DESTROY_COLS.has(col) && row === DESTROY_ROW);
  });
  const connected       = largestConnected(survivingTagged);
  piece.customBlocks    = connected.map(({ dx, dy }) => ({ dx, dy }));
  piece.blockNums       = connected.map(b => b.num);
  piece.spinning = false;
}

// ── Physics update ─────────────────────────────────────────────────────────────
function update() {
  // During room transition only advance animation
  if (transitioning) {
    transitionProgress += TRANSITION_SPEED;
    if (transitionProgress >= 1) {
      roomX += transitionDirX;
      roomY += transitionDirY;
      const { w, h } = blockBounds();
      if      (transitionDirX ===  1) piece.x = 2;
      else if (transitionDirX === -1) piece.x = canvas.width  - w - 2;
      else if (transitionDirY === -1) piece.y = canvas.height - h;
      piece.vy           = 0;
      piece.onGround     = false;
      transitioning      = false;
      transitionDirX     = 0;
      transitionDirY     = 0;
      transitionProgress = 0;
    }
    return;
  }

  const { w, h } = blockBounds();

  // Spin animation
  if (piece.spinning) {
    piece.spinAngle += SPIN_SPEED;
    if (piece.spinAngle >= 90) {
      piece.spinAngle = 0;
      piece.spinning  = false;
      if (!piece.customBlocks) {
        // Normal L-piece: advance rotation and permute block numbers accordingly
        const perm = ROT_PERM[piece.rotIndex];
        piece.blockNums = perm.map(p => piece.blockNums[p]);
        piece.rotIndex  = (piece.rotIndex + 1) % 4;
      } else {
        // Custom blocks: rotate each offset 90° CW around the bounding centre
        const { w, h } = blockBounds();
        piece.customBlocks = piece.customBlocks.map(({ dx, dy }) => ({
          dx: (h - CELL) - dy,
          dy: dx,
        }));
        // Normalise so min offsets are 0
        const minDX = Math.min(...piece.customBlocks.map(b => b.dx));
        const minDY = Math.min(...piece.customBlocks.map(b => b.dy));
        piece.x += minDX; piece.y += minDY;
        piece.customBlocks = piece.customBlocks.map(b => ({ dx: b.dx - minDX, dy: b.dy - minDY }));
      }
      const { w: nw, h: nh } = blockBounds();
      if (piece.x + nw > canvas.width)  piece.x = canvas.width  - nw;
      if (piece.x < 0)                  piece.x = 0;
      if (piece.y + nh > canvas.height) piece.y = canvas.height - nh;
    }
  }

  // Horizontal movement — locked and snapped when any block is inside cell 992
  const gL = TRIGGER_COL * CELL, gR = gL + CELL;
  const gT = TRIGGER_ROW * CELL, gB = gT + CELL;
  let lockedInGap = false;
  if (!exploded) {
    for (const { dx, dy } of getBlockOffsets()) {
      const bL = piece.x + dx, bR = bL + CELL;
      const bT = piece.y + dy, bB = bT + CELL;
      if (bR > gL && bL < gR && bB > gT && bT < gB) {
        lockedInGap = true;
        piece.x = TRIGGER_COL * CELL - dx; // snap block to col 31
        break;
      }
    }
  }
  piece.vx = 0;
  if (!lockedInGap) {
    if (keys['ArrowLeft']  || keys['KeyA']) piece.vx = -SPEED;
    if (keys['ArrowRight'] || keys['KeyD']) piece.vx =  SPEED;
  }

  // Jump
  if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && piece.onGround) {
    piece.vy       = JUMP_VEL;
    piece.onGround = false;
    playJumpSound();
  }

  piece.vy += GRAVITY;
  piece.x  += piece.vx;
  piece.y  += piece.vy;

  // Floor collision
  piece.onGround = false;
  if (piece.y >= canvas.height - h) {
    piece.y        = canvas.height - h;
    piece.vy       = 0;
    piece.onGround = true;
  }

  // Platform + filled-cell collision (room 0,0 only)
  if (roomX === 0 && roomY === 0) {
    const offsets = getBlockOffsets();

    const gapLeft  = TRIGGER_COL * CELL;
    const gapRight = gapLeft + CELL;

    // Land-on-top helper. skipGap=true skips blocks whose center is over the gap column.
    function landOn(px, py, skipGap = false) {
      for (const { dx, dy } of offsets) {
        const bLeft   = piece.x + dx;
        const bRight  = bLeft + CELL;
        const bCenter = bLeft + CELL / 2;
        if (skipGap && bCenter >= gapLeft && bCenter < gapRight) continue;
        const bBottom = piece.y + dy + CELL;
        if (bRight > px && bLeft < px + CELL) {
          if (piece.vy >= 0 && bBottom >= py && bBottom <= py + CELL + Math.abs(piece.vy) + 1) {
            piece.y        = py - dy - CELL;
            piece.vy       = 0;
            piece.onGround = true;
          }
        }
      }
    }

    for (const plat of PLATFORMS) landOn(plat.col * CELL, plat.row * CELL);
    for (const cell of filledCells) landOn(cell.col * CELL, cell.row * CELL, true);
    if (!block4Entered) landOn(TRIGGER_COL * CELL, (TRIGGER_ROW + 1) * CELL); // invisible stop — removed after block 4 enters

    checkExplosion();
  }

  // Wall collision / room transitions
  function startTransition(dx, dy) {
    transitioning = true; transitionDirX = dx; transitionDirY = dy; transitionProgress = 0;
  }

  if (piece.x + w >= canvas.width) {
    piece.x = canvas.width - w;
    startTransition(1, 0);
  } else if (piece.x <= 0) {
    piece.x = 0;
    startTransition(-1, 0);
  } else if (piece.y <= 0) {
    piece.y = 0; piece.vy = 0;
    startTransition(0, -1);
  }
}

// ── Draw piece ─────────────────────────────────────────────────────────────────
function drawPiece(offX = 0, offY = 0) {
  const offsets = getBlockOffsets();
  if (offsets.length === 0) return;

  const { w, h } = blockBounds();
  const cx = piece.x + w / 2 + offX;
  const cy = piece.y + h / 2 + offY;

  ctx.save();
  if (piece.spinning) {
    ctx.translate(cx, cy);
    ctx.rotate(piece.spinAngle * Math.PI / 180);
    ctx.translate(-cx, -cy);
  }

  offsets.forEach(({ dx, dy }, i) => {
    const px = piece.x + dx + offX;
    const py = piece.y + dy + offY;
    ctx.fillStyle = '#ff6b00';
    ctx.fillRect(px, py, CELL, CELL);
    ctx.fillStyle = 'rgba(255,180,80,0.35)';
    ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
    ctx.strokeStyle = '#ffaa44';
    ctx.lineWidth   = 1;
    ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);

    // Block number — persistent across rotations
    ctx.font         = 'bold 8px monospace';
    ctx.fillStyle    = 'rgba(255,255,255,0.9)';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(piece.blockNums[i], px + CELL / 2, py + CELL / 2);
  });

  ctx.restore();
}

// ── Draw one room ──────────────────────────────────────────────────────────────
function drawRoom(rx, ry, offX, offY) {
  const startN = getRoomIndex(rx, ry) * COLS * ROWS + 1;

  ctx.save();
  ctx.translate(offX, offY);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#2a2a4a';
  ctx.lineWidth   = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
  }

  if (rx === 0 && ry === 0) {
    // Platforms
    for (const plat of PLATFORMS) {
      const px = plat.col * CELL, py = plat.row * CELL;
      ctx.fillStyle = plat.color; ctx.fillRect(px, py, CELL, CELL);
      ctx.strokeStyle = plat.border; ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);
    }
    // Filled cells (orange, same as player)
    for (const cell of filledCells) {
      const px = cell.col * CELL, py = cell.row * CELL;
      ctx.fillStyle = '#ff6b00'; ctx.fillRect(px, py, CELL, CELL);
      ctx.fillStyle = 'rgba(255,180,80,0.35)'; ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
      ctx.strokeStyle = '#ffaa44'; ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);
    }
  }

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const n  = startN + row * COLS + col;
      const cx = col * CELL + CELL / 2;
      const cy = row * CELL + CELL / 2;
      const isHovered = rx === roomX && ry === roomY && !transitioning
                     && col === hoveredCol && row === hoveredRow;
      if (isHovered) {
        ctx.fillStyle = '#2a2a5a';
        ctx.fillRect(col * CELL + 0.5, row * CELL + 0.5, CELL - 1, CELL - 1);
        ctx.font = 'bold 8px monospace'; ctx.fillStyle = '#e0e0ff';
      } else {
        ctx.font = '7px monospace'; ctx.fillStyle = '#8888cc';
      }
      ctx.fillText(n, cx, cy);
    }
  }

  ctx.restore();
}

// ── Draw scene ─────────────────────────────────────────────────────────────────
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, canvas.width, canvas.height); ctx.clip();

  if (transitioning) {
    const p = transitionProgress;
    const W = canvas.width, H = canvas.height;
    let curOffX = 0, curOffY = 0, nxtOffX = 0, nxtOffY = 0;
    let nxtRX = roomX, nxtRY = roomY;

    if      (transitionDirX ===  1) { curOffX = -p*W; nxtRX = roomX+1; nxtOffX =  (1-p)*W; }
    else if (transitionDirX === -1) { curOffX =  p*W; nxtRX = roomX-1; nxtOffX = -(1-p)*W; }
    else if (transitionDirY === -1) { curOffY =  p*H; nxtRY = roomY-1; nxtOffY = -(1-p)*H; }

    drawRoom(roomX, roomY, curOffX, curOffY);
    drawRoom(nxtRX, nxtRY, nxtOffX, nxtOffY);
    drawPiece(curOffX, curOffY);
    drawFillProgress(curOffX, curOffY);
    drawParticles(curOffX, curOffY);
  } else {
    drawRoom(roomX, roomY, 0, 0);
    drawPiece(0, 0);
    drawFillProgress(0, 0);
    drawParticles(0, 0);
  }

  ctx.restore();
}

// ── Game loop ──────────────────────────────────────────────────────────────────
let _lastLogTime = 0;
function loop() {
  update(); updateParticles(); drawGrid();
  const now = performance.now();
  if (now - _lastLogTime >= 200) {
    _lastLogTime = now;
    console.log(`piece  x=${piece.x.toFixed(2)}  y=${piece.y.toFixed(2)}  col=${(piece.x/CELL).toFixed(2)}  row=${(piece.y/CELL).toFixed(2)}`);
  }
  requestAnimationFrame(loop);
}

// ── Mouse events ───────────────────────────────────────────────────────────────
if (sessionStorage.getItem('ptMusic')) {
  sessionStorage.removeItem('ptMusic');
  startRetroSong();
}

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const col  = Math.floor((e.clientX - rect.left) / CELL);
  const row  = Math.floor((e.clientY - rect.top)  / CELL);
  hoveredCol = col; hoveredRow = row;
  const startN = getRoomIndex(roomX, roomY) * COLS * ROWS + 1;
  tooltipNumber.textContent = startN + row * COLS + col;
  tooltipCoords.textContent = `col ${col + 1}, row ${row + 1}`;
  const OFFSET = 16;
  let left = e.clientX + OFFSET, top = e.clientY + OFFSET;
  const tw = tooltip.offsetWidth || 120, th = tooltip.offsetHeight || 90;
  if (left + tw > window.innerWidth)  left = e.clientX - tw - OFFSET;
  if (top  + th > window.innerHeight) top  = e.clientY - th - OFFSET;
  tooltip.style.left = left + 'px'; tooltip.style.top = top + 'px';
  tooltip.style.display = 'block';
});

canvas.addEventListener('mouseleave', () => {
  hoveredCol = -1; hoveredRow = -1;
  tooltip.style.display = 'none';
});

loop();
