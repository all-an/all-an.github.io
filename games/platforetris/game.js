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

// ── L-tetromino rotations (clockwise) ─────────────────────────────────────────────
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

// ── Vivid color palette ────────────────────────────────────────────────────────
const VIVID_COLORS = [
  { id:  1, color: '#ff0033', border: '#ff6688' }, // red
  { id:  2, color: '#ff6600', border: '#ffaa44' }, // orange
  { id:  3, color: '#ffdd00', border: '#ffee66' }, // yellow
  { id:  4, color: '#ff0088', border: '#ff55bb' }, // hot pink
  { id:  5, color: '#00ff44', border: '#55ff88' }, // green
  { id:  6, color: '#00eeff', border: '#55f5ff' }, // cyan
  { id:  7, color: '#0066ff', border: '#4488ff' }, // blue
  { id:  8, color: '#aa00ff', border: '#cc66ff' }, // purple
  { id:  9, color: '#aaaaaa', border: '#dddddd' }, // gray
  { id: 10, color: '#006600', border: '#009900' }, // dark green
];
const vc = id => VIVID_COLORS[id - 1];

// ── Platforms ──────────────────────────────────────────────────────────────────
let PLATFORMS = [
  { col: 22, row: 25, ...vc( 1) }, // 782 red
  { col: 23, row: 25, ...vc( 5) }, //     green
  { col: 24, row: 25, ...vc( 2) }, //     orange
  { col:  7, row: 17, ...vc( 7) }, // 688 blue
  { col:  7, row: 18, ...vc( 7) }, // 728 blue
  { col:  7, row: 19, ...vc( 7) }, // 768 blue
  { col: 12, row: 18, ...vc( 5) }, // 733 green
  { col: 12, row: 19, ...vc( 5) }, // 773 green
  { col:  2, row: 13, ...vc( 9) }, // 523 magenta
  { col:  3, row: 13, ...vc( 9) }, // 524 magenta
  { col:  9, row: 11, ...vc( 3) }, // 450 yellow
  { col: 10, row: 11, ...vc( 3) }, // 451 yellow
  { col: 15, row:  8, ...vc( 6) }, // 336 cyan
  { col: 16, row:  8, ...vc( 6) }, // 337 cyan
  { col: 20, row:  6, ...vc( 2) }, // 261 orange
  { col: 21, row:  6, ...vc( 2) }, // 262 orange
  { col: 13, row:  3, ...vc( 8) }, // 134 purple
  { col: 14, row:  3, ...vc( 8) }, // 135 purple
  { col: 21, row: 19, ...vc( 6) }, // 782 cyan
  { col: 22, row: 19, ...vc( 6) }, // 783 cyan
  { col: 23, row: 19, ...vc( 6) }, // 784 cyan
  { col: 38, row: 28, ...vc( 1) }, // 1159
  { col: 38, row: 29, ...vc( 1) }, // 1199
  { col: 39, row: 28, ...vc( 2) }, // 1160
  { col: 39, row: 29, ...vc( 2) }, // 1200
  { col:  0, row: 28, ...vc( 3) }, // 1121
  { col:  0, row: 29, ...vc( 3) }, // 1161
  { col:  1, row: 28, ...vc( 4) }, // 1122
  { col:  1, row: 29, ...vc( 4) }, // 1162
  { col:  2, row: 28, ...vc( 5) }, // 1123
  { col:  2, row: 29, ...vc( 5) }, // 1163
  { col:  3, row: 28, ...vc( 6) }, // 1124
  { col:  3, row: 29, ...vc( 6) }, // 1164
  { col:  4, row: 28, ...vc( 7) }, // 1125
  { col:  4, row: 29, ...vc( 7) }, // 1165
  { col:  5, row: 28, ...vc( 8) }, // 1126
  { col:  5, row: 29, ...vc( 8) }, // 1166
  { col:  6, row: 28, ...vc( 9) }, // 1127
  { col:  6, row: 29, ...vc( 9) }, // 1167
  { col:  7, row: 28, ...vc(10) }, // 1128
  { col:  7, row: 29, ...vc(10) }, // 1168
  { col:  8, row: 28, ...vc( 1) }, // 1129
  { col:  8, row: 29, ...vc( 1) }, // 1169
  { col:  9, row: 28, ...vc( 2) }, // 1130
  { col:  9, row: 29, ...vc( 2) }, // 1170
  { col: 10, row: 28, ...vc( 3) }, // 1131
  { col: 10, row: 29, ...vc( 3) }, // 1171
  { col: 11, row: 28, ...vc( 4) }, // 1132
  { col: 11, row: 29, ...vc( 4) }, // 1172
  { col: 12, row: 28, ...vc( 5) }, // 1133
  { col: 12, row: 29, ...vc( 5) }, // 1173
  { col: 13, row: 28, ...vc( 6) }, // 1134
  { col: 13, row: 29, ...vc( 6) }, // 1174
  { col: 14, row: 28, ...vc( 7) }, // 1135
  { col: 14, row: 29, ...vc( 7) }, // 1175
  { col: 15, row: 28, ...vc( 8) }, // 1136
  { col: 15, row: 29, ...vc( 8) }, // 1176
  { col: 16, row: 28, ...vc( 9) }, // 1137
  { col: 16, row: 29, ...vc( 9) }, // 1177
  { col: 17, row: 28, ...vc(10) }, // 1138
  { col: 17, row: 29, ...vc(10) }, // 1178
  { col: 18, row: 28, ...vc( 1) }, // 1139
  { col: 18, row: 29, ...vc( 1) }, // 1179
  { col: 19, row: 28, ...vc( 2) }, // 1140
  { col: 19, row: 29, ...vc( 2) }, // 1180
  { col: 20, row: 28, ...vc( 3) }, // 1141
  { col: 20, row: 29, ...vc( 3) }, // 1181
  { col: 21, row: 28, ...vc( 4) }, // 1142
  { col: 21, row: 29, ...vc( 4) }, // 1182
  { col: 22, row: 28, ...vc( 5) }, // 1143
  { col: 22, row: 29, ...vc( 5) }, // 1183
  { col: 23, row: 28, ...vc( 6) }, // 1144
  { col: 23, row: 29, ...vc( 6) }, // 1184
  { col: 24, row: 28, ...vc( 7) }, // 1145
  { col: 24, row: 29, ...vc( 7) }, // 1185
  { col: 25, row: 28, ...vc( 8) }, // 1146
  { col: 25, row: 29, ...vc( 8) }, // 1186
  { col: 26, row: 28, ...vc( 9) }, // 1147
  { col: 26, row: 29, ...vc( 9) }, // 1187
  { col: 27, row: 28, ...vc(10) }, // 1148
  { col: 27, row: 29, ...vc(10) }, // 1188
  { col: 28, row: 28, ...vc( 1) }, // 1149
  { col: 28, row: 29, ...vc( 1) }, // 1189
  { col: 29, row: 28, ...vc( 2) }, // 1150
  { col: 29, row: 29, ...vc( 2) }, // 1190
  { col: 30, row: 28, ...vc( 3) }, // 1151
  { col: 30, row: 29, ...vc( 3) }, // 1191
  { col: 31, row: 28, ...vc( 4) }, // 1152
  { col: 31, row: 29, ...vc( 4) }, // 1192
  { col: 32, row: 28, ...vc( 5) }, // 1153
  { col: 32, row: 29, ...vc( 5) }, // 1193
  { col: 33, row: 28, ...vc( 6) }, // 1154
  { col: 33, row: 29, ...vc( 6) }, // 1194
  { col: 34, row: 28, ...vc( 7) }, // 1155
  { col: 34, row: 29, ...vc( 7) }, // 1195
  { col: 35, row: 28, ...vc( 8) }, // 1156
  { col: 35, row: 29, ...vc( 8) }, // 1196
  { col: 36, row: 28, ...vc( 9) }, // 1157
  { col: 36, row: 29, ...vc( 9) }, // 1197
  { col: 37, row: 28, ...vc(10) }, // 1158
  { col: 37, row: 29, ...vc(10) }, // 1198
];

