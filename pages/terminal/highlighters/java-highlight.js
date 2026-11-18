// java-highlight.js — Lightweight Java syntax highlighter for PseudoVimim (strings, classes/methods, types, variables)

(function () {

// Built-in Java types and standard library classes highlighted as keywords
const JAVA_TYPES = new Set([
    'void', 'boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'char',
    'var', 'String', 'Object', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character',
    'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'StringBuilder', 'System', 'Math', 'Arrays',
]);

// Core Java language keywords
const JAVA_KEYWORDS = new Set([
    'package', 'import', 'class', 'interface', 'enum', 'record', 'extends', 'implements',
    'public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'default',
    'new', 'this', 'super', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'break', 'continue', 'try', 'catch', 'finally', 'throw', 'throws', 'instanceof',
    'true', 'false', 'null',
]);

// Splits a single Java source line into `{ text, cls }` segments for strings, definitions, keywords, and variables.
function tokenizeLine(lineText) {
    if (!lineText) {
        return [];
    }

    // Java annotations (`@Override`, `@Transactional`)
    if (/^\s*@[A-Za-z_]/.test(lineText)) {
        return [{ text: lineText, cls: 'hl-def' }];
    }

    const tokens = [];
    let i = 0;
    let afterDefKeyword = false;
    let afterTypeToken  = false;

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

        // Identifier, keyword, class/method definition, or variable
        if (/[A-Za-z_$]/.test(ch)) {
            let end = i + 1;
            while (end < lineText.length && /[\w$]/.test(lineText[end])) {
                end++;
            }
            const word = lineText.slice(i, end);
            const rest = lineText.slice(end);

            let cls = '';
            if (word === 'class' || word === 'record' || word === 'interface' || word === 'enum') {
                cls = 'hl-keyword';
                afterDefKeyword = true;
                afterTypeToken  = false;
            } else if (JAVA_TYPES.has(word)) {
                cls = 'hl-keyword';
                afterTypeToken = true;
            } else if (JAVA_KEYWORDS.has(word)) {
                cls = 'hl-keyword';
            } else if (afterDefKeyword) {
                cls = 'hl-def';
                afterDefKeyword = false;
            } else if (afterTypeToken) {
                cls = /^\s*\(/.test(rest) ? 'hl-def' : 'hl-var';
                afterTypeToken = false;
            } else if (/^\s*\(/.test(rest)) {
                cls = 'hl-def';
            } else if (/^\s*=[^=]/.test(rest)) {
                cls = 'hl-var';
            }

            tokens.push({ text: word, cls });
            i = end;
            continue;
        }

        // Plain whitespace or punctuation
        let end = i + 1;
        while (end < lineText.length && !/[A-Za-z_$"'/]/.test(lineText[end])) {
            if (lineText[end] === ';') {
                afterTypeToken  = false;
                afterDefKeyword = false;
            }
            end++;
        }
        tokens.push({ text: lineText.slice(i, end), cls: '' });
        i = end;
    }

    return tokens;
}

window.JavaHighlight = {
    tokenizeLine,
};

})();
