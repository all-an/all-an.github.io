// Furthest the pupil may travel from the eye centre, in pixels.
const MAX_PUPIL_OFFSET = 8;
// Live collection so the target eye's pupil, added when the grid is built, is
// aimed alongside the player's two pupils.
const pupils = document.getElementsByClassName('pupil');

// Points every pupil toward a viewport coordinate, capped at the eye's edge.
function aimPupilsAt(targetX, targetY) {
  for (const pupil of pupils) {
    // Find the centre of this pupil's eye in viewport coordinates.
    const rect = pupil.parentElement.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    // Direction and distance from the eye centre to the target.
    const deltaX = targetX - eyeCenterX;
    const deltaY = targetY - eyeCenterY;
    const angle = Math.atan2(deltaY, deltaX);

    // Move toward the target, but never past the eye's edge (cap at MAX_PUPIL_OFFSET).
    const offset = Math.min(MAX_PUPIL_OFFSET, Math.hypot(deltaX, deltaY));
    pupil.style.transform = `translate(${Math.cos(angle) * offset}px, ${Math.sin(angle) * offset}px)`;
  }
}

// On every mouse move, point the pupils toward the cursor.
document.addEventListener('mousemove', (event) => aimPupilsAt(event.clientX, event.clientY));

// Side of one grid square, in pixels — equal to the eye diameter.
const GRID_CELL_SIZE = 30;
// The fixed board size, in pixels (rounded to whole eye-sized squares).
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;
// The single square that holds the target eye (the dark-red-pupilled eye to find).
const DARK_RED_EYE = 130;
// How many squares the player can see in every direction; squares beyond this
// stay hidden under fog until the player walks closer.
const VISION_RADIUS = 5;
// The fog is clear within the inner radius and fully black past the outer one,
// fading softly between them like real fog. VISION_RADIUS sits midway in the
// fade, so squares about 5 away are dim and the red target only sharpens up close.
const FOG_CLEAR_RADIUS = (VISION_RADIUS - 2) * GRID_CELL_SIZE; // crisp within 3 squares
const FOG_DARK_RADIUS  = (VISION_RADIUS + 2) * GRID_CELL_SIZE; // fully hidden past 7 squares

const grid = document.querySelector('.grid');
const hud = document.getElementById('hud');
const player = document.getElementById('player');
const fog = document.querySelector('.fog');
const dialog = document.getElementById('darkRedEyeDialog');
const dialogMessage = document.getElementById('dialogMessage');
const dialogActions = document.getElementById('dialogActions');

// Paint the fog veil once: clear at its centre, fading out to solid black. Only
// its position changes as the player moves (see movePlayerTo).
fog.style.background =
  `radial-gradient(circle, transparent ${FOG_CLEAR_RADIUS}px, #000 ${FOG_DARK_RADIUS}px)`;

// Board dimensions in whole eye-sized squares.
const gridColumns = Math.round(BOARD_WIDTH / GRID_CELL_SIZE);
const gridRows = Math.round(BOARD_HEIGHT / GRID_CELL_SIZE);

let activeCell = null;                            // the square currently lit under the cursor
let playerColumn = Math.floor(gridColumns / 2);  // the player's current square
let playerRow = Math.floor(gridRows / 2);
let darkRedEyeClicks = 0;                         // times the player has clicked the dark-red eye

// Build the fixed-size numbered grid once, marking the target square.
function buildGrid() {
  grid.style.gridTemplateColumns = `repeat(${gridColumns}, ${GRID_CELL_SIZE}px)`;
  grid.style.gridTemplateRows = `repeat(${gridRows}, ${GRID_CELL_SIZE}px)`;

  // Number each square left-to-right, top-to-bottom; the target square instead
  // holds a single watching eye. Every cell keeps its number in data-square so
  // the HUD can still report it.
  let cells = '';
  for (let n = 1; n <= gridColumns * gridRows; n++) {
    if (n === DARK_RED_EYE) {
      // The dark-red eye: shaped like the player's eyes but with a dark-red pupil.
      // Its own class flags the cell so the cursor turns to a hand and clicks open its dialog.
      cells += `<div class="grid-cell dark-red-eye" data-square="${n}"><div class="eye"><div class="pupil pupil-target"></div></div></div>`;
    } else {
      cells += `<div class="grid-cell" data-square="${n}">${n}</div>`;
    }
  }
  grid.innerHTML = cells;
}

