// pseudovimim.js — Modal Vim-like text editor running inside the terminal window

(function () {

// Prefix used when persisting saved files as strings in localStorage
const STORAGE_FILE_PREFIX = 'vpos_file:';
// Number of spaces inserted when pressing Tab in Insert mode
const TAB_SPACES = '    ';
// Minimum number of visible rows so tilde (~) padding fills the viewport without overflowing
const MIN_VISIBLE_ROWS = 13;
// Maximum undo snapshots kept in memory per editing session
const MAX_UNDO_STACK = 50;

// Editor state scoped to the PseudoVimim instance
let vimIsActive      = false;
let vimMode          = 'NORMAL';  // 'NORMAL' | 'INSERT' | 'COMMAND'
let vimFilename      = '';        // active file name (empty string for [No Name])
let vimLines         = [''];      // array of buffer lines
let vimCursorRow     = 0;         // 0-indexed current line
let vimCursorCol     = 0;         // 0-indexed current column
let vimDirty         = false;     // true when buffer has unsaved edits
let vimShowNumbers   = true;      // whether the line-number gutter is visible
let vimCommandBuf    = '';        // text after ':' in COMMAND mode
let vimStatusMsg     = '';        // status or error message shown on the bottom line
let vimStatusIsError = false;     // true when vimStatusMsg should render in red
let vimPendingKey    = '';        // buffered operator key in NORMAL mode ('d', 'y', 'g', 'r')
let vimYankLine      = null;      // most recently yanked or deleted full line
let vimUndoStack     = [];        // stack of previous buffer snapshots for `u`
let vimInlineResults = {};        // map of rowIndex -> { text, isError } from Ctrl+E evaluations
let vimFilesRef      = null;      // reference to the terminal's VIRTUAL_FILES map
let vimOnExit        = null;      // callback invoked when quitting PseudoVimim
let vimActiveCourse  = null;      // active course controller (e.g. window.OdinCourse) when in course mode

// DOM elements inside `#vim-container`
const container  = document.getElementById('vim-container');
const rowsEl     = document.getElementById('vim-rows');
const statusFile = document.getElementById('vim-status-file');
const statusPos  = document.getElementById('vim-status-pos');
const cmdLineEl  = document.getElementById('vim-cmdline');

// Saves a copy of the current buffer and cursor position onto the undo stack.
function pushUndoSnapshot() {
    vimUndoStack.push({
        lines: [...vimLines],
        row:   vimCursorRow,
        col:   vimCursorCol,
    });
    if (vimUndoStack.length > MAX_UNDO_STACK) {
        vimUndoStack.shift();
    }
}

// Restores the most recent buffer snapshot from the undo stack.
function restoreUndoSnapshot() {
    if (vimUndoStack.length === 0) {
        setStatusMessage('Already at oldest change', false);
        return;
    }
    const snap       = vimUndoStack.pop();
    vimLines         = snap.lines;
    vimCursorRow     = snap.row;
    vimCursorCol     = snap.col;
    vimInlineResults = {};
    clampCursor();
    setStatusMessage('1 change undone', false);
}

// Sets the bottom status/notification message and whether it is styled as an error.
function setStatusMessage(msg, isError) {
    vimStatusMsg     = msg;
    vimStatusIsError = Boolean(isError);
}

// Keeps the cursor within the valid bounds of the current buffer and mode.
function clampCursor() {
    if (vimLines.length === 0) {
        vimLines = [''];
    }
    vimCursorRow = Math.max(0, Math.min(vimCursorRow, vimLines.length - 1));
    const lineLen = vimLines[vimCursorRow].length;

    if (vimMode === 'INSERT') {
        // In Insert mode the cursor may sit one column past the last character
        vimCursorCol = Math.max(0, Math.min(vimCursorCol, lineLen));
    } else {
        // In Normal mode the cursor sits on an existing character (or 0 if empty)
        vimCursorCol = Math.max(0, Math.min(vimCursorCol, Math.max(0, lineLen - 1)));
    }
}

// Returns the syntax highlighter (`PythonHighlight`, `CHighlight`, or `AsmHighlight`) matching `vimFilename`.
function getActiveHighlighter() {
    const lowerName = (vimFilename || '').toLowerCase();
    if (lowerName.endsWith('.py') && window.PythonHighlight) {
        return window.PythonHighlight;
    }
    if ((lowerName.endsWith('.c') || lowerName.endsWith('.h')) && window.CHighlight) {
        return window.CHighlight;
    }
    if ((lowerName.endsWith('.asm') || lowerName.endsWith('.s')) && window.AsmHighlight) {
        return window.AsmHighlight;
    }
    if (lowerName.endsWith('.java') && window.JavaHighlight) {
        return window.JavaHighlight;
    }
    return null;
}

// Appends syntax-highlighted text (or plain text if no highlighter applies) to `parentEl`.
function appendHighlightedSlice(parentEl, fullLineTokens, startCol, endCol, fallbackText) {
    if (!fullLineTokens || fullLineTokens.length === 0) {
        const slice = fallbackText.slice(startCol, endCol);
        if (slice) {
            parentEl.appendChild(document.createTextNode(slice));
        }
        return;
    }

    let offset = 0;
    for (const tok of fullLineTokens) {
        const tokStart = offset;
        const tokEnd   = offset + tok.text.length;
        offset         = tokEnd;

        const overlapStart = Math.max(startCol, tokStart);
        const overlapEnd   = Math.min(endCol, tokEnd);
        if (overlapStart >= overlapEnd) {
            continue;
        }

        const subText = tok.text.slice(overlapStart - tokStart, overlapEnd - tokStart);
        if (tok.cls) {
            const span = document.createElement('span');
            span.className   = tok.cls;
            span.textContent = subText;
            parentEl.appendChild(span);
        } else {
            parentEl.appendChild(document.createTextNode(subText));
        }
    }
}

// Builds a single buffer row DOM element with optional line number, syntax highlight, cursor cell, and inline Ctrl+E result.
function buildBufferRow(lineText, rowIndex) {
    const row = document.createElement('div');
    row.className = 'vim-row' + (rowIndex === vimCursorRow ? ' active-row' : '');

    if (vimShowNumbers) {
        const gutter = document.createElement('span');
        gutter.className   = 'vim-gutter';
        gutter.textContent = String(rowIndex + 1);
        row.appendChild(gutter);
    }

    const content = document.createElement('span');
    content.className = 'vim-line-text';

    const highlighter = getActiveHighlighter();
    const lineTokens  = highlighter && lineText.length > 0 ? highlighter.tokenizeLine(lineText) : null;

    if (rowIndex === vimCursorRow) {
        const atChar = vimCursorCol < lineText.length ? lineText[vimCursorCol] : ' ';

        appendHighlightedSlice(content, lineTokens, 0, vimCursorCol, lineText);

        const cursorSpan = document.createElement('span');
        cursorSpan.className   = vimMode === 'INSERT' ? 'vim-cursor-insert' : 'vim-cursor-normal';
        cursorSpan.textContent = atChar;
        content.appendChild(cursorSpan);

        if (vimCursorCol < lineText.length) {
            appendHighlightedSlice(content, lineTokens, vimCursorCol + 1, lineText.length, lineText);
        }
    } else if (lineText.length > 0) {
        appendHighlightedSlice(content, lineTokens, 0, lineText.length, lineText);
    } else {
        content.textContent = ' ';
    }

    row.appendChild(content);

    // Append inline Python evaluation output (Ctrl+E) on the same line in a distinct color
    const evalInfo = vimInlineResults[rowIndex];
    if (evalInfo && evalInfo.text) {
        const evalSpan = document.createElement('span');
        evalSpan.className   = 'vim-eval-result' + (evalInfo.isError ? ' error' : '');
        evalSpan.textContent = `# => ${evalInfo.text}`;
        row.appendChild(evalSpan);
    }

    return row;
}

// Renders all buffer lines, trailing tilde (~) rows, the status bar, and the bottom command bar.
function renderVim() {
    rowsEl.innerHTML = '';

    for (let i = 0; i < vimLines.length; i++) {
        rowsEl.appendChild(buildBufferRow(vimLines[i], i));
    }

    // Fill remaining viewport space with classic Vim tilde (~) lines
    const tildeCount = Math.max(2, MIN_VISIBLE_ROWS - vimLines.length);
    for (let t = 0; t < tildeCount; t++) {
        const tildeRow = document.createElement('div');
        tildeRow.className = 'vim-row';
        const tildeSpan = document.createElement('span');
        tildeSpan.className   = 'vim-tilde';
        tildeSpan.textContent = '~';
        tildeRow.appendChild(tildeSpan);
        rowsEl.appendChild(tildeRow);
    }

    // Keep the active cursor row scrolled into view
    const activeRowEl = rowsEl.querySelector('.active-row');
    if (activeRowEl) {
        activeRowEl.scrollIntoView({ block: 'nearest' });
    }

    // Update status bar (filename + dirty flag on left, mode + row,col on right)
    const displayName = vimFilename || '[No Name]';
    const dirtyFlag   = vimDirty ? ' [+]' : '';
    statusFile.textContent = `"${displayName}"${dirtyFlag} — ${vimLines.length}L`;
    statusPos.textContent  = `${vimMode}   ${vimCursorRow + 1},${vimCursorCol + 1}`;

    // Update bottom command/message line
    cmdLineEl.classList.toggle('error', vimStatusIsError && vimMode !== 'COMMAND');
    if (vimMode === 'COMMAND') {
        cmdLineEl.textContent = ':' + vimCommandBuf + '█';
    } else if (vimMode === 'INSERT') {
        cmdLineEl.textContent = vimStatusMsg ? `-- INSERT --   ${vimStatusMsg}` : '-- INSERT --';
    } else {
        cmdLineEl.textContent = vimStatusMsg;
    }
}

// Writes the current buffer contents as a plain string into VIRTUAL_FILES and localStorage.
function saveBuffer(targetName) {
    const name = (targetName || vimFilename).trim();
    if (!name) {
        setStatusMessage('E32: No file name (use :w <filename>)', true);
        return false;
    }
    vimFilename = name;
    const contentString = vimLines.join('\n');

    if (vimFilesRef) {
        vimFilesRef[vimFilename] = contentString;
    }
    try {
        localStorage.setItem(STORAGE_FILE_PREFIX + vimFilename, contentString);
    } catch {
        // Ignore storage quota errors in restricted browsing contexts
    }

    vimDirty = false;
    setStatusMessage(`"${vimFilename}" ${vimLines.length}L, ${contentString.length}B written`, false);
    return true;
}

// Evaluates the current Python, C, Assembly, or Java line/block on Ctrl+E and displays the result inline.
async function handleCtrlE() {
    const lowerName  = (vimFilename || '').toLowerCase();
    const isCFile    = lowerName.endsWith('.c') || lowerName.endsWith('.h');
    const isAsmFile  = lowerName.endsWith('.asm') || lowerName.endsWith('.s');
    const isJavaFile = lowerName.endsWith('.java');

    if (isJavaFile) {
        if (!window.JavaRunner) {
            setStatusMessage('Java runner is not available', true);
            renderVim();
            return;
        }
        setStatusMessage('Evaluating Java...', false);
        renderVim();

        try {
            let result = await window.JavaRunner.evaluateVimTarget(vimLines, vimCursorRow);
            if (vimActiveCourse && typeof vimActiveCourse.formatEvalResult === 'function') {
                result = vimActiveCourse.formatEvalResult(result);
            }
            if (result && result.text) {
                vimInlineResults[result.targetRow] = {
                    text:    result.text,
                    isError: result.isError,
                };
                if (result.isError) {
                    setStatusMessage(result.text, true);
                } else {
                    setStatusMessage(`Evaluated line ${result.targetRow + 1}`, false);
                }
            } else {
                setStatusMessage('Nothing to evaluate on this line', false);
            }
        } catch (err) {
            const errMsg = `Java error: ${err.message || err}`;
            setStatusMessage(
                vimActiveCourse ? `${errMsg} — type :hint` : errMsg,
                true
            );
        }
        renderVim();
        return;
    }

    if (isCFile || isAsmFile) {
        if (!window.CasmRunner) {
            setStatusMessage('C/ASM runner is not available', true);
            renderVim();
            return;
        }
        const lang = isAsmFile ? 'asm' : 'c';
        setStatusMessage(`Evaluating ${lang.toUpperCase()}...`, false);
        renderVim();

        try {
            const result = await window.CasmRunner.evaluateVimTarget(vimLines, vimCursorRow, lang);
            if (result && result.text) {
                vimInlineResults[result.targetRow] = {
                    text:    result.text,
                    isError: result.isError,
                };
                setStatusMessage(`Evaluated line ${result.targetRow + 1}`, false);
            } else {
                setStatusMessage('Nothing to evaluate on this line', false);
            }
        } catch (err) {
            setStatusMessage(`Runner error: ${err.message || err}`, true);
        }
        renderVim();
        return;
    }

    if (!window.PyodideRunner) {
        setStatusMessage('Pyodide runner is not available', true);
        renderVim();
        return;
    }

    setStatusMessage('Evaluating Python 3 (Pyodide)...', false);
    renderVim();

    try {
        const result = await window.PyodideRunner.evaluateVimTarget(vimLines, vimCursorRow);
        if (result && result.text) {
            vimInlineResults[result.targetRow] = {
                text:    result.text,
                isError: result.isError,
            };
            setStatusMessage(`Evaluated line ${result.targetRow + 1}`, false);
        } else {
            setStatusMessage('Nothing to evaluate on this line', false);
        }
    } catch (err) {
        setStatusMessage(`Pyodide error: ${err.message || err}`, true);
    }

    renderVim();
}

// Closes the PseudoVimim interface and hands control back to the shell.
function closeVim(message) {
    vimIsActive   = false;
    vimPendingKey = '';
    container.classList.remove('active');
    if (typeof vimOnExit === 'function') {
        vimOnExit(message);
    }
}

// Parses and executes an Ex command entered after ':' in COMMAND mode.
function executeExCommand(rawCmd) {
    const trimmed = rawCmd.trim();
    vimMode       = 'NORMAL';
    clampCursor();

    if (!trimmed) {
        renderVim();
        return;
    }

    // Jump to line number when the command is purely digits (e.g. :10)
    if (/^\d+$/.test(trimmed)) {
        vimCursorRow = Math.max(0, Math.min(parseInt(trimmed, 10) - 1, vimLines.length - 1));
        vimCursorCol = 0;
        clampCursor();
        renderVim();
        return;
    }

    const [cmd, ...args] = trimmed.split(/\s+/);
    const argStr         = args.join(' ');

    switch (cmd) {
        case 'w':
        case 'write':
            saveBuffer(argStr);
            renderVim();
            break;

        case 'q':
        case 'quit':
            if (vimDirty) {
                setStatusMessage('E37: No write since last change (add ! to override, or use :wq)', true);
                renderVim();
            } else {
                closeVim();
            }
            break;

        case 'q!':
        case 'quit!':
            closeVim();
            break;

        case 'wq':
        case 'wq!':
        case 'x':
            if (saveBuffer(argStr)) {
                closeVim(`"${vimFilename}" ${vimLines.length}L written`);
            } else {
                renderVim();
            }
            break;

        case 'set':
            if (argStr === 'nu' || argStr === 'number') {
                vimShowNumbers = true;
                setStatusMessage('Line numbers enabled', false);
            } else if (argStr === 'nonu' || argStr === 'nonumber') {
                vimShowNumbers = false;
                setStatusMessage('Line numbers disabled', false);
            } else {
                setStatusMessage(`E518: Unknown option: ${argStr}`, true);
            }
            renderVim();
            break;

        case 'help':
            if (vimActiveCourse) {
                setStatusMessage(`E492: Not an editor command: ${trimmed}`, true);
            } else {
                setStatusMessage('Keys: i/a/o/O (insert), Esc (normal), Ctrl+E (eval), hjkl/0/$/w/b/gg/G, x/dd/yy/p/u, :w :q :wq', false);
            }
            renderVim();
            break;

        case 'next':
            if (vimActiveCourse && typeof vimActiveCourse.nextStep === 'function') {
                const stepResult = vimActiveCourse.nextStep();
                if (stepResult.advanced) {
                    pushUndoSnapshot();
                    vimLines         = stepResult.lines;
                    vimCursorRow     = vimLines.length - 1;
                    vimCursorCol     = 0;
                    vimInlineResults = {};
                    vimDirty         = false;
                    if (vimFilesRef && vimFilename) {
                        vimFilesRef[vimFilename] = vimLines.join('\n');
                    }
                    clampCursor();
                    setStatusMessage('', false);
                } else {
                    setStatusMessage('Already at the final part (20/20)', false);
                }
            } else {
                setStatusMessage(`E492: Not an editor command: ${trimmed}`, true);
            }
            renderVim();
            break;

        case 'prev':
            if (vimActiveCourse && typeof vimActiveCourse.prevStep === 'function') {
                const stepResult = vimActiveCourse.prevStep();
                if (stepResult.advanced) {
                    pushUndoSnapshot();
                    vimLines         = stepResult.lines;
                    vimCursorRow     = vimLines.length - 1;
                    vimCursorCol     = 0;
                    vimInlineResults = {};
                    vimDirty         = false;
                    if (vimFilesRef && vimFilename) {
                        vimFilesRef[vimFilename] = vimLines.join('\n');
                    }
                    clampCursor();
                    setStatusMessage('', false);
                } else {
                    setStatusMessage('Already at the first screen', false);
                }
            } else {
                setStatusMessage(`E492: Not an editor command: ${trimmed}`, true);
            }
            renderVim();
            break;

        case 'part':
            if (vimActiveCourse && typeof vimActiveCourse.goToPart === 'function') {
                const stepResult = vimActiveCourse.goToPart(argStr);
                if (stepResult.advanced) {
                    pushUndoSnapshot();
                    vimLines         = stepResult.lines;
                    vimCursorRow     = vimLines.length - 1;
                    vimCursorCol     = 0;
                    vimInlineResults = {};
                    vimDirty         = false;
                    if (vimFilesRef && vimFilename) {
                        vimFilesRef[vimFilename] = vimLines.join('\n');
                    }
                    clampCursor();
                    setStatusMessage('', false);
                } else {
                    setStatusMessage('Usage: :part <1-20>', true);
                }
            } else {
                setStatusMessage(`E492: Not an editor command: ${trimmed}`, true);
            }
            renderVim();
            break;

        case 'hint':
            if (vimActiveCourse && typeof vimActiveCourse.showHintPopup === 'function') {
                vimActiveCourse.showHintPopup();
                setStatusMessage('Hint opened (press Esc to close)', false);
            } else {
                setStatusMessage(`E492: Not an editor command: ${trimmed}`, true);
            }
            renderVim();
            break;

        case 'score':
            if (vimActiveCourse && typeof vimActiveCourse.showScorePopup === 'function') {
                vimActiveCourse.showScorePopup();
                setStatusMessage('Score opened (press Esc to close)', false);
            } else {
                setStatusMessage(`E492: Not an editor command: ${trimmed}`, true);
            }
            renderVim();
            break;

        default:
            setStatusMessage(`E492: Not an editor command: ${trimmed}`, true);
            renderVim();
    }
}

// Moves the cursor forward to the start of the next word in Normal mode.
function moveWordForward() {
    const line = vimLines[vimCursorRow];
    let col    = vimCursorCol;

    // Skip current word characters, then skip spaces
    while (col < line.length && /\S/.test(line[col])) col++;
    while (col < line.length && /\s/.test(line[col])) col++;

    if (col < line.length) {
        vimCursorCol = col;
    } else if (vimCursorRow < vimLines.length - 1) {
        vimCursorRow++;
        vimCursorCol = 0;
    } else {
        vimCursorCol = Math.max(0, line.length - 1);
    }
}

// Moves the cursor backward to the start of the previous word in Normal mode.
function moveWordBackward() {
    if (vimCursorCol === 0 && vimCursorRow > 0) {
        vimCursorRow--;
        vimCursorCol = Math.max(0, vimLines[vimCursorRow].length - 1);
        return;
    }
    const line = vimLines[vimCursorRow];
    let col    = Math.max(0, vimCursorCol - 1);

    while (col > 0 && /\s/.test(line[col])) col--;
    while (col > 0 && /\S/.test(line[col - 1])) col--;
    vimCursorCol = col;
}

// Handles keystrokes while PseudoVimim is in NORMAL mode.
function handleNormalKey(e) {
    setStatusMessage('', false);

    // Handle two-key sequences ('dd', 'yy', 'gg', 'r<char>')
    if (vimPendingKey === 'r') {
        vimPendingKey = '';
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
            const line = vimLines[vimCursorRow];
            if (line.length > 0) {
                pushUndoSnapshot();
                vimLines[vimCursorRow] =
                    line.slice(0, vimCursorCol) + e.key + line.slice(vimCursorCol + 1);
                delete vimInlineResults[vimCursorRow];
                vimDirty = true;
            }
        }
        renderVim();
        return;
    }

    if (vimPendingKey) {
        const pending = vimPendingKey;
        vimPendingKey = '';

        if (pending === 'd' && e.key === 'd') {
            pushUndoSnapshot();
            vimYankLine = vimLines[vimCursorRow];
            vimLines.splice(vimCursorRow, 1);
            if (vimLines.length === 0) vimLines = [''];
            vimInlineResults = {};
            vimDirty = true;
            clampCursor();
            setStatusMessage('1 line deleted', false);
        } else if (pending === 'y' && e.key === 'y') {
            vimYankLine = vimLines[vimCursorRow];
            setStatusMessage('1 line yanked', false);
        } else if (pending === 'g' && e.key === 'g') {
            vimCursorRow = 0;
            vimCursorCol = 0;
            clampCursor();
        }
        renderVim();
        return;
    }

    switch (e.key) {
        // Basic cursor motions
        case 'h':
        case 'ArrowLeft':
            vimCursorCol = Math.max(0, vimCursorCol - 1);
            break;

        case 'l':
        case 'ArrowRight':
            vimCursorCol++;
            clampCursor();
            break;

        case 'j':
        case 'ArrowDown':
            vimCursorRow++;
            clampCursor();
            break;

        case 'k':
        case 'ArrowUp':
            vimCursorRow--;
            clampCursor();
            break;

        case '0':
        case 'Home':
            vimCursorCol = 0;
            break;

        case '^': {
            const match = vimLines[vimCursorRow].match(/\S/);
            vimCursorCol = match ? match.index : 0;
            break;
        }

        case '$':
        case 'End':
            vimCursorCol = Math.max(0, vimLines[vimCursorRow].length - 1);
            break;

        case 'w':
            moveWordForward();
            clampCursor();
            break;

        case 'b':
            moveWordBackward();
            clampCursor();
            break;

        case 'G':
            vimCursorRow = vimLines.length - 1;
            vimCursorCol = 0;
            clampCursor();
            break;

        // Multi-key prefixes
        case 'g':
        case 'd':
        case 'y':
        case 'r':
            vimPendingKey = e.key;
            break;

        // Entering Insert mode
        case 'i':
            pushUndoSnapshot();
            vimMode = 'INSERT';
            break;

        case 'I': {
            pushUndoSnapshot();
            const firstNonBlank = vimLines[vimCursorRow].match(/\S/);
            vimCursorCol = firstNonBlank ? firstNonBlank.index : 0;
            vimMode = 'INSERT';
            break;
        }

        case 'a':
            pushUndoSnapshot();
            vimMode = 'INSERT';
            if (vimLines[vimCursorRow].length > 0) {
                vimCursorCol++;
            }
            clampCursor();
            break;

        case 'A':
            pushUndoSnapshot();
            vimMode      = 'INSERT';
            vimCursorCol = vimLines[vimCursorRow].length;
            break;

        case 'o':
            pushUndoSnapshot();
            vimLines.splice(vimCursorRow + 1, 0, '');
            vimCursorRow++;
            vimCursorCol = 0;
            vimInlineResults = {};
            vimDirty     = true;
            vimMode      = 'INSERT';
            break;

        case 'O':
            pushUndoSnapshot();
            vimLines.splice(vimCursorRow, 0, '');
            vimCursorCol = 0;
            vimInlineResults = {};
            vimDirty     = true;
            vimMode      = 'INSERT';
            break;

        // Single-key Normal mode edits
        case 'x':
        case 'Delete': {
            const line = vimLines[vimCursorRow];
            if (line.length > 0) {
                pushUndoSnapshot();
                vimLines[vimCursorRow] =
                    line.slice(0, vimCursorCol) + line.slice(vimCursorCol + 1);
                delete vimInlineResults[vimCursorRow];
                vimDirty = true;
                clampCursor();
            }
            break;
        }

        case 'p':
            if (vimYankLine !== null) {
                pushUndoSnapshot();
                vimLines.splice(vimCursorRow + 1, 0, vimYankLine);
                vimCursorRow++;
                vimCursorCol = 0;
                vimInlineResults = {};
                vimDirty     = true;
            }
            break;

        case 'P':
            if (vimYankLine !== null) {
                pushUndoSnapshot();
                vimLines.splice(vimCursorRow, 0, vimYankLine);
                vimCursorCol = 0;
                vimInlineResults = {};
                vimDirty     = true;
            }
            break;

        case 'J':
            if (vimCursorRow < vimLines.length - 1) {
                pushUndoSnapshot();
                const current = vimLines[vimCursorRow];
                const next    = vimLines[vimCursorRow + 1].trimStart();
                vimLines[vimCursorRow] = current ? `${current} ${next}` : next;
                vimLines.splice(vimCursorRow + 1, 1);
                vimInlineResults = {};
                vimDirty = true;
                clampCursor();
            }
            break;

        case 'u':
            restoreUndoSnapshot();
            break;

        // Enter Command-line (:) mode
        case ':':
            vimMode       = 'COMMAND';
            vimCommandBuf = '';
            break;
    }

    renderVim();
}

// Handles keystrokes while PseudoVimim is in INSERT mode.
function handleInsertKey(e) {
    if (e.key === 'Escape' || (e.ctrlKey && e.key === '[')) {
        vimMode      = 'NORMAL';
        vimCursorCol = Math.max(0, vimCursorCol - 1);
        setStatusMessage('', false);
        clampCursor();
        renderVim();
        return;
    }

    const line = vimLines[vimCursorRow];

    switch (e.key) {
        case 'Enter': {
            const before = line.slice(0, vimCursorCol);
            const after  = line.slice(vimCursorCol);
            vimLines[vimCursorRow] = before;
            vimLines.splice(vimCursorRow + 1, 0, after);
            vimCursorRow++;
            vimCursorCol = 0;
            vimInlineResults = {};
            vimDirty     = true;
            break;
        }

        case 'Backspace':
            if (vimCursorCol > 0) {
                vimLines[vimCursorRow] =
                    line.slice(0, vimCursorCol - 1) + line.slice(vimCursorCol);
                vimCursorCol--;
                delete vimInlineResults[vimCursorRow];
                vimDirty = true;
            } else if (vimCursorRow > 0) {
                const prevLineLen = vimLines[vimCursorRow - 1].length;
                vimLines[vimCursorRow - 1] += line;
                vimLines.splice(vimCursorRow, 1);
                vimCursorRow--;
                vimCursorCol = prevLineLen;
                vimInlineResults = {};
                vimDirty     = true;
            }
            break;

        case 'Delete':
            if (vimCursorCol < line.length) {
                vimLines[vimCursorRow] =
                    line.slice(0, vimCursorCol) + line.slice(vimCursorCol + 1);
                delete vimInlineResults[vimCursorRow];
                vimDirty = true;
            } else if (vimCursorRow < vimLines.length - 1) {
                vimLines[vimCursorRow] += vimLines[vimCursorRow + 1];
                vimLines.splice(vimCursorRow + 1, 1);
                vimInlineResults = {};
                vimDirty = true;
            }
            break;

        case 'Tab':
            vimLines[vimCursorRow] =
                line.slice(0, vimCursorCol) + TAB_SPACES + line.slice(vimCursorCol);
            vimCursorCol += TAB_SPACES.length;
            delete vimInlineResults[vimCursorRow];
            vimDirty      = true;
            break;

        case 'ArrowLeft':
            vimCursorCol = Math.max(0, vimCursorCol - 1);
            break;

        case 'ArrowRight':
            vimCursorCol = Math.min(line.length, vimCursorCol + 1);
            break;

        case 'ArrowUp':
            if (vimCursorRow > 0) {
                vimCursorRow--;
                clampCursor();
            }
            break;

        case 'ArrowDown':
            if (vimCursorRow < vimLines.length - 1) {
                vimCursorRow++;
                clampCursor();
            }
            break;

        default:
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                vimLines[vimCursorRow] =
                    line.slice(0, vimCursorCol) + e.key + line.slice(vimCursorCol);
                vimCursorCol++;
                delete vimInlineResults[vimCursorRow];
                vimDirty = true;
            }
    }

    renderVim();
}

