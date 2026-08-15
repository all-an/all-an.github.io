// Minimal, dependency-free syntax highlighter for the C code blocks on this
// page. No external library or CDN — it tokenizes C source with a single
// regex pass and wraps each token in a <span class="tok-*">, coloured by
// c-programming/000-text-adventure-rpg-in-c/style.css. Scoped to
// <code class="language-c"> so the plain-shell code blocks are left alone.

// Control-flow / storage keywords — coloured separately from type names.
const C_KEYWORDS = new Set([
  'auto', 'break', 'case', 'const', 'continue', 'default', 'do', 'else',
  'enum', 'extern', 'for', 'goto', 'if', 'inline', 'register', 'restrict',
  'return', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
  'volatile', 'while', '_Bool', '_Complex', '_Imaginary',
]);

// Built-in and standard-library type names, plus anything ending in "_t"
// (the stdint.h / POSIX typedef convention) handled in classifyIdent().
const C_TYPES = new Set([
  'void', 'char', 'short', 'int', 'long', 'float', 'double', 'signed',
  'unsigned', 'FILE', 'bool',
]);

// One master pattern, alternatives ordered so specific token kinds
// (comments, strings, preprocessor lines) are tried before the generic ones
// (operators, identifiers) that would otherwise swallow their start
// character. A match always starts at the regex engine's current position,
// so only one alternative can ever fire per position.
const TOKEN_REGEX = new RegExp(
  '(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)' +
  '|(?<string>"(?:\\\\.|[^"\\\\\\n])*")' +
  '|(?<char>\'(?:\\\\.|[^\'\\\\\\n])\')' +
  '|(?<preproc>#[ \\t]*\\w+[^\\n]*)' +
  '|(?<number>\\b0[xX][0-9a-fA-F]+[uUlL]*\\b|\\b\\d+\\.?\\d*(?:[eE][+-]?\\d+)?[fFuUlL]*\\b)' +
  '|(?<ident>[A-Za-z_]\\w*)' +
  '|(?<bracket>[(){}\\[\\]])' +
  '|(?<punct>[,;])' +
  '|(?<operator>[+\\-*/%=<>!&|^~?:.]+)' +
  '|(?<space>\\s+)' +
  '|(?<other>.)',
  'g'
);

// Escapes text that will be inserted as HTML (everything except identifiers,
// which the [A-Za-z_]\w* charset guarantees are already HTML-safe).
function escapeHtml(text) {
  const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, c => chars[c]);
}

// Classifies one identifier: a keyword, a type, a function call (name
// immediately followed by "(", skipping whitespace), or a plain identifier.
function classifyIdent(name, code, afterIndex) {
  if (C_KEYWORDS.has(name)) return `<span class="tok-keyword">${name}</span>`;
  if (C_TYPES.has(name) || name.endsWith('_t')) return `<span class="tok-type">${name}</span>`;

  let i = afterIndex;
  while (i < code.length && /\s/.test(code[i])) i++;
  if (code[i] === '(') return `<span class="tok-func">${name}</span>`;

  return name;
}

// Tokenizes a C source string and returns highlighted HTML.
function highlightC(code) {
  let html = '';
  TOKEN_REGEX.lastIndex = 0;
  let match;
  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    const text = match[0];
    const g = match.groups;

    if (g.comment) html += `<span class="tok-comment">${escapeHtml(text)}</span>`;
    else if (g.string) html += `<span class="tok-string">${escapeHtml(text)}</span>`;
    else if (g.char) html += `<span class="tok-char">${escapeHtml(text)}</span>`;
    else if (g.preproc) html += `<span class="tok-preproc">${escapeHtml(text)}</span>`;
    else if (g.number) html += `<span class="tok-number">${escapeHtml(text)}</span>`;
    else if (g.ident) html += classifyIdent(text, code, TOKEN_REGEX.lastIndex);
    else if (g.bracket) html += `<span class="tok-bracket">${escapeHtml(text)}</span>`;
    else if (g.punct) html += `<span class="tok-punct">${escapeHtml(text)}</span>`;
    else if (g.operator) html += `<span class="tok-operator">${escapeHtml(text)}</span>`;
    else html += escapeHtml(text); // whitespace and any stray character
  }
  return html;
}

// Highlights every C code block on the page. Reading textContent (rather
// than innerHTML) gives back the plain source even though the markup wrote
// "<" and "&" as HTML entities, so highlightC() sees real C source text.
function highlightAllCodeBlocks() {
  document.querySelectorAll('code.language-c').forEach(block => {
    block.innerHTML = highlightC(block.textContent);
  });
}

document.addEventListener('DOMContentLoaded', highlightAllCodeBlocks);
