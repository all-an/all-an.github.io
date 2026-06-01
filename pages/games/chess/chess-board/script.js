// ============================================================
// Chess board rendering
// Draws the 8x8 grid and places the pieces in their starting
// positions. Built from small, single-purpose functions.
// ============================================================

// Number of squares along one edge of the board.
const BOARD_SIZE = 8;

// Unicode glyph for each piece, keyed by color then piece type.
// Both colors use the solid (filled) glyphs so color comes from CSS.
const PIECE_GLYPHS = {
    white: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
    black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

// Order of the back-rank pieces, from file a to file h.
const BACK_RANK = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

// ===== Board model =====

// Creates a piece object holding its color and type.
function makePiece(color, type) {
    return { color, type };
}

// Returns the piece that starts on the given square, or null if empty.
function startingPieceAt(row, col) {
    if (row === 0) return makePiece('black', BACK_RANK[col]); // Black back rank
    if (row === 1) return makePiece('black', 'pawn');         // Black pawns
    if (row === 6) return makePiece('white', 'pawn');         // White pawns
    if (row === 7) return makePiece('white', BACK_RANK[col]); // White back rank
    return null;                                              // Empty middle ranks
}

// Returns one rank (row) of the starting board for the given row index.
function createRow(row) {
    const cells = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
        cells.push(startingPieceAt(row, col));
    }
    return cells;
}

// Builds the starting position as an 8x8 array of piece objects
// (or null for an empty square). Row 0 is Black's back rank.
function createStartingPosition() {
    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        board.push(createRow(row));
    }
    return board;
}

// True when a square should be light, based on (row + col) parity.
function isLightSquare(row, col) {
    return (row + col) % 2 === 0;
}

// Returns the unicode glyph for a piece, or '' for an empty square.
function glyphFor(piece) {
    if (!piece) return '';
    return PIECE_GLYPHS[piece.color][piece.type];
}

// ===== Rendering =====

// The board container element that holds all 64 squares.
const boardElement = document.getElementById('board');

// The tooltip beside the back button that names the hovered piece.
const pieceTooltip = document.getElementById('pieceTooltip');

// A piece's display name, e.g. white knight -> "White Knight".
function pieceName(piece) {
    const color = piece.color === 'white' ? 'White' : 'Black';
    const type = piece.type[0].toUpperCase() + piece.type.slice(1);
    return `${color} ${type}`;
}

// Shows the hovered piece's name in the tooltip (or clears it when empty).
function showPieceTooltip(piece) {
    pieceTooltip.textContent = piece ? pieceName(piece) : '';
}

// Builds the glyph element for a piece, color-classed so CSS can paint it.
// Returns null for an empty square so nothing is rendered there.
function createPieceElement(piece) {
    if (!piece) return null;
    const glyph = document.createElement('span');
    glyph.className = `piece piece-${piece.color}`; // piece-white / piece-black
    glyph.textContent = glyphFor(piece);
    return glyph;
}

// True when the given square is the one the player has currently picked up.
function isSelected(row, col) {
    return selectedSquare !== null && selectedSquare[0] === row && selectedSquare[1] === col;
}

// True when (row, col) is one of the highlighted destinations for the pickup.
function isLegalTarget(row, col) {
    return legalTargets.some((target) => target[0] === row && target[1] === col);
}

// Adds the move-hint class to a target: a ring if it captures, else a dot.
function markTarget(square, row, col) {
    const capture = board[row][col] !== null; // Occupied target = a capture
    square.classList.add(capture ? 'legal-capture' : 'legal-move');
}

// Algebraic address of a square, e.g. row 7/col 1 -> "B1". Files a-h run
// across the columns; ranks 8-1 run down the rows (row 0 is Black's rank 8).
function squareAddress(row, col) {
    const file = String.fromCharCode('A'.charCodeAt(0) + col);
    const rank = BOARD_SIZE - row;
    return `${file}${rank}`;
}

// Builds the small coordinate label shown in a square's lower-left corner.
function createCoordLabel(row, col) {
    const label = document.createElement('span');
    label.className = 'square-coord';
    label.textContent = squareAddress(row, col);
    return label;
}