// Handles keystrokes while PseudoVimim is in COMMAND (:) mode.
function handleCommandKey(e) {
    if (e.key === 'Escape' || (e.ctrlKey && e.key === '[')) {
        vimMode       = 'NORMAL';
        vimCommandBuf = '';
        setStatusMessage('', false);
        renderVim();
        return;
    }

    if (e.key === 'Enter') {
        const cmd     = vimCommandBuf;
        vimCommandBuf = '';
        executeExCommand(cmd);
        return;
    }

    if (e.key === 'Backspace') {
        if (vimCommandBuf.length === 0) {
            vimMode = 'NORMAL';
        } else {
            vimCommandBuf = vimCommandBuf.slice(0, -1);
        }
        renderVim();
        return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        vimCommandBuf += e.key;
        renderVim();
    }
}

// Intercepts keyboard events when PseudoVimim is active so the shell ignores them.
document.addEventListener('keydown', e => {
    if (!vimIsActive) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    // If the course hint mini-terminal popup is open, Esc or Enter closes it
    if (vimActiveCourse && typeof vimActiveCourse.isHintOpen === 'function' && vimActiveCourse.isHintOpen()) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === 'q') {
            vimActiveCourse.hideHintPopup();
            setStatusMessage('', false);
            renderVim();
        }
        return;
    }

    // Ctrl+E evaluates the current Python line or function block inline
    if (e.ctrlKey && e.key.toLowerCase() === 'e') {
        handleCtrlE();
        return;
    }

    if (vimMode === 'NORMAL') {
        handleNormalKey(e);
    } else if (vimMode === 'INSERT') {
        handleInsertKey(e);
    } else if (vimMode === 'COMMAND') {
        handleCommandKey(e);
    }
}, true);

