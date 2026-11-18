// terminal.js — Interactive Linux-style pseudo-terminal running over the Matrix rain

(function () {

// Prefix used to persist virtual files as plain strings in localStorage
const STORAGE_FILE_PREFIX = 'vpos_file:';

const output     = document.getElementById('term-output');
const typed      = document.getElementById('term-typed');
const termBody   = document.getElementById('term-body');
const termShell  = document.getElementById('term-shell');
const termPrompt = document.getElementById('term-prompt');
const termTitle  = document.getElementById('term-title');

let   inputBuf = '';      // current line being typed by the visitor
const history  = [];      // executed commands (newest first)
let   histIdx  = -1;      // current position in command history (-1 = live input)
let   hostName = 'guest'; // guest segment shown after "virtualpseudoos@" in the prompt and titlebar

// Default virtual files (stored as plain strings)
const VIRTUAL_FILES = {
    'about.txt': [
        'Allan Pereira Abrahão — Software Developer',
        'Interested in full stack development, programming languages,',
        'cryptocurrencies, learning tools and games.',
        '',
        'Software engineer with a focus on building clean, purposeful products.',
    ].join('\n'),
    'skills.txt': [
        'Software Development:',
        '  - Programming Concepts',
        '  - Clean Code Principles',
        '  - Algorithms',
        '  - AWS',
        '  - Angular',
        '  - Spring Boot',
        '  - Security',
        '',
        'Courses:     Java, Java / Angular / AWS',
        'Mathematics: Mathematics reference',
        'Languages:   English',
    ].join('\n'),
    'contact.txt': [
        'Email:    allan8tech@gmail.com',
        'LinkedIn: https://www.linkedin.com/in/allan-pereira-abrahao/',
        'GitHub:   https://github.com/all-an',
    ].join('\n'),
    'projects.txt': [
        'GitHub:   https://github.com/all-an',
        'Skillset: ../skillset/skillset.html',
        'Chess:    ../games/chess/front-chess-page/front-chess-page.html',
    ].join('\n'),
    'example.py': [
        'def add(a, b):',
        '    return a + b',
        '',
        'x = 10',
        'y = 25',
        'print("Sum:", add(x, y))',
    ].join('\n'),
    'example.c': [
        '#include <stdio.h>',
        '',
        'int factorial(int n) {',
        '    if (n <= 1) return 1;',
        '    return n * factorial(n - 1);',
        '}',
        '',
        'int main() {',
        '    int result = factorial(5);',
        '    printf("5! = %d\\n", result);',
        '    return 0;',
        '}',
    ].join('\n'),
    'example.asm': [
        '; x86-64 NASM Assembly example',
        'section .data',
        '    msg db "Hello from x86-64 Assembly!", 10',
        '    len equ $ - msg',
        '',
        'section .text',
        '    global _start',
        '',
        '_start:',
        '    mov rax, 1      ; sys_write',
        '    mov rdi, 1      ; stdout',
        '    mov rsi, msg    ; buffer address',
        '    mov rdx, len    ; buffer length',
        '    syscall',
        '',
        '    mov rbx, 42     ; compute value in rbx',
        '    add rbx, 8',
        '    print rbx',
        '',
        '    mov rax, 60     ; sys_exit',
        '    xor rdi, rdi',
        '    syscall',
    ].join('\n'),
    'Example.java': [
        'public class Example {',
        '    static int fibonacci(int n) {',
        '        if (n <= 1) {',
        '            return n;',
        '        }',
        '        return fibonacci(n - 1) + fibonacci(n - 2);',
        '    }',
        '',
        '    public static void main(String[] args) {',
        '        for (int i = 0; i < 7; i++) {',
        '            System.out.printf("fib(%d) = %d%n", i, fibonacci(i));',
        '        }',
        '    }',
        '}',
    ].join('\n'),
};

// Loads any user-saved files (stored as strings under STORAGE_FILE_PREFIX) from localStorage.
function loadSavedFilesFromStorage() {
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(STORAGE_FILE_PREFIX)) {
                const filename = key.slice(STORAGE_FILE_PREFIX.length);
                const content  = localStorage.getItem(key);
                if (filename && typeof content === 'string') {
                    VIRTUAL_FILES[filename] = content;
                }
            }
        }
    } catch {
        // Ignore storage read errors in restricted browsing contexts
    }
}