// Builds a single square element: colored, holding its piece, and clickable.
function createSquare(board, row, col) {
    const square = document.createElement('div');
    square.className = `square ${isLightSquare(row, col) ? 'light' : 'dark'}`;
    if (isSelected(row, col)) square.classList.add('selected'); // Highlight pickup
    if (isLegalTarget(row, col)) markTarget(square, row, col);  // Show where it can go
    square.appendChild(createCoordLabel(row, col));            // Address in the corner
    const occupant = board[row][col];
    const piece = createPieceElement(occupant);
    if (piece) square.appendChild(piece);
    square.addEventListener('click', () => handleSquareClick(row, col));
    // Name the piece in the tooltip while the cursor is over its square.
    square.addEventListener('mouseenter', () => showPieceTooltip(occupant));
    square.addEventListener('mouseleave', () => showPieceTooltip(null));
    return square;
}

// Draws every square of the given board model into the DOM.
function renderBoard(board) {
    boardElement.innerHTML = ''; // Clear any previous render
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            boardElement.appendChild(createSquare(board, row, col));
        }
    }
}

// Applies a single move to the board model, moving the piece from -> to.
function applyMove(board, move) {
    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;
    board[toRow][toCol] = board[fromRow][fromCol]; // Place piece on destination
    board[fromRow][fromCol] = null;                // Vacate the origin square
}

// ===== Move generation =====
// Each piece type lists the squares it may legally move to from a position.
// These rules cover normal movement and captures; castling, en passant and
// promotion are out of scope for replaying the recorded matches.

// True when (row, col) lies on the board.
function isOnBoard(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

// True when the square is empty.
function isEmpty(board, row, col) {
    return board[row][col] === null;
}

// True when the square holds a piece of the opposite color to `color`.
function isEnemy(board, row, col, color) {
    const piece = board[row][col];
    return piece !== null && piece.color !== color;
}

// True when a piece of `color` may land on (row, col): empty or an enemy.
function canLandOn(board, row, col, color) {
    return isOnBoard(row, col) && (isEmpty(board, row, col) || isEnemy(board, row, col, color));
}

// Step offsets shared by several pieces, as [rowDelta, colDelta] pairs.
const DIAGONAL_STEPS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const STRAIGHT_STEPS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const KNIGHT_STEPS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];

// Collects squares reachable by repeatedly stepping in each direction until
// blocked. Used by the bishop, rook and queen (the "sliding" pieces).
function slidingTargets(board, row, col, color, steps) {
    const targets = [];
    for (const [rowStep, colStep] of steps) {
        let r = row + rowStep;
        let c = col + colStep;
        while (isOnBoard(r, c) && isEmpty(board, r, c)) {
            targets.push([r, c]);       // Glide across empty squares
            r += rowStep;
            c += colStep;
        }
        if (isOnBoard(r, c) && isEnemy(board, r, c, color)) {
            targets.push([r, c]);       // Capture the first enemy in the way
        }
    }
    return targets;
}

// Collects squares reachable by a single step in each direction (king, knight).
function stepTargets(board, row, col, color, steps) {
    const targets = [];
    for (const [rowStep, colStep] of steps) {
        const r = row + rowStep;
        const c = col + colStep;
        if (canLandOn(board, r, c, color)) targets.push([r, c]);
    }
    return targets;
}

// Pawns move forward one (or two from their start) and capture diagonally.
// White moves up the board (row decreases); Black moves down (row increases).
function pawnTargets(board, row, col, color) {
    const targets = [];
    const forward = color === 'white' ? -1 : 1;     // Direction of travel
    const startRow = color === 'white' ? 6 : 1;     // Rank pawns start on

    // One step forward onto an empty square.
    if (isOnBoard(row + forward, col) && isEmpty(board, row + forward, col)) {
        targets.push([row + forward, col]);
        // Two steps forward from the starting rank, if both squares are empty.
        if (row === startRow && isEmpty(board, row + 2 * forward, col)) {
            targets.push([row + 2 * forward, col]);
        }
    }
    // Diagonal captures of an enemy piece.
    for (const colStep of [-1, 1]) {
        const r = row + forward;
        const c = col + colStep;
        if (isOnBoard(r, c) && isEnemy(board, r, c, color)) targets.push([r, c]);
    }
    return targets;
}

// Returns every square the piece on (row, col) may move to, by its type.
function legalMovesFor(board, row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    switch (piece.type) {
        case 'pawn':   return pawnTargets(board, row, col, piece.color);
        case 'knight': return stepTargets(board, row, col, piece.color, KNIGHT_STEPS);
        case 'bishop': return slidingTargets(board, row, col, piece.color, DIAGONAL_STEPS);
        case 'rook':   return slidingTargets(board, row, col, piece.color, STRAIGHT_STEPS);
        case 'queen':  return slidingTargets(board, row, col, piece.color, [...DIAGONAL_STEPS, ...STRAIGHT_STEPS]);
        case 'king':   return stepTargets(board, row, col, piece.color, [...DIAGONAL_STEPS, ...STRAIGHT_STEPS]);
        default:       return [];
    }
}

