'use strict';

// ── DOM references ──────────────────────────────────────────────────────────
const outputEl      = document.getElementById('output');
const cmdInput      = document.getElementById('cmd');
const promptLabelEl = document.getElementById('prompt-label');
const winTitlebarEl = document.getElementById('win-titlebar');
const menuItems     = document.querySelectorAll('.menu-item');

// ── Dialog DOM references (Create User popup) ────────────────────────────────
const dialogOverlay   = document.getElementById('dialog-overlay');
const dialogTitleEl   = document.getElementById('dialog-titlebar');
const hostnameInput   = document.getElementById('hostname-input');
const dialogOkBtn     = document.getElementById('dialog-ok');
const dialogCancelBtn = document.getElementById('dialog-cancel');
const dialogErrorEl   = document.getElementById('dialog-error');

// ── Session state ─────────────────────────────────────────────────────────────
// currentHostname drives both the visible prompt label and the command echo.
// Starts empty; set by the mandatory Create User dialog on first load.
let currentHostname = '';

// booted: false until the user submits the initial Create User dialog.
// Controls whether the boot sequence has run and whether Cancel / Escape
// are allowed in the dialog (they are only allowed after first boot).
let booted = false;

// ── Command history: stores past commands so arrow-key recall works ─────────
const history   = [];
let   histIndex = -1;   // -1 = not currently browsing history

// ────────────────────────────────────────────────────────────────────────────
// OUTPUT UTILITIES
// ────────────────────────────────────────────────────────────────────────────

/**
 * Appends a single line to the terminal output.
 * Uses a block <div> so each call produces exactly one visible row.
 * @param {string} text - The text content of the line.
 * @param {string} cls  - Colour class suffix: 'info'|'cmd'|'hi'|'cy'|'err'|'dim'.
 */
function print(text, cls = 'info') {
    const div = document.createElement('div');
    div.className = `line line-${cls}`;
    // Non-breaking space keeps blank lines from collapsing to zero height
    div.textContent = text || '\u00a0';
    outputEl.appendChild(div);
    scrollBottom();
}

/**
 * Appends a list of lines in one synchronous pass.
 * Each entry is either a plain string (uses 'info' class)
 * or a two-element array [text, cls].
 * An empty string '' becomes a blank spacer line.
 * @param {Array} lines
 */
function printLines(lines) {
    for (const line of lines) {
        if (Array.isArray(line)) {
            print(line[0], line[1]);
        } else {
            print(line, 'info');   // '' → nbsp → blank row
        }
    }
}

/**
 * Appends lines one at a time with a fixed delay between them.
 * Used for boot sequence and easter-egg animations to give a
 * "computer is working" feel without blocking the input thread.
 * @param {Array}    lines - Same format as printLines.
 * @param {number}   delay - Milliseconds between each line.
 * @param {Function} [done] - Optional callback when all lines are printed.
 */
function printSlow(lines, delay, done) {
    let i = 0;

    function step() {
        if (i >= lines.length) {
            if (done) done();
            return;
        }
        const line = lines[i++];
        if (Array.isArray(line)) {
            print(line[0], line[1]);
        } else {
            print(line, 'info');
        }
        setTimeout(step, delay);
    }

    step();
}

/** Scrolls the output area to reveal the most recently added line. */
function scrollBottom() {
    outputEl.scrollTop = outputEl.scrollHeight;
}

/** Removes all output lines. Used by the `clear` / `cls` command. */
function clearOutput() {
    outputEl.innerHTML = '';
}

// ────────────────────────────────────────────────────────────────────────────
// BOOT SEQUENCE
// Displayed once when the page first loads, simulating an OS initialisation.
// Lines are printed with a short delay to mimic a real boot log.
// ────────────────────────────────────────────────────────────────────────────
function bootSequence() {
    const lines = [
        ['TERMINAL v1.0  Copyright (C) 2026 Allan P. Abrahão', 'cy'],
        ['────────────────────────────────────────────────────────', 'dim'],
        '',
        ['Loading kernel modules .................. [ OK ]', 'info'],
        ['Mounting file systems ................... [ OK ]', 'info'],
        ['Starting network services ............... [ OK ]', 'info'],
        ['Initialising curiosity engine ........... [ OK ]', 'info'],
        ['Calibrating caffeine sensor ............. [ OK ]', 'info'],
        '',
        ['Welcome. Type  help  to see available commands.', 'hi'],
        '',
    ];
    printSlow(lines, 55);
}

