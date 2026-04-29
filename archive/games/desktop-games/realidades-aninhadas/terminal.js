// terminal.js — Linux-style terminal running over the matrix rain

(function () {

const output   = document.getElementById('term-output');
const typed    = document.getElementById('term-typed');
const cursor   = document.getElementById('term-cursor');
const inputRow = document.getElementById('term-input-row');
const termBody = document.getElementById('term-body');

let   inputBuf = '';      // current line being typed
const history  = [];      // command history
let   histIdx  = -1;      // history navigation index

let cwd = '~';

const locations = [
    {
        character_id: 'ia-661er0r',
        coordinate: { x: 148, y: 32, z: -76 },
        address: 'Setor Prisma, Torre 7, passarela suspensa leste',
        description: 'Plataforma elevada com vista para o núcleo verde da cidade, cercada por painéis de vidro e tráfego aéreo baixo.',
    },
    {
        character_id: 'sentinela-04',
        coordinate: { x: -24, y: 6, z: 113 },
        address: 'Distrito Submerso, doca 3, corredor de manutenção',
        description: 'Trecho escuro e úmido abaixo do nível da rua, iluminado por sinais de emergência e cabos expostos.',
    },
];

// ── Boot message ──────────────────────────────────────────────────────────────
const BOOT = [
    '  (Jogo em construção) Bem-vindo à realidade 7306, você é ia-661er0r, digite ajuda para começar.',
    '',
];

// ── Commands ──────────────────────────────────────────────────────────────────
const COMMANDS = {

    ajuda() {
        return [
            'Comandos disponíveis:',
            '  localizar alvo <identificador>',
        ];
    },

    localizar(args) {
        if (args[0] !== 'alvo' || !args[1]) {
            return ['Uso: localizar alvo <identificador>'];
        }

        const identificador = args.slice(1).join(' ');
        const location = locations.find(
            (entry) => entry.character_id.toLowerCase() === identificador.toLowerCase()
        );

        if (!location) {
            return [
                `Procurando alvo ${identificador}...`,
                'Nenhum sinal correspondente encontrado na malha de realidade 7306.',
                '',
            ];
        }

        return [
            `Procurando alvo ${identificador}...`,
            'Sinal captado.',
            `Alvo ${location.character_id} localizado na malha de realidade 7306.`,
            `Coordenadas: x=${location.coordinate.x}, y=${location.coordinate.y}, z=${location.coordinate.z}`,
            `Endereço: ${location.address}`,
            `Descrição: ${location.description}`,
            '',
        ];
    },
};

// ── Output helpers ────────────────────────────────────────────────────────────
function printLine(text, cls = 'output') {
    const line      = document.createElement('span');
    line.className  = `term-line ${cls}`;
    line.textContent = text;
    output.appendChild(line);
    output.appendChild(document.createTextNode('\n'));
}

function printPromptEcho(text) {
    printLine(`visitor@realidades-aninhadas:~$ ${text}`, 'prompt');
}

function updatePrompt() {
    const display = cwd.replace('~', '/home/visitor');
    document.getElementById('term-prompt').textContent =
        `visitor@realidades-aninhadas:${display}$  `;
    document.getElementById('term-title').textContent =
        `visitor@realidades-aninhadas: ${display}`;
}

function scrollBottom() {
    termBody.scrollTop = termBody.scrollHeight;
}

// ── Command execution ─────────────────────────────────────────────────────────
function runCommand(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    history.unshift(trimmed);
    histIdx = -1;

    printPromptEcho(trimmed);

    const [cmd, ...args] = trimmed.split(/\s+/);
    const handler = COMMANDS[cmd];

    if (!handler) {
        printLine(`comando não encontrado: ${cmd}`, 'error');
    } else {
        const lines = handler(args);
        if (lines) lines.forEach(l => printLine(l));
    }
    scrollBottom();
}

// ── Keyboard input ────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    // Ignore modifier-only keys
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        output.innerHTML = '';
        return;
    }

    switch (e.key) {
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
            // Only printable single characters
            if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                inputBuf += e.key;
            }
    }

    typed.textContent = inputBuf;
});

// ── Boot sequence ─────────────────────────────────────────────────────────────
BOOT.forEach(line => printLine(line));
scrollBottom();

})();