// Returns the centre of a square in board coordinates.
function squareCenter(column, row) {
  return {
    x: column * GRID_CELL_SIZE + GRID_CELL_SIZE / 2,
    y: row * GRID_CELL_SIZE + GRID_CELL_SIZE / 2,
  };
}

// Place the player (the eyes) at the centre of the given square.
function movePlayerTo(column, row) {
  playerColumn = column;
  playerRow = row;
  const center = squareCenter(column, row);
  player.style.left = `${center.x}px`;
  player.style.top = `${center.y}px`;
  // Glide the fog's clear centre onto the player so sight follows the eyes.
  fog.style.left = `${center.x}px`;
  fog.style.top = `${center.y}px`;
}

buildGrid();
movePlayerTo(playerColumn, playerRow);

// Returns the {column, row} of the grid square at a viewport coordinate, or null
// if the coordinate falls outside the board.
function squareAt(x, y) {
  const rect = grid.getBoundingClientRect();
  const column = Math.floor((x - rect.left) / GRID_CELL_SIZE);
  const row = Math.floor((y - rect.top) / GRID_CELL_SIZE);
  if (column < 0 || column >= gridColumns || row < 0 || row >= gridRows) return null;
  return { column, row };
}

// Light up the square under the cursor and report its number in the HUD.
document.addEventListener('mousemove', (event) => {
  const square = squareAt(event.clientX, event.clientY);
  // Cells are laid out row by row, so the index is row * columns + column.
  const cell = square ? grid.children[square.row * gridColumns + square.column] : null;
  if (!cell || cell === activeCell) return; // off-board, or still the same square

  if (activeCell) activeCell.classList.remove('active');
  cell.classList.add('active');
  activeCell = cell;
  hud.textContent = `Square ${cell.dataset.square}`;
});

// Show the dark-red eye's dialog. The first click warns the player off; from the
// second click on it repeats the warning and offers two questions to ask back.
function openDarkRedEyeDialog() {
  darkRedEyeClicks++;
  if (darkRedEyeClicks === 1) {
    dialogMessage.textContent =
      'Hi Eyesz, what are you doing here? People like you are not allowed to come here.';
    // A single Close button dismisses this first warning.
    dialogActions.innerHTML = '<button class="dialog-close">Close</button>';
    dialogActions.querySelector('.dialog-close')
      .addEventListener('click', () => dialog.close());
  } else {
    dialogMessage.textContent = 'I repeat: hide yourself. You are not allowed to come here.';
    // Two questions the player can ask back; both just close the dialog for now.
    dialogActions.innerHTML =
      '<button class="dialog-option">What is this place?</button>' +
      '<button class="dialog-option">Who am I?</button>';
    dialogActions.querySelectorAll('.dialog-option')
      .forEach((button) => button.addEventListener('click', () => dialog.close()));
  }
  dialog.showModal();
}

// Clicking the dark-red eye opens its dialog; clicking any other square walks there.
document.addEventListener('click', (event) => {
  if (event.target.closest('.nav')) return;    // let the nav buttons work normally
  if (event.target.closest('.dialog')) return; // let the dialog's own controls work
  const square = squareAt(event.clientX, event.clientY);
  if (!square) return;

  const cell = grid.children[square.row * gridColumns + square.column];
  if (cell.classList.contains('dark-red-eye')) {
    openDarkRedEyeDialog();
  } else {
    movePlayerTo(square.column, square.row);
  }
});