// ===== Check & checkmate detection =====

// The opposite color, used to ask "who is attacking me?".
function opponentColor(color) {
    return color === 'white' ? 'black' : 'white';
}

// Finds the [row, col] of the given color's king, or null if it is gone.
function findKing(board, color) {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'king' && piece.color === color) {
                return [row, col];
            }
        }
    }
    return null;
}

// True when any piece of `byColor` can move onto (row, col) — i.e. attacks it.
function isSquareAttackedBy(board, row, col, byColor) {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = board[r][c];
            if (!piece || piece.color !== byColor) continue;
            const targets = legalMovesFor(board, r, c);
            if (targets.some(([tr, tc]) => tr === row && tc === col)) return true;
        }
    }
    return false;
}

// True when the given color's king is currently under attack (in check).
function isInCheck(board, color) {
    const king = findKing(board, color);
    if (!king) return false;                       // No king: not a check
    return isSquareAttackedBy(board, king[0], king[1], opponentColor(color));
}

// Every legal move for a color, as { from, to } objects.
function allMovesFor(board, color) {
    const moves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (!piece || piece.color !== color) continue;
            for (const to of legalMovesFor(board, row, col)) {
                moves.push({ from: [row, col], to });
            }
        }
    }
    return moves;
}

// Returns a deep copy of the board so trial moves don't mutate the real one.
function cloneBoard(board) {
    return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

// True when `color` has no move that escapes check — i.e. it is checkmated.
// We try every move on a copy and keep any that leaves the king safe.
function isCheckmate(board, color) {
    if (!isInCheck(board, color)) return false;    // Not in check: not mate
    return allMovesFor(board, color).every((move) => {
        const trial = cloneBoard(board);
        applyMove(trial, move);
        return isInCheck(trial, color);            // Still in check after the move
    });
}

// ===== Match difficulty =====

// The shared match module: opening replies plus the difficulty curve.
import { OPENING_REPLIES, searchDepthForMatch } from '../chess-game-match/chess-game-match.js';

// The match currently being played, and how far ahead the computer looks.
let currentMatchNumber = 1;
let searchDepth = 1;

// Reads the requested match number from the page URL (?match=N), or null.
function requestedMatchNumber() {
    const value = new URLSearchParams(window.location.search).get('match');
    return value ? Number(value) : null;
}

// ===== Match progress (persisted across pages via localStorage) =====

// localStorage key holding the list of completed match numbers.
const PROGRESS_KEY = 'chessCompletedMatches';

// Records `matchNumber` as completed so the next match unlocks on the front page.
function markMatchCompleted(matchNumber) {
    let completed;
    try {
        completed = JSON.parse(localStorage.getItem(PROGRESS_KEY)) || [];
    } catch {
        completed = []; // Corrupt or missing data: start fresh
    }
    if (!completed.includes(matchNumber)) {
        completed.push(matchNumber);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
    }
}

// ===== Interactive game state =====

// The live board model the player acts on.
let board = createStartingPosition();

// The square the player has picked up as [row, col], or null if none.
let selectedSquare = null;

// Destinations the picked-up piece may move to, as [row, col] pairs.
let legalTargets = [];

// The opponent's recorded replies (Black's moves from the match), in order.
let opponentMoves = [];

// Index of the next opponent reply to play from opponentMoves.
let opponentMoveIndex = 0;

// True while it is the player's turn; false during the opponent's reply.
let playerTurn = true;

// True once the game has ended (checkmate); blocks all further moves.
let gameOver = false;

// Captured pieces each side has taken, kept for the on-screen trays.
let whiteCaptures = []; // Black pieces taken by White (shown lower-right)
let blackCaptures = []; // White pieces taken by Black (shown upper-left)

// ===== Captured-piece trays =====

// The two tray elements that list captured pieces.
const whiteCapturesElement = document.getElementById('capturedByWhite');
const blackCapturesElement = document.getElementById('capturedByBlack');

// Fills a tray element with colored glyphs for the given captured pieces.
function fillTray(element, pieces) {
    element.innerHTML = '';                    // Clear the previous render
    for (const piece of pieces) {
        const glyph = createPieceElement(piece); // Keeps piece-white/black color
        // Name the captured piece in the tooltip while the cursor is over it.
        glyph.addEventListener('mouseenter', () => showPieceTooltip(piece));
        glyph.addEventListener('mouseleave', () => showPieceTooltip(null));
        element.appendChild(glyph);
    }
}

// Draws both capture trays from the current capture lists.
function renderCaptures() {
    fillTray(whiteCapturesElement, whiteCaptures);
    fillTray(blackCapturesElement, blackCaptures);
}

// Records the piece a move captures (if any) into the mover's tray.
// `mover` is the color making the move; the captured piece is the opponent's.
function recordCapture(move, mover) {
    const [toRow, toCol] = move.to;
    const target = board[toRow][toCol];
    if (!target) return;                       // Empty destination: no capture
    if (mover === 'white') {
        whiteCaptures.push(target);
    } else {
        blackCaptures.push(target);
    }
    renderCaptures();
}

// ===== Turn indicator =====

// The status-board label showing whose move it is.
const turnElement = document.getElementById('turn');

// Updates the turn label to name the side to move ("White" / "Black").
function showTurn(color) {
    const side = color === 'white' ? 'White' : 'Black';
    turnElement.textContent = `${side} to move`;
}

// True when (row, col) holds a White piece the player may pick up.
function isOwnPiece(row, col) {
    const piece = board[row][col];
    return piece !== null && piece.color === 'white';
}

// ===== Check / checkmate banner =====

// The right-side banner that announces check and checkmate.
const checkIndicator = document.getElementById('checkIndicator');

// Hides the check banner (no check to show).
function hideCheckBanner() {
    checkIndicator.classList.remove('show');
    checkIndicator.textContent = '';
}

// Shows the check banner with the given message on the right side.
function showCheckBanner(message) {
    checkIndicator.textContent = message;
    checkIndicator.classList.add('show');
}

// Whose king is the player's vs the opponent's, for readable messages.
const PLAYER_COLOR = 'white';
const OPPONENT_COLOR = 'black';

// Front page to return to after winning a match, so the player can pick
// the next unlocked one. Pause first so the winning move is visible.
const FRONT_PAGE_URL = '../front-chess-page/front-chess-page.html';
const RETURN_DELAY_MS = 1500;

// Player won: record progress and return to the match-selection page.
function winMatch() {
    gameOver = true;
    showCheckBanner('You win!');
    markMatchCompleted(currentMatchNumber);     // Unlock the next match
    setTimeout(() => { window.location.href = FRONT_PAGE_URL; }, RETURN_DELAY_MS);
}

// Player lost: end the match. Reloading the page restarts it.
function loseMatch() {
    gameOver = true;
    showCheckBanner('You lose!');
}

// Updates the banner and game state after a move by either side.
// A captured or checkmated king ends the match; otherwise announce check.
function updateCheckStatus() {
    // Capturing (or checkmating) the computer's king wins the match.
    if (!findKing(board, OPPONENT_COLOR) || isCheckmate(board, OPPONENT_COLOR)) {
        winMatch();
        return;
    }
    // Losing the player's own king (or being mated) loses the match.
    if (!findKing(board, PLAYER_COLOR) || isCheckmate(board, PLAYER_COLOR)) {
        loseMatch();
        return;
    }
    // Otherwise flag a plain check against whichever king is attacked.
    if (isInCheck(board, OPPONENT_COLOR)) {
        showCheckBanner('Check — Black');
    } else if (isInCheck(board, PLAYER_COLOR)) {
        showCheckBanner('Check — White');
    } else {
        hideCheckBanner();
    }
}

// ===== Opponent replies =====

// Delay before the opponent replies, so the player sees their own move land.
const OPPONENT_REPLY_MS = 450;

// Plays the opponent's next recorded reply, then hands the turn back. If the
// match has no reply left, the turn simply returns to the player.
function playOpponentReply() {
    const move = chooseOpponentMove();
    if (!move) {                       // No legal reply (game over): player stays
        playerTurn = true;
        return;
    }
    setTimeout(() => {
        recordCapture(move, 'black');  // Track any White piece Black takes
        applyMove(board, move);
        renderBoard(board);
        updateCheckStatus();           // Announce check / checkmate from the reply
        playerTurn = !gameOver;        // Player may move again unless the game ended
        if (!gameOver) showTurn('white'); // Back to the player's turn
    }, OPPONENT_REPLY_MS);
}

// Picks the opponent's next move: the recorded match reply while one remains,
// otherwise a move the computer chooses for itself so play can continue.
function chooseOpponentMove() {
    const recorded = opponentMoves[opponentMoveIndex];
    if (recorded) {
        opponentMoveIndex++;
        return recorded;
    }
    return computerMove();
}

// ===== Computer opponent (depth-scaled minimax) =====
// The computer plays Black. It searches a few moves ahead and picks the line
// that maximises its material; how deep it looks is set per match, so higher
// matches play stronger chess. Material only — no positional scoring.

// Point value of each piece type, used to score a position.
const PIECE_VALUES = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 1000 };