// ────────────────────────────────────────────────────────────────────────────
// COMMAND HANDLERS
// Each cmdXxx() function implements one terminal command.
// ────────────────────────────────────────────────────────────────────────────

/** Lists all available commands and keyboard shortcuts. */
function cmdHelp() {
    printLines([
        ['Available commands:', 'cy'],
        ['────────────────────────────────────────────────────────', 'dim'],
        ['  help     │ ?          Show this help listing', 'info'],
        ['  about    │ whoami     About the author', 'info'],
        ['  contact              Contact information', 'info'],
        ['  neofetch             System information', 'info'],
        ['  ls       │ dir       Directory listing', 'info'],
        ['  date                 Current date and time', 'info'],
        ['  echo [text]          Print text to the screen', 'info'],
        ['  clear    │ cls       Clear the terminal', 'info'],
        ['  matrix               ???', 'info'],
        ['  hack                 ???', 'info'],
        ['  back     │ exit      Return to main page', 'info'],
        ['────────────────────────────────────────────────────────', 'dim'],
        '',
        ['Keyboard shortcuts:', 'cy'],
        ['  F1        Help          F2   New User (popup)', 'info'],
        ['  F9        About', 'info'],
        ['  ↑ / ↓     Command history navigation', 'info'],
        ['  Alt+X     Exit terminal', 'info'],
        '',
    ]);
}

/**
 * Displays information about the author as a styled "about" card.
 * The ASCII art block is intentionally simple so it renders cleanly
 * in any monospace font regardless of exact character widths.
 */
function cmdAbout() {
    printLines([
        '',
        ['   ╔═══════╗   ', 'cy'],
        ['   ║  A·P  ║   Name     : Allan Pereira Abrahão', 'cy'],
        ['   ╚═══╦═══╝   Role     : Software Developer', 'cy'],
        ['       ║        Location : Brazil', 'cy'],
        ['   ════╩════    Hobbies  : coding, math, 3D, music', 'cy'],
        '',
        ['  OS       : Human v27.0 (Long Term Support)', 'info'],
        ['  Shell    : /bin/curiosity', 'info'],
        ['  Uptime   : way too long', 'info'],
        ['  CPU      : Brain @ 1.4 GHz (perpetually tired)', 'info'],
        ['  Memory   : limited but heavily caffeinated', 'info'],
        '',
        ['  "Turning curiosity into code."', 'dim'],
        '',
    ]);
}

/** Shows contact information. */
function cmdContact() {
    printLines([
        ['Contact:', 'cy'],
        ['────────────────────────────────────────────────────────', 'dim'],
        '',
        ['  LinkedIn : linkedin.com/in/allan-pereira-abrahao/', 'hi'],
        '',
        ['  Or just say hi — I do not bite.', 'info'],
        '',
    ]);
}

/**
 * Fake directory listing styled after MS-DOS `dir` output.
 * References the actual top-level folders in the site to keep
 * the fiction internally consistent.
 */
function cmdDir() {
    const now = new Date();
    // Format as MM/DD/YYYY and HH:MM AM/PM, matching DOS style
    const ds  = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const ts  = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    printLines([
        [` Volume in drive C is ${currentHostname}`, 'info'],
        [' Volume Serial Number is LOVE-C0DE', 'info'],
        '',
        [` Directory of C:\\${currentHostname}\\`, 'hi'],
        '',
        [`${ds}  ${ts}    <DIR>          games`, 'info'],
        [`${ds}  ${ts}    <DIR>          learn`, 'info'],
        [`${ds}  ${ts}    <DIR>          terminal`, 'info'],
        [`${ds}  ${ts}         3,141     index.html`, 'info'],
        [`${ds}  ${ts}         1,618     main-style.css`, 'info'],
        [`${ds}  ${ts}           314     main.js`, 'info'],
        ['               3 File(s)        5,073 bytes', 'info'],
        ['               3 Dir(s)         ∞ bytes free', 'hi'],
        '',
    ]);
}

/** Prints the current date and time in a human-readable format. */
function cmdDate() {
    const now = new Date();
    const str = now.toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    print(str, 'hi');
}

/**
 * Displays a neofetch-style system information panel.
 * The ASCII art on the left uses the author's initials "AP" in block form.
 */
