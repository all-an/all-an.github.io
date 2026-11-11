// c-highlight.js — Lightweight C syntax highlighter for PseudoVimim (strings, type definitions, variables)

(function () {

// C type specifiers that introduce a function or variable definition
const C_TYPES = new Set([
    'int', 'char', 'long', 'short', 'float', 'double', 'void', 'unsigned', 'signed', 'bool', 'size_t', 'const',
]);

// Core C control and built-in keywords
const C_KEYWORDS = new Set([
    'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'printf', 'puts', 'putchar', 'NULL',
]);

// Splits a single C source line into `{ text, cls }` segments for strings, definitions, and variables.
function tokenizeLine(lineText) {
    if (!lineText) {
        return [];
    }

    // Highlight preprocessor directives (`#include`, `#define`) as a single definition line
    if (/^\s*#/.test(lineText)) {
        return [{ text: lineText, cls: 'hl-def' }];
    }

    const tokens = [];
    let i = 0;
    let afterTypeKeyword = false;

    while (i < lineText.length) {
        const ch = lineText[i];

        // Single-line `//` comment
        if (ch === '/' && lineText[i + 1] === '/') {
            tokens.push({ text: lineText.slice(i), cls: 'hl-comment' });
            break;
        }

        // String or character literal
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

        // Identifier, type specifier, function definition, or variable
        if (/[A-Za-z_]/.test(ch)) {
            let end = i + 1;
            while (end < lineText.length && /\w/.test(lineText[end])) {
                end++;
            }
            const word = lineText.slice(i, end);
            const rest = lineText.slice(end);

            let cls = '';
            if (C_TYPES.has(word)) {
                cls = 'hl-keyword';
                afterTypeKeyword = true;
            } else if (C_KEYWORDS.has(word)) {
                cls = 'hl-keyword';
                afterTypeKeyword = false;
            } else if (afterTypeKeyword) {
                // Identifier right after a C type is either a function definition (`foo(`) or a variable (`x`)
                cls = /^\s*\(/.test(rest) ? 'hl-def' : 'hl-var';
                afterTypeKeyword = false;
            } else if (/^\s*=[^=]/.test(rest)) {
                cls = 'hl-var';
            }

            tokens.push({ text: word, cls });
            i = end;
            continue;
        }

        // Plain whitespace or punctuation
        let end = i + 1;
        while (end < lineText.length && !/[A-Za-z_"'/]/.test(lineText[end])) {
            if (lineText[end] === ';') {
                afterTypeKeyword = false;
            }
            end++;
        }
        tokens.push({ text: lineText.slice(i, end), cls: '' });
        i = end;
    }

    return tokens;
}

window.CHighlight = {
    tokenizeLine,
};

})();