loadSavedFilesFromStorage();

// ── Boot message ──────────────────────────────────────────────────────────────
const BOOT = [
    'Welcome to VirtualPseudoOS v1.0.0 (tty1)',
    'Type "help" to list available commands.',
    '',
];

// Updates the live prompt and window titlebar when `hostName` changes.
function updatePrompt() {
    termPrompt.textContent = `virtualpseudoos@${hostName}:~$`;
    termTitle.textContent  = `virtualpseudoos@${hostName}: ~`;
}

// Changes the guest name (`virtualpseudoos@<name>`) to whatever the user typed.
function changeHostName(args) {
    const newName = args.join('-').trim();
    if (!newName) {
        return ['Usage: hostname <name>'];
    }
    hostName = newName;
    updatePrompt();
    return [`Prompt updated to virtualpseudoos@${hostName}`];
}

// Executes a Python 3 file from VIRTUAL_FILES using Pyodide and prints stdout/stderr.
function runPythonCommand(args) {
    if (!args[0]) {
        return ['Usage: python <file.py>'];
    }
    const filename = args[0];
    if (typeof VIRTUAL_FILES[filename] === 'undefined') {
        printLine(`python: can't open file '${filename}': [Errno 2] No such file or directory`, 'error');
        return null;
    }

    const rawContent = VIRTUAL_FILES[filename];
    const codeString = Array.isArray(rawContent) ? rawContent.join('\n') : String(rawContent);

    printLine(`Running ${filename} with Python 3 (Pyodide)...`);
    scrollBottom();

    window.PyodideRunner.runPythonFile(codeString)
        .then(({ outLines, errLines }) => {
            outLines.forEach(line => printLine(line, 'output'));
            errLines.forEach(line => printLine(line, 'error'));
            scrollBottom();
        })
        .catch(err => {
            printLine(`Pyodide error: ${err.message || err}`, 'error');
            scrollBottom();
        });

    return null;
}

// Executes a C source file from VIRTUAL_FILES using CasmRunner and prints stdout/stderr.
function runCCommand(args) {
    if (!args[0]) {
        return ['Usage: c <file.c> (or gcc <file.c>)'];
    }
    const filename = args[0];
    if (typeof VIRTUAL_FILES[filename] === 'undefined') {
        printLine(`c: can't open file '${filename}': No such file or directory`, 'error');
        return null;
    }

    const rawContent = VIRTUAL_FILES[filename];
    const codeString = Array.isArray(rawContent) ? rawContent.join('\n') : String(rawContent);

    printLine(`Running ${filename} with C interpreter...`);
    scrollBottom();

    window.CasmRunner.runCFile(codeString)
        .then(({ outLines, errLines }) => {
            outLines.forEach(line => printLine(line, 'output'));
            errLines.forEach(line => printLine(line, 'error'));
            scrollBottom();
        })
        .catch(err => {
            printLine(`C error: ${err.message || err}`, 'error');
            scrollBottom();
        });

    return null;
}

// Executes an x86-64 Assembly file from VIRTUAL_FILES using CasmRunner and prints stdout/stderr.
function runAsmCommand(args) {
    if (!args[0]) {
        return ['Usage: asm <file.asm> (or nasm <file.asm>)'];
    }
    const filename = args[0];
    if (typeof VIRTUAL_FILES[filename] === 'undefined') {
        printLine(`asm: can't open file '${filename}': No such file or directory`, 'error');
        return null;
    }

    const rawContent = VIRTUAL_FILES[filename];
    const codeString = Array.isArray(rawContent) ? rawContent.join('\n') : String(rawContent);

    printLine(`Running ${filename} with x86-64 Assembly interpreter...`);
    scrollBottom();

    window.CasmRunner.runAsmFile(codeString)
        .then(({ outLines, errLines }) => {
            outLines.forEach(line => printLine(line, 'output'));
            errLines.forEach(line => printLine(line, 'error'));
            scrollBottom();
        })
        .catch(err => {
            printLine(`ASM error: ${err.message || err}`, 'error');
            scrollBottom();
        });

    return null;
}

