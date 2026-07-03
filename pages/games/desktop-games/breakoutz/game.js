// breakoutz — playfield with a draggable platform and a bouncing ball.
// The screen is filled with numbered background cells and a white centre line.
// A 3-cell platform (starting at cells 3408–3410) is dragged with the left
// mouse button but can never go above the centre line. A small ball bounces
// off the four screen borders.

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const hoverInfo = document.getElementById('hover-info');

// The static background (grid + numbers + centre line) is drawn once to this
// offscreen canvas and blitted each frame, so the animation loop stays cheap.
const bgCanvas = document.createElement('canvas');
const bgCtx = bgCanvas.getContext('2d');

const CELL = 20; // background cell size in pixels

let cols = 0; // grid columns, recomputed to fill the current window
let rows = 0; // grid rows

// The draggable platform: three cells wide, one tall, snapped to the grid.
const PLATFORM_START_CELL = 3408; // leftmost of cells 3408, 3409, 3410
const PLATFORM_CELLS = 3;
const platform = { x: 0, y: 0, w: PLATFORM_CELLS * CELL, h: CELL };
let platformPlaced = false; // place it once, on first layout

// The bouncing ball.
const ball = { x: 0, y: 0, r: 6, vx: 3.6, vy: 5.2 };
let ballStarted = false; // seed its position once, on first layout

// A row of destructible square blocks filling the line of cell 1100.
const BLOCK_LINE_CELL = 1100;
let blocks = [];
let blocksBuilt = false; // build the row once, on first layout

// Drag state: whether we're dragging and where the cursor grabbed the platform.
let dragging = false;
let grabDX = 0;
let grabDY = 0;

// Build the static background onto the offscreen canvas.
function buildBackground() {
  bgCanvas.width = canvas.width;
  bgCanvas.height = canvas.height;

  // Dark fill and faint grid.
  bgCtx.fillStyle = '#111';
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  bgCtx.lineWidth = 1;
  bgCtx.beginPath();
  for (let x = 0; x <= bgCanvas.width; x += CELL) {
    bgCtx.moveTo(x + 0.5, 0);
    bgCtx.lineTo(x + 0.5, bgCanvas.height);
  }
  for (let y = 0; y <= bgCanvas.height; y += CELL) {
    bgCtx.moveTo(0, y + 0.5);
    bgCtx.lineTo(bgCanvas.width, y + 0.5);
  }
  bgCtx.stroke();

  // Number every cell 1..N, left to right then top to bottom.
  bgCtx.fillStyle = 'rgba(136, 136, 204, 0.5)';
  bgCtx.font = '8px monospace';
  bgCtx.textAlign = 'center';
  bgCtx.textBaseline = 'middle';
  let n = 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      bgCtx.fillText(n, col * CELL + CELL / 2, row * CELL + CELL / 2);
      n++;
    }
  }

  // White horizontal line across the vertical centre.
  const y = bgCanvas.height / 2;
  bgCtx.strokeStyle = '#ffffff';
  bgCtx.lineWidth = 2;
  bgCtx.beginPath();
  bgCtx.moveTo(0, y);
  bgCtx.lineTo(bgCanvas.width, y);
  bgCtx.stroke();
}

// Draw the platform as a solid orange bar over its cells.
function drawPlatform() {
  ctx.fillStyle = '#ffaa44';
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  ctx.strokeStyle = '#ffd089';
  ctx.lineWidth = 2;
  ctx.strokeRect(platform.x + 1, platform.y + 1, platform.w - 2, platform.h - 2);
}

// Draw the ball.
function drawBall() {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

// Build one row of square blocks across the line that cell 1100 sits on.
function buildBlocks() {
  const y = Math.floor((BLOCK_LINE_CELL - 1) / cols) * CELL;
  blocks = [];
  for (let col = 0; col < cols; col++) {
    blocks.push({ x: col * CELL, y, alive: true });
  }
}

// Draw every surviving block as a solid cyan square.
function drawBlocks() {
  ctx.fillStyle = '#7ec8e3';
  ctx.strokeStyle = '#bfe6f4';
  ctx.lineWidth = 1;
  for (const b of blocks) {
    if (!b.alive) continue;
    ctx.fillRect(b.x, b.y, CELL, CELL);
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, CELL - 1, CELL - 1);
  }
}

// Bounce the ball off the first block it overlaps and destroy that block.
function bounceOffBlocks() {
  for (const b of blocks) {
    if (!b.alive) continue;
    const left = b.x - ball.r;
    const right = b.x + CELL + ball.r;
    const top = b.y - ball.r;
    const bottom = b.y + CELL + ball.r;
    if (ball.x <= left || ball.x >= right || ball.y <= top || ball.y >= bottom) continue;

    // Reflect off the shallowest side, matching the platform collision.
    const dLeft = ball.x - left;
    const dRight = right - ball.x;
    const dTop = ball.y - top;
    const dBottom = bottom - ball.y;
    const min = Math.min(dLeft, dRight, dTop, dBottom);
    if (min === dTop) { ball.y = top; ball.vy = -Math.abs(ball.vy); }
    else if (min === dBottom) { ball.y = bottom; ball.vy = Math.abs(ball.vy); }
    else if (min === dLeft) { ball.x = left; ball.vx = -Math.abs(ball.vx); }
    else { ball.x = right; ball.vx = Math.abs(ball.vx); }

    b.alive = false; // destroy the block that was hit
    return; // one block per frame
  }
}