// ── Filled cells (player color) — cells 818, 858, 938, 978, 991, 993–995 ───────
// These are solid platforms. Cell 992 (col 31, row 24) is the gap / trigger.
let filledCells = [
  { col: 17, row: 20, color: vc(4).color }, // 818
  { col: 17, row: 21, color: vc(4).color }, // 858
  { col: 17, row: 23, color: vc(4).color }, // 938
  { col: 17, row: 24, color: vc(4).color }, // 978
  { col: 30, row: 24, color: vc(4).color }, // 991
  // 992 — gap (trigger)
  { col: 32, row: 24, color: vc(4).color }, // 993
  { col: 33, row: 24, color: vc(4).color }, // 994
  { col: 34, row: 24, color: vc(4).color }, // 995
  { col:  2, row: 29, color: vc(4).color }, // 1163
  { col:  3, row: 29, color: vc(4).color }, // 1164
  // 1165 — gap (col 4, row 29)
  { col:  5, row: 29, color: vc(4).color }, // 1166
  { col:  6, row: 29, color: vc(4).color }, // 1167
];

// ── Piece ──────────────────────────────────────────────────────────────────────
// tetromino.customBlocks = null  → use ROTATIONS normally
// tetromino.customBlocks = [{dx,dy},...] → arbitrary blocks after explosion
const tetromino = {
  x: 16 * CELL,
  y: 27 * CELL,
  vx: 0,
  vy: 0,
  onGround: false,
  rotIndex: 0,
  spinAngle: 0,
  spinning:  false,
  totalDeg:  0,
  customBlocks: null,
  blockNums: [4, 3, 2, 1], // persistent numbers that survive rotation
  rotations: null, // set by spawnNewPiece / init
  rotPerms:  null, // set by spawnNewPiece / init
  ...(() => { const c = VIVID_COLORS[Math.floor(Math.random() * VIVID_COLORS.length)]; return { color: c.color, border: c.border }; })(),
};