// Scores a board from Black's perspective: Black material minus White material.
function evaluateForBlack(board) {
    let score = 0;
    for (const row of board) {
        for (const piece of row) {
            if (!piece) continue;
            const value = PIECE_VALUES[piece.type];
            score += piece.color === 'black' ? value : -value;
        }
    }
    return score;
}

// Every legal move for `color`, as { from, to } objects.
function movesForColor(board, color) {
    const moves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (!piece || piece.color !== color) continue;
            for (const to of legalMovesFor(board, row, col)) {
                moves.push({ from: [row, col], to });
            }
        }
    }
    return moves;
}

// Minimax search returning the best achievable Black score `depth` plies deep.
// Black (the computer) maximises the score; White (the player) minimises it.
function minimax(board, depth, blackToMove) {
    if (depth === 0) return evaluateForBlack(board);
    const moves = movesForColor(board, blackToMove ? 'black' : 'white');
    if (moves.length === 0) return evaluateForBlack(board); // No moves: score as-is

    let best = blackToMove ? -Infinity : Infinity;
    for (const move of moves) {
        const trial = cloneBoard(board);
        applyMove(trial, move);
        const score = minimax(trial, depth - 1, !blackToMove);
        best = blackToMove ? Math.max(best, score) : Math.min(best, score);
    }
    return best;
}