// Executes a Java source file from VIRTUAL_FILES using JavaRunner and prints stdout/stderr.
function runJavaCommand(args) {
    if (!args[0]) {
        return ['Usage: java <File.java> (or javac <File.java>)'];
    }
    const filename = args[0].endsWith('.java') ? args[0] : `${args[0]}.java`;
    if (typeof VIRTUAL_FILES[filename] === 'undefined') {
        printLine(`java: can't open file '${args[0]}': No such file or directory`, 'error');
        return null;
    }

    const rawContent = VIRTUAL_FILES[filename];
    const codeString = Array.isArray(rawContent) ? rawContent.join('\n') : String(rawContent);

    printLine(`Running ${filename} with Java interpreter...`);
    scrollBottom();

    window.JavaRunner.runJavaFile(codeString)
        .then(({ outLines, errLines }) => {
            outLines.forEach(line => printLine(line, 'output'));
            errLines.forEach(line => printLine(line, 'error'));
            scrollBottom();
        })
        .catch(err => {
            printLine(`Java error: ${err.message || err}`, 'error');
            scrollBottom();
        });

    return null;
}

// ── Commands ──────────────────────────────────────────────────────────────────
const COMMANDS = {

    // Lists all supported shell commands and their descriptions.
    help() {
        return [
            'Available commands:',
            '  help              Show this help message',
            '  vim [file]        Open PseudoVimim editor (Ctrl+E evaluates Python, C, ASM, or Java)',
            '  python <file.py>  Run a Python 3 file using Pyodide',
            '  c <file.c>        Run a C file (also aliased as gcc or cc)',
            '  asm <file.asm>    Run an x86-64 Assembly file (also aliased as nasm)',
            '  java <File.java>  Run a Java source file (also aliased as javac)',
            '  ls                List files in the current directory',
            '  cat <file>        Print the contents of a file',
            '  hostname <name>   Change "guest" in virtualpseudoos@guest to <name>',
            '  whoami            Print current user',
            '  pwd               Print working directory',
            '  date              Print current system date and time',
            '  echo <text>       Print text to the terminal',
            '  clear             Clear the terminal screen (or Ctrl+L)',
            '  exit              Return to the main page',
            '',
        ];
    },

    // Launches the in-terminal PseudoVimim editor for a new or existing file.
    vim(args) {
        const filename = args[0] || '';
        termShell.classList.add('hidden');
        window.PseudoVimim.open(filename, VIRTUAL_FILES, (exitMsg) => {
            termShell.classList.remove('hidden');
            if (exitMsg) {
                printLine(exitMsg);
            }
            scrollBottom();
        });
        return null;
    },

    // Runs a Python 3 script file via Pyodide (also aliased as `python3`).
    python:  runPythonCommand,
    python3: runPythonCommand,

    // Runs a C source file via CasmRunner (also aliased as `gcc` and `cc`).
    c:   runCCommand,
    gcc: runCCommand,
    cc:  runCCommand,

    // Runs an x86-64 Assembly source file via CasmRunner (also aliased as `nasm`).
    asm:  runAsmCommand,
    nasm: runAsmCommand,

    // Runs a Java source file via JavaRunner (also aliased as `javac`).
    java:  runJavaCommand,
    javac: runJavaCommand,

    // Lists all virtual files in /home/visitor.
    ls() {
        return [Object.keys(VIRTUAL_FILES).join('    '), ''];
    },

    // Prints the contents of a named virtual file, or an error if missing.
    cat(args) {
        if (!args[0]) {
            return ['Usage: cat <filename>'];
        }
        const file = VIRTUAL_FILES[args[0]];
        if (typeof file === 'undefined') {
            return [`cat: ${args[0]}: No such file or directory`];
        }
        const lines = Array.isArray(file) ? file : String(file).split('\n');
        return [...lines, ''];
    },

    // Changes the host segment after `virtualpseudoos@` (also aliased as `guest`).
    hostname: changeHostName,
    guest:    changeHostName,

    // Prints the active guest name (the segment after `@`).
    whoami() {
        return [hostName];
    },

    // Prints the active working directory.
    pwd() {
        return ['/home/visitor'];
    },

    // Prints the current local timestamp.
    date() {
        return [new Date().toString()];
    },

    // Echoes the provided arguments back to the output area.
    echo(args) {
        return [args.join(' ')];
    },

    // Clears all previous lines from the terminal output container.
    clear() {
        output.innerHTML = '';
        return null;
    },

    // Navigates back to the main portfolio page.
    exit() {
        window.location.href = '../../index.html';
        return ['Logging out...'];
    },
};