function cmdNeofetch() {
    printLines([
        '',
        ['  ██████████████████   visitor@terminal', 'cy'],
        ['  ██                   ─────────────────────────────', 'cy'],
        ['  ██   ██  ███████     OS:       Portfolio Terminal v1.0', 'cy'],
        ['  ██   ██  ██          Host:     all-an.github.io', 'cy'],
        ['  ██████   ███████     Shell:    /bin/curiosity', 'cy'],
        ['  ██   ██       ██     CPU:      Brain @ 1.4 GHz', 'cy'],
        ['  ██   ██  ███████     Memory:   limited, caffeinated', 'cy'],
        ['  ██                   Theme:    Borland Classic Blue', 'cy'],
        ['  ██████████████████   Font:     Courier New 15px', 'cy'],
        '',
        ['  ████ ████ ████ ████ ████ ████ ████ ████', 'info'],
        '',
    ]);
}

/**
 * Easter egg: references the Matrix digital rain on the main landing page.
 * Prints a cascade of Kanji and hex characters, then delivers a line.
 */
function cmdMatrix() {
    // Characters drawn from the same set used in main.js for consistency
    const chars = 'アイウエオカキクサシスタチナニ0123456789ABCDEF';

    print('Initialising Matrix protocol...', 'cy');
    print('', 'info');

    const rainLines = [];
    for (let row = 0; row < 6; row++) {
        let s = '  ';
        for (let col = 0; col < 54; col++) {
            s += chars[Math.floor(Math.random() * chars.length)];
        }
        rainLines.push([s, 'info']);
    }
    rainLines.push('');
    rainLines.push(['Wake up, visitor. The Matrix has you.', 'hi']);
    rainLines.push('');

    printSlow(rainLines, 90);
}

/**
 * Easter egg: fake "hacking" sequence with ASCII progress bars.
 * Purely comedic — the terminal does not actually do anything harmful.
 */
function cmdHack() {
    const steps = [
        ['Initialising hack sequence...', 'cy'],
        '',
        ['  Connecting to mainframe...', 'info'],
        ['  [▓▓▓▓▓▓▓░░░░░░░░░░░░░░░] 28%  Spoofing IP address', 'info'],
        ['  [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░] 48%  Bypassing firewall', 'info'],
        ['  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░] 64%  Cracking encryption', 'info'],
        ['  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░] 78%  Downloading internets', 'info'],
        ['  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100% Complete', 'hi'],
        '',
        ['  ACCESS GRANTED — Welcome, friend.', 'hi'],
        ['  (Just kidding. There is nothing secret here.)', 'dim'],
        '',
    ];
    printSlow(steps, 130);
}

/**
 * Echoes the provided arguments back to the terminal as a single line.
 * Mirrors the behaviour of the DOS / UNIX `echo` command.
 * @param {string[]} args - Tokens after the `echo` keyword.
 */
function cmdEcho(args) {
    print(args.join(' '), 'info');
}

// ────────────────────────────────────────────────────────────────────────────
// COMMAND DISPATCHER
// Parses raw input, echoes it with the prompt prefix, then routes to the
// appropriate handler. Unknown commands show a helpful error message.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Processes a single raw command string entered by the user.
 * @param {string} raw - The full text from the input field.
 */
function dispatch(raw) {
    const trimmed = raw.trim();

    // Echo the command with the DOS prompt prefix so the session reads naturally.
    // Uses currentHostname so a renamed session shows the updated prompt.
    print(`C:\\${currentHostname}> ${trimmed}`, 'cmd');

    // Empty enter press — just show the prompt echo, nothing else
    if (trimmed === '') return;

    // Split into command word and optional arguments
    const parts = trimmed.split(/\s+/);
    const cmd   = parts[0].toLowerCase();
    const args  = parts.slice(1);

    switch (cmd) {
        case 'help':
        case '?':         cmdHelp();                           break;

        case 'about':
        case 'whoami':    cmdAbout();                          break;

        case 'contact':   cmdContact();                        break;

        case 'ls':
        case 'dir':       cmdDir();                            break;

        case 'date':      cmdDate();                           break;

        case 'echo':      cmdEcho(args);                       break;

        case 'clear':
        case 'cls':       clearOutput();                       break;

        case 'neofetch':  cmdNeofetch();                       break;

        case 'matrix':    cmdMatrix();                         break;

        case 'hack':      cmdHack();                           break;

        case 'back':
        case 'exit':
            window.location.href = '../index.html';
            break;

        default:
            print(`'${cmd}' is not recognised as an internal command.`, 'err');
            print(`Type 'help' for a list of commands.`, 'err');
    }
}