// Advance the ball and bounce it off the four screen borders.
function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = -ball.vx; }
  else if (ball.x + ball.r > canvas.width) { ball.x = canvas.width - ball.r; ball.vx = -ball.vx; }

  if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = -ball.vy; }
  else if (ball.y + ball.r > canvas.height) { ball.y = canvas.height - ball.r; ball.vy = -ball.vy; }

  bounceOffPlatform();
  bounceOffBlocks();
}

// Treat the platform as a solid brick: if the ball overlaps it, push the ball
// out along the shallowest side and reflect the matching velocity component.
function bounceOffPlatform() {
  const left = platform.x - ball.r;
  const right = platform.x + platform.w + ball.r;
  const top = platform.y - ball.r;
  const bottom = platform.y + platform.h + ball.r;

  // No overlap with the ball-radius-expanded platform: nothing to do.
  if (ball.x <= left || ball.x >= right || ball.y <= top || ball.y >= bottom) return;

  // Distance to each expanded edge; the smallest is the side that was hit.
  const dLeft = ball.x - left;
  const dRight = right - ball.x;
  const dTop = ball.y - top;
  const dBottom = bottom - ball.y;
  const min = Math.min(dLeft, dRight, dTop, dBottom);

  if (min === dTop) { ball.y = top; ball.vy = -Math.abs(ball.vy); }
  else if (min === dBottom) { ball.y = bottom; ball.vy = Math.abs(ball.vy); }
  else if (min === dLeft) { ball.x = left; ball.vx = -Math.abs(ball.vx); }
  else { ball.x = right; ball.vx = Math.abs(ball.vx); }
}

// The animation loop: update the ball, then paint background, platform, ball.
function frame() {
  updateBall();
  ctx.drawImage(bgCanvas, 0, 0);
  drawBlocks();
  drawPlatform();
  drawBall();
  requestAnimationFrame(frame);
}

// Position the platform so its left edge sits on the given cell number.
function placePlatformAtCell(n) {
  const idx = n - 1;
  platform.x = (idx % cols) * CELL;
  platform.y = Math.floor(idx / cols) * CELL;
}

// Keep the platform inside the canvas and at/below the white centre line.
function clampPlatform() {
  platform.x = Math.max(0, Math.min(platform.x, canvas.width - platform.w));
  platform.y = Math.max(lineLimitY(), Math.min(platform.y, canvas.height - platform.h));
}

// The highest row the platform may occupy: the first grid row at/below the
// white centre line, so the platform can never sit above the line.
function lineLimitY() {
  return Math.ceil((canvas.height / 2) / CELL) * CELL;
}

// End the drag: release the platform and open the hand cursor.
function endDrag() {
  dragging = false;
  canvas.classList.remove('dragging');
}

// Match the canvas to the window, rebuild the background, and reseat pieces.
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.ceil(canvas.width / CELL);
  rows = Math.ceil(canvas.height / CELL);
  buildBackground();

  if (!platformPlaced) {
    placePlatformAtCell(PLATFORM_START_CELL);
    platformPlaced = true;
  }
  clampPlatform();

  if (!blocksBuilt) {
    buildBlocks();
    blocksBuilt = true;
  }

  if (!ballStarted) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ballStarted = true;
  }
}

// True when the point (mx, my) lies on the platform.
function insidePlatform(mx, my) {
  return mx >= platform.x && mx < platform.x + platform.w &&
         my >= platform.y && my < platform.y + platform.h;
}

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(frame);

// Holding the left button closes the hand; grabbing the platform drags it.
canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  canvas.classList.add('dragging'); // close the hand while the button is held
  if (insidePlatform(e.clientX, e.clientY)) {
    dragging = true;
    grabDX = e.clientX - platform.x; // keep the grab point under the cursor
    grabDY = e.clientY - platform.y;
  }
  e.preventDefault();
});

window.addEventListener('mousemove', (e) => {
  if (dragging) {
    // Follow the cursor, snapping to whole cells, kept inside the screen.
    platform.x = Math.round((e.clientX - grabDX) / CELL) * CELL;
    const desiredY = Math.round((e.clientY - grabDY) / CELL) * CELL;
    if (desiredY < lineLimitY()) {
      // Dragged above the white line: stop the platform and let go of it.
      platform.y = lineLimitY();
      clampPlatform();
      endDrag();
    } else {
      platform.y = desiredY;
      clampPlatform();
    }
  }

  // Show the cell under the cursor in the upper-right readout.
  const col = Math.floor(e.clientX / CELL);
  const row = Math.floor(e.clientY / CELL);
  const n = row * cols + col + 1;
  hoverInfo.textContent = `cell ${n} · col ${col + 1}, row ${row + 1}`;
});

window.addEventListener('mouseup', endDrag);

// Clear the readout when the cursor leaves the window.
document.addEventListener('mouseleave', () => {
  hoverInfo.textContent = '';
});