// Permutation applied to blockNums on each 90° CW spin step.
// ROT_PERM[rotIndex][i] = which OLD slot feeds new slot i.
// Derived from the geometric 90° CW rotation of the L-tetromino bounding box.
const ROT_PERM = [
  [2, 1, 0, 3], // rot 0 → 1
  [3, 0, 1, 2], // rot 1 → 2
  [0, 3, 2, 1], // rot 2 → 3
  [1, 2, 3, 0], // rot 3 → 0
];

// ── All tetrominos ─────────────────────────────────────────────────────────────
const TETROMINOS = [
  { // L — orange
    ...vc(2),
    rotations: ROTATIONS,
    rotPerms: ROT_PERM,
  },
  { // J — blue
    ...vc(7),
    rotations: [
      { blocks: [[1,0],[1,1],[0,2],[1,2]], w: 2, h: 3 },
      { blocks: [[0,0],[0,1],[1,1],[2,1]], w: 3, h: 2 },
      { blocks: [[0,0],[1,0],[0,1],[0,2]], w: 2, h: 3 },
      { blocks: [[0,0],[1,0],[2,0],[2,1]], w: 3, h: 2 },
    ],
    rotPerms: null,
  },
  { // I — cyan
    ...vc(6),
    rotations: [
      { blocks: [[0,0],[1,0],[2,0],[3,0]], w: 4, h: 1 },
      { blocks: [[0,0],[0,1],[0,2],[0,3]], w: 1, h: 4 },
      { blocks: [[0,0],[1,0],[2,0],[3,0]], w: 4, h: 1 },
      { blocks: [[0,0],[0,1],[0,2],[0,3]], w: 1, h: 4 },
    ],
    rotPerms: null,
  },
  { // O — yellow
    ...vc(3),
    rotations: [
      { blocks: [[0,0],[1,0],[0,1],[1,1]], w: 2, h: 2 },
      { blocks: [[0,0],[1,0],[0,1],[1,1]], w: 2, h: 2 },
      { blocks: [[0,0],[1,0],[0,1],[1,1]], w: 2, h: 2 },
      { blocks: [[0,0],[1,0],[0,1],[1,1]], w: 2, h: 2 },
    ],
    rotPerms: null,
  },
  { // T — purple
    ...vc(8),
    rotations: [
      { blocks: [[0,0],[1,0],[2,0],[1,1]], w: 3, h: 2 },
      { blocks: [[1,0],[0,1],[1,1],[1,2]], w: 2, h: 3 },
      { blocks: [[1,0],[0,1],[1,1],[2,1]], w: 3, h: 2 },
      { blocks: [[0,0],[0,1],[1,1],[0,2]], w: 2, h: 3 },
    ],
    rotPerms: null,
  },
  { // S — green
    ...vc(5),
    rotations: [
      { blocks: [[1,0],[2,0],[0,1],[1,1]], w: 3, h: 2 },
      { blocks: [[0,0],[0,1],[1,1],[1,2]], w: 2, h: 3 },
      { blocks: [[1,0],[2,0],[0,1],[1,1]], w: 3, h: 2 },
      { blocks: [[0,0],[0,1],[1,1],[1,2]], w: 2, h: 3 },
    ],
    rotPerms: null,
  },
  { // Z — red
    ...vc(1),
    rotations: [
      { blocks: [[0,0],[1,0],[1,1],[2,1]], w: 3, h: 2 },
      { blocks: [[1,0],[0,1],[1,1],[0,2]], w: 2, h: 3 },
      { blocks: [[0,0],[1,0],[1,1],[2,1]], w: 3, h: 2 },
      { blocks: [[1,0],[0,1],[1,1],[0,2]], w: 2, h: 3 },
    ],
    rotPerms: null,
  },
];

// Initialize with L-tetromino
tetromino.rotations = ROTATIONS;
tetromino.rotPerms  = ROT_PERM;