// Public API exposed to terminal.js for launching PseudoVimim.
window.PseudoVimim = {
    open(filename, virtualFiles, onExitCallback, options = {}) {
        vimIsActive      = true;
        vimMode          = 'NORMAL';
        vimFilename      = (filename || '').trim();
        vimFilesRef      = virtualFiles;
        vimOnExit        = onExitCallback;
        vimActiveCourse  = options.course || null;
        vimCursorRow     = 0;
        vimCursorCol     = 0;
        vimDirty         = false;
        vimPendingKey    = '';
        vimCommandBuf    = '';
        vimUndoStack     = [];
        vimInlineResults = {};

        if (vimActiveCourse) {
            if (!vimActiveCourse.isStarted()) {
                vimLines = vimActiveCourse.getInitialLines();
            }
            setStatusMessage('', false);
        } else if (vimFilename && virtualFiles && typeof virtualFiles[vimFilename] !== 'undefined') {
            const raw = virtualFiles[vimFilename];
            vimLines  = Array.isArray(raw) ? [...raw] : String(raw).split('\n');
            if (vimLines.length === 0) vimLines = [''];
            setStatusMessage(`"${vimFilename}" ${vimLines.length}L — Ctrl+E to eval`, false);
        } else if (vimFilename) {
            vimLines = [''];
            setStatusMessage(`"${vimFilename}" [New File] — Ctrl+E to eval`, false);
        } else {
            vimLines = [''];
            setStatusMessage('PseudoVimim — i (insert), Ctrl+E (eval), :w <file> (save), :wq, :q!', false);
        }

        container.classList.add('active');
        container.classList.toggle('course-mode', Boolean(vimActiveCourse));
        renderVim();
    },

    isActive() {
        return vimIsActive;
    },
};

})();