// ── Output helpers ────────────────────────────────────────────────────────────

// Appends a single styled line to the terminal output area.
function printLine(text, cls = 'output') {
    const line       = document.createElement('span');
    line.className   = `term-line ${cls}`;
    line.textContent = text;
    output.appendChild(line);
}

// Echoes the prompt and command string before printing command results.
function printPromptEcho(text) {
    printLine(`virtualpseudoos@${hostName}:~$ ${text}`, 'prompt');
}

// Scrolls the terminal body so the input row remains visible at the bottom.
function scrollBottom() {
    termBody.scrollTop = termBody.scrollHeight;
}

// Computes the longest shared prefix across a non-empty array of strings.
function findCommonPrefix(strings) {
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
        while (!strings[i].startsWith(prefix)) {
            prefix = prefix.slice(0, -1);
        }
    }
    return prefix;
}

// Completes command names (first token) or filenames from VIRTUAL_FILES (subsequent tokens) on Tab.
function handleTabCompletion() {
    const lastSpaceIdx = inputBuf.lastIndexOf(' ');
    const isCommandPos = lastSpaceIdx === -1;
    const prefixPart   = isCommandPos ? '' : inputBuf.slice(0, lastSpaceIdx + 1);
    const partial      = isCommandPos ? inputBuf : inputBuf.slice(lastSpaceIdx + 1);

    const candidates = isCommandPos
        ? Object.keys(COMMANDS)
        : Object.keys(VIRTUAL_FILES);

    const matches = candidates.filter(name => name.startsWith(partial));
    if (matches.length === 0) {
        return;
    }

    if (matches.length === 1) {
        const suffix = isCommandPos ? ' ' : '';
        inputBuf = prefixPart + matches[0] + suffix;
        return;
    }

    // Multiple matches: complete up to the longest common prefix, or list matches if already there
    const common = findCommonPrefix(matches);
    if (common.length > partial.length) {
        inputBuf = prefixPart + common;
    } else {
        printPromptEcho(inputBuf);
        printLine(matches.join('    '), 'output');
        scrollBottom();
    }
}

// ── Command execution ─────────────────────────────────────────────────────────

// Parses and executes a raw command line string entered by the visitor.
function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        printPromptEcho('');
        scrollBottom();
        return;
    }

    history.unshift(trimmed);
    histIdx = -1;

    printPromptEcho(trimmed);

    const [cmd, ...args] = trimmed.split(/\s+/);
    const handler = COMMANDS[cmd.toLowerCase()];

    if (!handler) {
        printLine(`command not found: ${cmd}. Type "help" for available commands.`, 'error');
    } else {
        const lines = handler(args);
        if (lines) lines.forEach(l => printLine(l));
    }
    scrollBottom();
}

// ── Keyboard input ────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    // Ctrl+L clears the terminal screen
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        output.innerHTML = '';
        return;
    }

    switch (e.key) {
        case 'Tab':
            e.preventDefault();
            handleTabCompletion();
            break;

        case 'Enter':
            runCommand(inputBuf);
            inputBuf = '';
            break;

        case 'Backspace':
            inputBuf = inputBuf.slice(0, -1);
            break;

        case 'ArrowUp':
            e.preventDefault();
            if (histIdx < history.length - 1) {
                histIdx++;
                inputBuf = history[histIdx];
            }
            break;

        case 'ArrowDown':
            e.preventDefault();
            if (histIdx > 0) {
                histIdx--;
                inputBuf = history[histIdx];
            } else {
                histIdx  = -1;
                inputBuf = '';
            }
            break;

        default:
            // Only append printable single characters
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                inputBuf += e.key;
            }
    }

    typed.textContent = inputBuf;
});

// ── Boot sequence ─────────────────────────────────────────────────────────────
BOOT.forEach(line => printLine(line));
scrollBottom();

const courseParam = new URLSearchParams(window.location.search).get('course');
if (courseParam === 'java' && window.JavaCourse) {
    window.JavaCourse.setupTerminal({
        commands:     COMMANDS,
        virtualFiles: VIRTUAL_FILES,
        termShell,
        printLine,
        scrollBottom,
    });
}

})();
