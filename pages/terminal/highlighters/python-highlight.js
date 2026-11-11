// python-highlight.js — Lightweight Python syntax highlighter for PseudoVimim (strings, definitions, variables)

(function () {

// Core Python definition and control keywords highlighted in PseudoVimim
const PYTHON_KEYWORDS = new Set([
    'def', 'class', 'return', 'import', 'from', 'if', 'elif', 'else',
    'for', 'while', 'in', 'and', 'or', 'not', 'True', 'False', 'None', 'print',
]);

// Splits a single Python line into `{ text, cls }` segments for strings, definitions, and variables.
function tokenizeLine(lineText) {
    if (!lineText) {
        return [];
    }

    const tokens = [];
    let i = 0;
    let afterDefOrClass = false;

    while (i < lineText.length) {
        const ch = lineText[i];

        // Comment starting with `#` to end of line
        if (ch === '#') {
            tokens.push({ text: lineText.slice(i), cls: 'hl-comment' });
            break;
        }

        // Single- or double-quoted string literal
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

        // Identifier, definition keyword, or assigned variable name
        if (/[A-Za-z_]/.test(ch)) {
            let end = i + 1;
            while (end < lineText.length && /\w/.test(lineText[end])) {
                end++;
            }
            const word = lineText.slice(i, end);
            const rest = lineText.slice(end);

            let cls = '';
            if (afterDefOrClass) {
                cls = 'hl-def';
                afterDefOrClass = false;
            } else if (PYTHON_KEYWORDS.has(word)) {
                cls = 'hl-keyword';
                if (word === 'def' || word === 'class') {
                    afterDefOrClass = true;
                }
            } else if (/^\s*=[^=]/.test(rest)) {
                // Variable being defined via assignment (`x = ...`)
                cls = 'hl-var';
            }

            tokens.push({ text: word, cls });
            i = end;
            continue;
        }

        // Plain whitespace or punctuation
        let end = i + 1;
        while (end < lineText.length && !/[A-Za-z_#"']/.test(lineText[end])) {
            end++;
        }
        tokens.push({ text: lineText.slice(i, end), cls: '' });
        i = end;
    }

    return tokens;
}

window.PythonHighlight = {
    tokenizeLine,
};

})();