// Chooses Black's best move by searching `searchDepth` plies ahead.
// Returns null when Black has no legal move.
function computerMove() {
    const moves = movesForColor(board, 'black');
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestScore = -Infinity;
    for (const move of moves) {
        const trial = cloneBoard(board);
        applyMove(trial, move);
        // The remaining lookahead is one less than this match's depth.
        const score = minimax(trial, searchDepth - 1, false);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
}

// ===== Click handling =====

// Picks up the player's own piece and computes where it may move.
function selectSquare(row, col) {
    selectedSquare = [row, col];
    legalTargets = legalMovesFor(board, row, col);
    renderBoard(board);
}

// Clears the current selection and its highlighted targets.
function clearSelection() {
    selectedSquare = null;
    legalTargets = [];
}

// Moves the picked-up piece to (row, col), then lets the opponent reply.
function movePlayerPiece(row, col) {
    const move = { from: selectedSquare, to: [row, col] };
    recordCapture(move, 'white');     // Track any Black piece White takes
    applyMove(board, move);
    clearSelection();
    playerTurn = false;               // Lock input until the opponent replies
    renderBoard(board);
    updateCheckStatus();              // Announce check / checkmate from this move
    if (gameOver) return;             // Player just delivered mate: no reply
    showTurn('black');                // Opponent (Black) is now to move
    playOpponentReply();              // Opponent moves only after the player
}

// Routes a square click: pick up a piece, move to a highlighted target,
// or clear the selection on any other click.
function handleSquareClick(row, col) {
    if (gameOver || !playerTurn) return; // Game over, or awaiting opponent's reply
    if (selectedSquare === null) {
        if (isOwnPiece(row, col)) selectSquare(row, col);
        return;
    }
    if (isLegalTarget(row, col)) {
        movePlayerPiece(row, col);     // Clicked a highlighted destination: move
    } else if (isOwnPiece(row, col)) {
        selectSquare(row, col);        // Clicked another own piece: switch pickup
    } else {
        clearSelection();              // Clicked elsewhere: drop the piece
        renderBoard(board);
    }
}

// ===== Game start =====

// Resets to the starting position for the loaded match and renders it.
function startNewGame() {
    board = createStartingPosition();
    clearSelection();
    opponentMoveIndex = 0;
    playerTurn = true;
    gameOver = false;
    whiteCaptures = [];               // Clear both capture trays
    blackCaptures = [];
    hideCheckBanner();
    renderCaptures();                 // Empty the trays on screen
    showTurn('white');                // White (the player) starts
    renderBoard(board);
}

// Sets up the requested match: its opening replies and difficulty depth.
function loadMatch(matchNumber) {
    currentMatchNumber = matchNumber;
    searchDepth = searchDepthForMatch(matchNumber); // Harder the higher the match
    opponentMoves = OPENING_REPLIES;                 // Shared scripted opening
    startNewGame();
}

// On load, set up the requested match if one was chosen, else match 1.
loadMatch(requestedMatchNumber() || 1);
