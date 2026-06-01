// ============================================================
// Chess front page
// Builds a grid of ten square match buttons. Only the next match
// to play is clickable: matches already won are disabled (and show
// a checkmark), and matches not yet reached are disabled too.
// Progress is read from localStorage, written by the board.
// ============================================================

// Total number of matches the game offers.
const MATCH_COUNT = 10;

// localStorage key holding the list of completed match numbers (shared
// with the board page, which writes to it after a win).
const PROGRESS_KEY = 'chessCompletedMatches';

// The grid element that holds the ten match buttons.
const matchGrid = document.getElementById('matchGrid');

// Reads the set of completed match numbers from localStorage.
function completedMatches() {
    try {
        return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY)) || []);
    } catch {
        return new Set(); // Corrupt or missing data: nothing completed yet
    }
}

// Formats a match number as a two-digit label, e.g. 1 -> "01".
function matchLabel(matchNumber) {
    return String(matchNumber).padStart(2, '0');
}

// Builds the board URL that opens a given match, e.g.
// "../chess-board/index.html?match=1". The board lives in the sibling
// chess-board folder, one level up from this front page.
function matchUrl(matchNumber) {
    return `../chess-board/index.html?match=${matchNumber}`;
}

// The only playable match is the first one not yet won: match 1 if none are
// completed, otherwise the one right after the highest completed match.
function isPlayable(matchNumber, completed) {
    return !completed.has(matchNumber)                 // Already-won matches are locked
        && (matchNumber === 1 || completed.has(matchNumber - 1)); // Previous must be won
}

// Creates one square button for a match: clickable only when it is the next
// match to play. Won matches are disabled and show a checkmark; later matches
// stay locked until reached.
function createMatchButton(matchNumber, completed) {
    const button = document.createElement('button');
    button.className = 'match-button';
    button.textContent = matchLabel(matchNumber);

    if (completed.has(matchNumber)) button.classList.add('completed'); // Won badge

    if (isPlayable(matchNumber, completed)) {
        button.addEventListener('click', () => {
            window.location.href = matchUrl(matchNumber);
        });
    } else {
        button.disabled = true; // Already won, or not yet reached
    }
    return button;
}

// Draws all ten match buttons into the grid, reflecting saved progress.
function renderMatchButtons() {
    const completed = completedMatches();
    for (let matchNumber = 1; matchNumber <= MATCH_COUNT; matchNumber++) {
        matchGrid.appendChild(createMatchButton(matchNumber, completed));
    }
}

// Build the match grid as soon as the page loads.
renderMatchButtons();
