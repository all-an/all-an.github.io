// asm-highlight.js — Lightweight x86-64 Assembly highlighter for PseudoVimim (strings, definitions, register groups)

(function () {

// General-purpose accumulator/data registers (amber highlight)
const ASM_GP_REGS = new Set([
    'rax', 'eax', 'ax', 'al', 'rbx', 'ebx', 'bx', 'bl',
    'rcx', 'ecx', 'cx', 'cl', 'rdx', 'edx', 'dx', 'dl',
]);

// Pointer, index, and stack registers (cyan highlight)
const ASM_PTR_REGS = new Set([
    'rsi', 'esi', 'si', 'rdi', 'edi', 'di', 'rbp', 'ebp', 'bp', 'rsp', 'esp', 'sp', 'rip', 'eip',
]);

// Extended 64-bit numbered registers r8–r15 (violet highlight)
const ASM_EXT_REGS = new Set([
    'r8', 'r8d', 'r9', 'r9d', 'r10', 'r10d', 'r11', 'r11d',
    'r12', 'r12d', 'r13', 'r13d', 'r14', 'r14d', 'r15', 'r15d',
]);

// Assembler section/data directives and common instructions
const ASM_KEYWORDS = new Set([
    'section', 'global', 'extern', 'db', 'dw', 'dd', 'dq', 'equ',
    'mov', 'lea', 'add', 'sub', 'imul', 'mul', 'idiv', 'div', 'inc', 'dec',
    'and', 'or', 'xor', 'not', 'shl', 'shr', 'cmp', 'test',
    'jmp', 'je', 'jz', 'jne', 'jnz', 'jg', 'jge', 'jl', 'jle', 'loop',
    'push', 'pop', 'call', 'ret', 'syscall', 'int', 'print',
]);

// Splits a single x86-64 Assembly line into `{ text, cls }` segments for strings, labels/defs, and registers.
function tokenizeLine(lineText) {
    if (!lineText) {
        return [];
    }

    const tokens = [];
    let i = 0;

    while (i < lineText.length) {
        const ch = lineText[i];

        // Assembly comment starting with `;`
        if (ch === ';') {
            tokens.push({ text: lineText.slice(i), cls: 'hl-comment' });
            break;
        }

        // String literal
        if (ch === '"' || ch === '\'') {
            const quote = ch;
            let end = i + 1;
            while (end < lineText.length) {
                if (lineText[end] === '\\') {
                    end += 2;
                    continue;
                }
                if (lineText[end] === quote) {
                    end++;
                    break;
                }
                end++;
            }
            tokens.push({ text: lineText.slice(i, end), cls: 'hl-string' });
            i = end;
            continue;
        }

        // Label definition (`_start:`), register, directive, or symbol variable
        if (/[A-Za-z_.$%]/.test(ch)) {
            let end = i + 1;
            while (end < lineText.length && /[\w.$]/.test(lineText[end])) {
                end++;
            }
            // Include trailing colon if this token is a label definition
            const isLabelDef = lineText[end] === ':';
            if (isLabelDef) {
                end++;
            }

            const rawWord = lineText.slice(i, end);
            const clean   = rawWord.replace(/^%/, '').toLowerCase();
            const rest    = lineText.slice(end);

            let cls = '';
            if (isLabelDef || clean.startsWith('.')) {
                cls = 'hl-def';
            } else if (ASM_GP_REGS.has(clean)) {
                cls = 'hl-reg-gp';
            } else if (ASM_PTR_REGS.has(clean)) {
                cls = 'hl-reg-ptr';
            } else if (ASM_EXT_REGS.has(clean)) {
                cls = 'hl-reg-ext';
            } else if (ASM_KEYWORDS.has(clean)) {
                cls = 'hl-keyword';
            } else if (/^\s+(db|dw|dd|dq|equ)\b/i.test(rest)) {
                // Symbol variable defined via `msg db ...` or `len equ ...`
                cls = 'hl-var';
            }

            tokens.push({ text: rawWord, cls });
            i = end;
            continue;
        }

        // Plain whitespace, numbers, or punctuation
        let end = i + 1;
        while (end < lineText.length && !/[A-Za-z_.$%;"'']/.test(lineText[end])) {
            end++;
        }
        tokens.push({ text: lineText.slice(i, end), cls: '' });
        i = end;
    }

    return tokens;
}

window.AsmHighlight = {
    tokenizeLine,
};

})();