function spawnNewTetromino() {
  const shape = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
  const clr   = VIVID_COLORS[Math.floor(Math.random() * VIVID_COLORS.length)];
  tetromino.rotations    = shape.rotations;
  tetromino.rotPerms     = shape.rotPerms;
  tetromino.color        = clr.color;
  tetromino.border       = clr.border;
  tetromino.rotIndex     = 0;
  tetromino.customBlocks = null;
  tetromino.blockNums    = [1, 2, 3, 4];
  tetromino.spinning     = false;
  tetromino.spinAngle    = 0;
  tetromino.totalDeg     = 0;
  tetromino.vx           = 0;
  tetromino.vy           = 0;
  tetromino.onGround     = false;
  const w = shape.rotations[0].w * CELL;
  tetromino.x = Math.round((canvas.width / 2 - w / 2) / CELL) * CELL;
  tetromino.y = 2 * CELL;
}

function rot() { return tetromino.rotations[tetromino.rotIndex]; }

// Current blocks as pixel offsets {dx,dy} from tetromino.x, tetromino.y
function getBlockOffsets() {
  if (tetromino.customBlocks) return tetromino.customBlocks;
  return rot().blocks.map(([c, r]) => ({ dx: c * CELL, dy: r * CELL }));
}

// Pixel width/height of current tetromino bounding box
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
    col: Math.floor((tetromino.x + dx + CELL / 2) / CELL),
    row: Math.floor((tetromino.y + dy + CELL / 2) / CELL),
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
  if (tetromino.spinning || transitioning) return;
  tetromino.spinning  = true;
  tetromino.spinAngle = 0;
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

function updateFillBar() {
  const pct = fillTimer !== null ? Math.min((performance.now() - fillTimer) / FILL_DELAY * 100, 100) : 0;
  elFillBar.style.width = pct + '%';
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

// ── Shared explosion helpers ───────────────────────────────────────────────────
// Returns the block number of the first block (from validNums, or any if null)
// that overlaps grid cell (col, row) via AABB, or null if none.
function findBlockAtCell(offsets, col, row, validNums = null) {
  const gLeft = col * CELL, gRight = gLeft + CELL;
  const gTop  = row * CELL, gBottom = gTop  + CELL;
  for (let i = 0; i < offsets.length; i++) {
    if (validNums && !validNums.includes(tetromino.blockNums[i])) continue;
    const bLeft = tetromino.x + offsets[i].dx;
    const bTop  = tetromino.y + offsets[i].dy;
    if (bLeft + CELL > gLeft && bLeft < gRight && bTop + CELL > gTop && bTop < gBottom)
      return tetromino.blockNums[i];
  }
  return null;
}

// Tag offsets with block numbers, keep those passing keepFn, update tetromino to
// the largest remaining connected group.
function applyBlockExplosion(offsets, keepFn) {
  const tagged    = offsets.map((b, i) => ({ ...b, num: tetromino.blockNums[i] }));
  const surviving = tagged.filter(({ dx, dy }) => keepFn(blockCell(dx, dy)));
  const connected = largestConnected(surviving);
  tetromino.customBlocks = connected.map(({ dx, dy }) => ({ dx, dy }));
  tetromino.blockNums    = connected.map(b => b.num);
  tetromino.spinning     = false;
  if (tetromino.customBlocks.length === 0) spawnNewTetromino();
}

// ── Explosion state ────────────────────────────────────────────────────────────
let fillTimer    = null;   // fill-progress timer start (ms), null when inactive
let pendingChain = null;   // { axis, index, chain } being tracked
const FILL_DELAY = 1500;   // ms

// Find the largest group of adjacent blocks (4-connected) and return them
// with offsets re-normalised so min(dx)=0, min(dy)=0 (adjusts tetromino.x/y too).
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

  // Normalise so min(dx)=0 and min(dy)=0 and shift tetromino position accordingly
  const minDX = Math.min(...result.map(b => b.dx));
  const minDY = Math.min(...result.map(b => b.dy));
  tetromino.x += minDX;
  tetromino.y += minDY;
  return result.map(b => ({ ...b, dx: b.dx - minDX, dy: b.dy - minDY }));
}

// Returns the largest contiguous mixed chain of ≥5 as an array of {v, p},
// or null if none reaches 5. Works on any 1-D list of row or column indices.
function findMixedChain5(playerVals, filledVals) {
  if (!playerVals.length || !filledVals.length) return null;
  const tagged = [
    ...playerVals.map(v => ({ v, p: true  })),
    ...filledVals.map(v => ({ v, p: false })),
  ].sort((a, b) => a.v - b.v);

  let best = null, start = 0;
  for (let i = 1; i <= tagged.length; i++) {
    if (i === tagged.length || tagged[i].v - tagged[i - 1].v > 1) {
      const g = tagged.slice(start, i);
      if (g.some(x => x.p) && g.some(x => !x.p) && g.length >= 5) {
        if (!best || g.length > best.length) best = g;
      }
      start = i;
    }
  }
  return best;
}