// ────────────────────────────────────────────────────────────────────────────
// INPUT HANDLING
// ────────────────────────────────────────────────────────────────────────────

/**
 * Handles keydown events on the command input field.
 * Enter submits the command; Arrow keys cycle through history.
 */
cmdInput.addEventListener('keydown', function (e) {

    if (e.key === 'Enter') {
        const raw = cmdInput.value;
        cmdInput.value = '';
        histIndex = -1;

        // Save to history — skip blank lines and consecutive duplicates
        if (raw.trim() && raw.trim() !== history[0]) {
            history.unshift(raw.trim());
        }

        dispatch(raw);
        return;
    }

    // Arrow up: go one step further back in history
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIndex < history.length - 1) {
            histIndex++;
            cmdInput.value = history[histIndex];
            // Move the text cursor to the end of the recalled command
            setTimeout(() => {
                cmdInput.setSelectionRange(cmdInput.value.length, cmdInput.value.length);
            }, 0);
        }
        return;
    }

    // Arrow down: come forward toward the most recent command (or blank)
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIndex > 0) {
            histIndex--;
            cmdInput.value = history[histIndex];
        } else {
            histIndex = -1;
            cmdInput.value = '';
        }
        return;
    }
});

// ────────────────────────────────────────────────────────────────────────────
// GLOBAL KEYBOARD SHORTCUTS
// F-keys trigger commands directly, matching the labels in the status bar.
// Alt+X navigates back — mirrors the Borland IDE convention.
// ────────────────────────────────────────────────────────────────────────────
document.addEventListener('keydown', function (e) {
    if (e.key === 'F1') { e.preventDefault(); dispatch('help');  }
    if (e.key === 'F2') { e.preventDefault(); openCreateUser(); }
    if (e.key === 'F4') { e.preventDefault(); openCreateUser(); }
    if (e.key === 'F9') { e.preventDefault(); dispatch('about'); }

    // Alt+X: exit to main page (Borland conventional exit shortcut)
    if (e.altKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        window.location.href = '../index.html';
    }
});

