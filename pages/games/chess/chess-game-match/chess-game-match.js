// ============================================================
// Chess match difficulty
// Drives all ten matches from one place. Each match shares the
// same opening line for Black, then the computer plays on its
// own — thinking further ahead the higher the match number, so
// matches get harder as the player progresses.
// Squares use the board model's [row, col] coordinates, where
// row 0 is Black's back rank and col 0 is the a-file.
// ============================================================

// Total number of matches the game offers.
const MATCH_COUNT = 10;

// Builds a single move: the piece travels from one square to another.
// `from` and `to` are [row, col] pairs on the 8x8 board.
function makeMove(from, to) {
    return { from, to };
}

// Black's scripted opening replies, played before the computer takes over.
// This follows Black's side of the Italian Game (1...e5 2...Nc6).
const OPENING_REPLIES = [
    makeMove([1, 4], [3, 4]), // Black pawn e7 -> e5
    makeMove([0, 1], [2, 2]), // Black knight b8 -> c6
];

// How many plies (half-moves) the computer looks ahead for a given match.
// Match 1 plays simple one-move-greedy chess; the deepest matches search
// several moves ahead, making them progressively harder to beat.
function searchDepthForMatch(matchNumber) {
    // Clamp the match number into range, then map 1..10 -> depth 1..4.
    const clamped = Math.min(Math.max(matchNumber, 1), MATCH_COUNT);
    return 1 + Math.floor((clamped - 1) / 3); // 1-3 -> 1, 4-6 -> 2, 7-9 -> 3, 10 -> 4
}

// Exposed for the board script to drive each match's difficulty.
export { MATCH_COUNT, OPENING_REPLIES, searchDepthForMatch };