// Find a 4-connected group of ≥5 cells mixing player blocks + same-color static cells.
// Returns { cells: [{col,row,p},...] } or null.
function findChain5() {
  if (!tetromino.onGround) return null;
  const offsets = getBlockOffsets();
  const pCells  = offsets.map(b => blockCell(b.dx, b.dy));
  const sameColor = [
    ...filledCells.filter(c => c.color === tetromino.color),
    ...PLATFORMS.filter(p => p.color === tetromino.color),
  ];
  if (!sameColor.length) return null;

  const staticSet = new Set(sameColor.map(c => `${c.col},${c.row}`));
  const playerSet = new Set(pCells.map(c => `${c.col},${c.row}`));
  const allSet    = new Set([...staticSet, ...playerSet]);

  const visited = new Set();
  let best = null;

  for (const start of [...pCells, ...sameColor.map(c => ({ col: c.col, row: c.row }))]) {
    const key = `${start.col},${start.row}`;
    if (visited.has(key)) continue;

    const group = [];
    const queue = [{ col: start.col, row: start.row }];
    const gv = new Set([key]);

    while (queue.length) {
      const { col, row } = queue.shift();
      group.push({ col, row, p: playerSet.has(`${col},${row}`) });
      for (const [dc, dr] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nk = `${col+dc},${row+dr}`;
        if (!gv.has(nk) && allSet.has(nk)) { gv.add(nk); queue.push({ col: col+dc, row: row+dr }); }
      }
    }

    for (const c of group) visited.add(`${c.col},${c.row}`);

    // Qualify only if some single column OR row has ≥5 cells with ≥1 player and ≥1 static
    const qualifies = (() => {
      for (const axis of ['col', 'row']) {
        const buckets = {};
        for (const c of group) {
          const k = c[axis];
          if (!buckets[k]) buckets[k] = { p: 0, s: 0 };
          c.p ? buckets[k].p++ : buckets[k].s++;
        }
        for (const b of Object.values(buckets)) {
          if (b.p >= 1 && b.s >= 1 && b.p + b.s >= 5) return true;
        }
      }
      return false;
    })();

    if (qualifies) {
      if (!best || group.length > best.length) best = group;
    }
  }

  return best ? { cells: best } : null;
}