// ────────────────────────────────────────────────────────────────────────────
// MENU BAR CLICK HANDLING
// Each menu item has a data-cmd attribute; clicking it dispatches that command.
// ────────────────────────────────────────────────────────────────────────────
menuItems.forEach(function (item) {
    item.addEventListener('click', function () {
        const cmd = item.dataset.cmd;
        if (cmd) dispatch(cmd);
        cmdInput.focus();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// FOCUS MANAGEMENT
// Clicking anywhere on the screen refocuses the command input so the user
// never has to manually click the text field after interacting with the UI.
// Skipped when the dialog is open — the dialog manages its own focus.
// ────────────────────────────────────────────────────────────────────────────
document.addEventListener('click', function () {
    if (!dialogOverlay.classList.contains('visible')) {
        cmdInput.focus();
    }
});

// ────────────────────────────────────────────────────────────────────────────
// F4 CREATE USER DIALOG
// Opens a Borland-style popup where the user enters a host name.
// On confirm, the terminal prompt is personalised with that name and a
// "session connected" message is printed to the output.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Updates the visible prompt label and the internal hostname used by dispatch.
 * Called once on load (noop — default already set) and after a successful
 * user-creation to personalise the session.
 */
function updatePrompt() {
    promptLabelEl.textContent = `C:\\${currentHostname}>`;
    winTitlebarEl.textContent = `══ TERMINAL v1.0 — C:\\${currentHostname}\\> ══`;
}

/**
 * Opens the Create User dialog.
 * On the initial load (isInitial = true) the Cancel button and backdrop-click
 * are suppressed — the user must supply a hostname before the terminal starts.
 * On subsequent opens (F2) Cancel is shown and works normally.
 * @param {boolean} isInitial - true when called on page load, false otherwise.
 */
function openCreateUser(isInitial = false) {
    hostnameInput.value       = '';
    dialogErrorEl.textContent = '';

    // Adjust title and Cancel availability based on whether this is the first open
    if (isInitial) {
        dialogTitleEl.textContent   = '══ Welcome — Set Up Terminal ══';
        dialogCancelBtn.style.display = 'none';    // no escaping the first dialog
    } else {
        dialogTitleEl.textContent   = '══ Create New User ══';
        dialogCancelBtn.style.display = '';
    }

    dialogOverlay.classList.add('visible');
    hostnameInput.focus();
}

/**
 * Hides the Create User dialog and returns keyboard focus to the terminal
 * command input. Only callable after the first boot is complete.
 */
function closeCreateUser() {
    dialogOverlay.classList.remove('visible');
    cmdInput.focus();
}

/**
 * Validates the hostname field and, on success, closes the dialog and either:
 *   - Runs the boot sequence (first open) with the user's hostname, or
 *   - Prints a connection-update message to the terminal (subsequent opens).
 * On failure, shows an inline validation error inside the dialog.
 */
function submitCreateUser() {
    const raw = hostnameInput.value.trim();

    // Validate: hostname must not be blank
    if (raw === '') {
        dialogErrorEl.textContent = '  Host name cannot be empty.';
        hostnameInput.focus();
        return;
    }

    // Sanitise: uppercase, strip characters that are not alphanumeric/dash
    const hostname = raw.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase() || 'HOST';

    closeCreateUser();

    // Persist the hostname so dispatch and updatePrompt use it
    currentHostname = hostname;
    updatePrompt();

    if (!booted) {
        // First submit: mark as booted and kick off the boot sequence.
        // The boot sequence prints the welcome banner with the user's hostname.
        booted = true;
        bootSequence();
    } else {
        // Subsequent submit: terminal is already running — just update the session.
        const sessionId = Math.random().toString(36).slice(2, 10).toUpperCase();
        printLines([
            [`C:\\${currentHostname}> [F2] Create User`, 'cmd'],
            '',
            ['  Registering host...', 'info'],
            [`  Host Name   : ${hostname}`, 'hi'],
            [`  Session ID  : ${sessionId}`, 'info'],
            ['  Status      : CONNECTED', 'hi'],
            '',
            [`  Welcome, ${hostname}. Your prompt has been updated.`, 'cy'],
            '',
        ]);
    }
}

// ── Dialog button click handlers ─────────────────────────────────────────────
dialogOkBtn.addEventListener('click',     submitCreateUser);
dialogCancelBtn.addEventListener('click', closeCreateUser);

/**
 * Stops all clicks inside the overlay from bubbling to the document handler
 * (which would refocus cmdInput and break dialog keyboard navigation).
 * Clicking the backdrop directly closes the dialog — but only after boot,
 * so the user cannot dismiss the mandatory first-launch dialog.
 */
dialogOverlay.addEventListener('click', function (e) {
    e.stopPropagation();
    if (e.target === dialogOverlay && booted) closeCreateUser();
});

/**
 * Keyboard handling while the dialog is open:
 *   Enter     → submit (or cancel if Cancel button is focused and booted)
 *   Escape    → close — only after first boot; ignored on initial open
 *   Tab       → cycle forward: hostname → OK → Cancel (if visible) → hostname
 *   Shift+Tab → cycle backward
 */
dialogOverlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        e.preventDefault();
        // Escape is a no-op on the mandatory first-launch dialog
        if (booted) closeCreateUser();
        return;
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        // Cancel button only exists after boot; Enter on it closes the dialog
        if (booted && document.activeElement === dialogCancelBtn) {
            closeCreateUser();
        } else {
            submitCreateUser();
        }
        return;
    }

    // Focus trap: build the list of visible focusable elements dynamically
    // so Tab works correctly whether Cancel is shown or hidden.
    if (e.key === 'Tab') {
        e.preventDefault();
        const focusable = [hostnameInput, dialogOkBtn];
        if (dialogCancelBtn.style.display !== 'none') focusable.push(dialogCancelBtn);
        const current = focusable.indexOf(document.activeElement);
        const next    = e.shiftKey
            ? (current - 1 + focusable.length) % focusable.length   // Shift+Tab
            : (current + 1) % focusable.length;                      // Tab
        focusable[next].focus();
    }
});

// ────────────────────────────────────────────────────────────────────────────
// INITIALISE — open the mandatory Create User dialog on page load.
// The boot sequence only runs after the user submits a hostname, so nothing
// is hardcoded: the terminal waits for the user's name before starting.
// ────────────────────────────────────────────────────────────────────────────
updatePrompt();             // sets prompt label to C:\> while dialog is open
openCreateUser(true);       // show welcome dialog; boot sequence runs on submit