function checkExplosion() {
  if (roomX !== 0 || roomY !== 0) return;

  const found = findChain5();
  if (!found) { fillTimer = null; pendingChain = null; return; }

  const chainKey = found.cells.map(c => `${c.col},${c.row}`).sort().join('|');
  if (!pendingChain || pendingChain.key !== chainKey) {
    fillTimer    = performance.now();
    pendingChain = { cells: found.cells, key: chainKey };
  }
  if (performance.now() - fillTimer < FILL_DELAY) return;

  // Fire!
  fillTimer    = null;
  pendingChain = null;
  playExplosionSound();

  const { cells } = found;
  const offsets   = getBlockOffsets();

  // Find the qualifying axis/index (the line with ≥5 mixed cells)
  const allCells = cells;
  let axis, index;
  outer: for (const ax of ['col', 'row']) {
    const buckets = {};
    for (const c of allCells) {
      const k = c[ax];
      if (!buckets[k]) buckets[k] = { p: 0, s: 0, val: k };
      c.p ? buckets[k].p++ : buckets[k].s++;
    }
    for (const b of Object.values(buckets)) {
      if (b.p >= 1 && b.s >= 1 && b.p + b.s >= 5) {
        axis = ax; index = b.val; break outer;
      }
    }
  }

  // Only blast cells on the qualifying line
  const inlineSet = new Set(
    allCells.filter(c => c[axis] === index).map(c => `${c.col},${c.row}`)
  );

  for (const { col, row } of allCells.filter(c => inlineSet.has(`${c.col},${c.row}`)))
    spawnExplosion(col * CELL + CELL / 2, row * CELL + CELL / 2);

  filledCells = filledCells.filter(c => !inlineSet.has(`${c.col},${c.row}`));
  PLATFORMS   = PLATFORMS.filter(p => !inlineSet.has(`${p.col},${p.row}`));

  // Only remove player blocks inline with the blast axis
  if (axis === 'col') {
    applyBlockExplosion(offsets, ({ col }) => col !== index);
  } else {
    applyBlockExplosion(offsets, ({ row }) => row !== index);
  }
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
      if      (transitionDirX ===  1) tetromino.x = 2;
      else if (transitionDirX === -1) tetromino.x = canvas.width  - w - 2;
      else if (transitionDirY === -1) tetromino.y = canvas.height - h;
      else if (transitionDirY ===  1) tetromino.y = 0;
      tetromino.vy           = 0;
      tetromino.onGround     = false;
      transitioning      = false;
      transitionDirX     = 0;
      transitionDirY     = 0;
      transitionProgress = 0;
    }
    return;
  }

  const { w, h } = blockBounds();

  // Spin animation
  if (tetromino.spinning) {
    tetromino.spinAngle += SPIN_SPEED;
    if (tetromino.spinAngle >= 90) {
      tetromino.spinAngle = 0;
      tetromino.spinning  = false;
      tetromino.totalDeg  = (tetromino.totalDeg + 90) % 360;
      if (!tetromino.customBlocks) {
        if (tetromino.rotPerms) {
          const perm = tetromino.rotPerms[tetromino.rotIndex];
          tetromino.blockNums = perm.map(p => tetromino.blockNums[p]);
        }
        tetromino.rotIndex  = (tetromino.rotIndex + 1) % 4;
      } else {
        // Custom blocks: rotate each offset 90° CW around the bounding centre
        const { w, h } = blockBounds();
        tetromino.customBlocks = tetromino.customBlocks.map(({ dx, dy }) => ({
          dx: (h - CELL) - dy,
          dy: dx,
        }));
        // Normalise so min offsets are 0
        const minDX = Math.min(...tetromino.customBlocks.map(b => b.dx));
        const minDY = Math.min(...tetromino.customBlocks.map(b => b.dy));
        tetromino.x += minDX; tetromino.y += minDY;
        tetromino.customBlocks = tetromino.customBlocks.map(b => ({ dx: b.dx - minDX, dy: b.dy - minDY }));
      }
      const { w: nw, h: nh } = blockBounds();
      if (tetromino.x + nw > canvas.width)  tetromino.x = canvas.width  - nw;
      if (tetromino.x < 0)                  tetromino.x = 0;
      if (tetromino.y + nh > canvas.height) tetromino.y = canvas.height - nh;
    }
  }

  // Snap: while the fill timer is running, pixel-align the contributing player block
  // exactly onto its cell. Pressing left/right releases the snap.

  tetromino.vx = 0;
  if (keys['ArrowLeft']  || keys['KeyA']) tetromino.vx = -SPEED;
  if (keys['ArrowRight'] || keys['KeyD']) tetromino.vx =  SPEED;

  // Jump
  if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && tetromino.onGround) {
    tetromino.vy       = JUMP_VEL;
    tetromino.onGround = false;
    playJumpSound();
  }

  tetromino.vy += GRAVITY;
  tetromino.x  += tetromino.vx;

  // Horizontal side collision: only against solids at the same grid row as each block.
  // Resting-on-top blocks have blockRow = platformRow - 1, so they never match.
  if (roomX === 0 && roomY === 0 && tetromino.vx !== 0) {
    const offs = getBlockOffsets();
    const solids = [...PLATFORMS, ...filledCells];
    for (const { dx, dy } of offs) {
      const blockRow = Math.floor((tetromino.y + dy + CELL / 2) / CELL);
      const bLeft    = tetromino.x + dx;
      const bRight   = bLeft + CELL;
      for (const s of solids) {
        if (s.row !== blockRow) continue;
        const pLeft = s.col * CELL, pRight = pLeft + CELL;
        if (bRight > pLeft && bLeft < pRight) {
          tetromino.x = tetromino.vx > 0 ? pLeft - dx - CELL : pRight - dx;
          break;
        }
      }
    }
  }

  tetromino.y  += tetromino.vy;

  // Floor collision
  tetromino.onGround = false;
  if (tetromino.y >= canvas.height - h) {
    tetromino.y        = canvas.height - h;
    tetromino.vy       = 0;
    tetromino.onGround = true;
  }

  // Platform + filled-cell collision (room 0,0 only)
  if (roomX === 0 && roomY === 0) {
    const offsets = getBlockOffsets();

    // Land-on-top helper.
    // Skip a block whose center column has no solid cell (platform or filledCell)
    // at this row — so the block can fall into a gap rather than catching on edges.
    function landOn(px, py) {
      const solidRow = Math.floor(py / CELL);
      const solidCol = Math.floor(px / CELL);
      for (const { dx, dy } of offsets) {
        const bLeft      = tetromino.x + dx;
        const bRight     = bLeft + CELL;
        const bCenterCol = Math.floor((bLeft + CELL / 2) / CELL);
        if (bCenterCol !== solidCol) {
          const hasSolid = PLATFORMS.some(p => p.col === bCenterCol && p.row === solidRow)
                        || filledCells.some(c => c.col === bCenterCol && c.row === solidRow);
          if (!hasSolid) continue;
        }
        const bBottom = tetromino.y + dy + CELL;
        if (bRight > px && bLeft < px + CELL) {
          if (tetromino.vy >= 0 && bBottom >= py && bBottom <= py + CELL + Math.abs(tetromino.vy) + 1) {
            tetromino.y        = py - dy - CELL;
            tetromino.vy       = 0;
            tetromino.onGround = true;
          }
        }
      }
    }

    for (const plat of PLATFORMS) landOn(plat.col * CELL, plat.row * CELL);
    for (const cell of filledCells) landOn(cell.col * CELL, cell.row * CELL);

    // Snap to grid when explosion is pending and player isn't moving laterally
    const movingLaterally = keys['ArrowLeft'] || keys['KeyA'] || keys['ArrowRight'] || keys['KeyD'];
    if (!movingLaterally && pendingChain !== null) {
      tetromino.x = Math.round(tetromino.x / CELL) * CELL;
    }

    checkExplosion();
  }

  // Wall collision / room transitions
  function startTransition(dx, dy) {
    transitioning = true; transitionDirX = dx; transitionDirY = dy; transitionProgress = 0;
  }

  if (tetromino.x + w >= canvas.width) {
    tetromino.x = canvas.width - w;
    startTransition(1, 0);
  } else if (tetromino.x <= 0) {
    tetromino.x = 0;
    startTransition(-1, 0);
  } else if (tetromino.y <= 0) {
    tetromino.y = 0; tetromino.vy = 0;
    startTransition(0, -1);
  } else if (tetromino.onGround && tetromino.y >= canvas.height - h
             && (keys['ArrowDown'] || keys['KeyS'])) {
    startTransition(0, 1);
  }
}

// ── Draw tetromino ─────────────────────────────────────────────────────────────────
function drawPiece(offX = 0, offY = 0) {
  const offsets = getBlockOffsets();
  if (offsets.length === 0) return;

  const { w, h } = blockBounds();
  const cx = tetromino.x + w / 2 + offX;
  const cy = tetromino.y + h / 2 + offY;

  ctx.save();
  if (tetromino.spinning) {
    ctx.translate(cx, cy);
    ctx.rotate(tetromino.spinAngle * Math.PI / 180);
    ctx.translate(-cx, -cy);
  }

  offsets.forEach(({ dx, dy }, i) => {
    const px = tetromino.x + dx + offX;
    const py = tetromino.y + dy + offY;
    ctx.fillStyle   = tetromino.color;
    ctx.fillRect(px, py, CELL, CELL);
    ctx.strokeStyle = tetromino.border;
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(px + 0.5, py + 0.5, CELL - 1, CELL - 1);

    // Block number — persistent across rotations
    ctx.font         = 'bold 8px monospace';
    ctx.fillStyle    = 'rgba(255,255,255,0.9)';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tetromino.blockNums[i], px + CELL / 2, py + CELL / 2);
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
    // Filled cells — drawn in their stored color
    for (const cell of filledCells) {
      const px = cell.col * CELL, py = cell.row * CELL;
      ctx.fillStyle = cell.color; ctx.fillRect(px, py, CELL, CELL);
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
      ctx.strokeStyle = cell.color; ctx.lineWidth = 1.5;
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
    else if (transitionDirY ===  1) { curOffY = -p*H; nxtRY = roomY+1; nxtOffY =  (1-p)*H; }

    drawRoom(roomX, roomY, curOffX, curOffY);
    drawRoom(nxtRX, nxtRY, nxtOffX, nxtOffY);
    drawPiece(curOffX, curOffY);
    drawParticles(curOffX, curOffY);
  } else {
    drawRoom(roomX, roomY, 0, 0);
    drawPiece(0, 0);
    drawParticles(0, 0);
  }

  ctx.restore();
}

// ── Game loop ──────────────────────────────────────────────────────────────────
const elDegrees = document.getElementById('piece-degrees');
const elFillBar = document.getElementById('fill-bar');
const ROTATION_DEGREES = ['0°', '90°', '180°', '270°'];

function loop() {
  update(); updateParticles(); drawGrid();
  elDegrees.textContent = tetromino.spinning
    ? (tetromino.totalDeg + tetromino.spinAngle) + '°'
    : tetromino.totalDeg + '°';
  updateFillBar();
  requestAnimationFrame(loop);
}

// ── Tetromino selector ─────────────────────────────────────────────────────────
const TETROMINO_NAMES = ['L','J','I','O','T','S','Z'];
const PREVIEW_CELL    = 12;
const PREVIEW_SIZE    = 4 * PREVIEW_CELL + 8;
let selectedTetrominoIndex = 0;

const COLOR_NAMES = ['red','orange','yellow','hot pink','green','cyan','blue','purple','gray','dark green'];

function drawTetrominoPreviews() {
  document.querySelectorAll('.tet-preview').forEach((cvs, i) => {
    cvs.width  = PREVIEW_SIZE;
    cvs.height = PREVIEW_SIZE;
    const c   = cvs.getContext('2d');
    const rot = TETROMINOS[i].rotations[0];
    const ox  = Math.floor((4 - rot.w) / 2) * PREVIEW_CELL + 4;
    const oy  = Math.floor((4 - rot.h) / 2) * PREVIEW_CELL + 4;
    c.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    for (const [col, row] of rot.blocks) {
      const px = ox + col * PREVIEW_CELL;
      const py = oy + row * PREVIEW_CELL;
      c.fillStyle   = '#ffffff';
      c.fillRect(px, py, PREVIEW_CELL, PREVIEW_CELL);
      c.strokeStyle = '#aaaacc';
      c.lineWidth   = 1.5;
      c.strokeRect(px + 0.5, py + 0.5, PREVIEW_CELL - 1, PREVIEW_CELL - 1);
    }
    cvs.classList.toggle('selected', i === selectedTetrominoIndex);
  });
}

// ── Color modal ────────────────────────────────────────────────────────────────
const colorModal     = document.getElementById('color-modal');
const colorModalGrid = document.getElementById('color-modal-grid');
let pendingTetrominoIndex = 0;

VIVID_COLORS.forEach(vc => {
  const btn = document.createElement('button');
  btn.className = 'color-btn';
  btn.style.background   = vc.color;
  btn.style.borderColor  = vc.border;
  btn.style.color        = '#000';
  btn.textContent        = `${vc.id} · ${COLOR_NAMES[vc.id - 1]}`;
  btn.addEventListener('click', () => {
    applyTetrominoSelection(pendingTetrominoIndex, vc);
    colorModal.classList.remove('open');
  });
  colorModalGrid.appendChild(btn);
});

colorModal.addEventListener('click', e => {
  if (e.target === colorModal) colorModal.classList.remove('open');
});

function applyTetrominoSelection(index, clr) {
  selectedTetrominoIndex = index;
  const shape = TETROMINOS[index];
  tetromino.rotations    = shape.rotations;
  tetromino.rotPerms     = shape.rotPerms;
  tetromino.color        = clr.color;
  tetromino.border       = clr.border;
  tetromino.rotIndex     = 0;
  tetromino.customBlocks = null;
  tetromino.blockNums    = [1, 2, 3, 4];
  tetromino.spinning     = false;
  tetromino.spinAngle    = 0;
  tetromino.totalDeg     = 0;
  tetromino.vx           = 0;
  tetromino.vy           = 0;
  tetromino.onGround     = false;
  const w = shape.rotations[0].w * CELL;
  tetromino.x = Math.round((canvas.width / 2 - w / 2) / CELL) * CELL;
  tetromino.y = 2 * CELL;
  drawTetrominoPreviews();
}

document.querySelectorAll('.tet-preview').forEach((cvs, i) => {
  cvs.addEventListener('click', () => {
    pendingTetrominoIndex = i;
    colorModal.classList.add('open');
  });
});

// ── Start screen ───────────────────────────────────────────────────────────────
const startScreen = document.getElementById('start-screen');
let gameStarted = false;

function beginGame() {
  if (gameStarted) return;
  gameStarted = true;
  startRetroSong();
  startScreen.style.display = 'none';
  drawTetrominoPreviews();
  loop();
}

startScreen.addEventListener('click',   beginGame, { once: true });
document.addEventListener('keydown',    beginGame, { once: true });

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

// ── Background grid hover (outside canvas) ────────────────────────────────────
const bgTooltip = document.getElementById('bg-tooltip');

function bgCellId(col, row) {
  // Deterministic 4-char base-36 code from position
  const n = (((col + 1) * 2654435761) ^ ((row + 1) * 2246822519)) >>> 0;
  return (n % (36 ** 4)).toString(36).padStart(4, '0');
}

document.addEventListener('mousemove', (e) => {
  if (e.target === canvas || canvas.contains(e.target)) return;
  const col = Math.floor(e.clientX / CELL);
  const row = Math.floor(e.clientY / CELL);
  bgTooltip.textContent = bgCellId(col, row);
  bgTooltip.style.left    = (e.clientX + 14) + 'px';
  bgTooltip.style.top     = (e.clientY + 14) + 'px';
  bgTooltip.style.display = 'block';
});

document.addEventListener('mouseleave', () => { bgTooltip.style.display = 'none'; });
canvas.addEventListener('mouseenter',   () => { bgTooltip.style.display = 'none'; });
