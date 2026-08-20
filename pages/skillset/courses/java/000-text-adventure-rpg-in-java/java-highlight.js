// Minimal, dependency-free syntax highlighter for the Java code blocks on
// this page. No external library or CDN — it tokenizes Java source with a
// single regex pass and wraps each token in a <span class="tok-*">, coloured
// by this course's style.css. Scoped to <code class="language-java"> so the
// plain shell/gdb command blocks are left alone.

// Control-flow, declaration and modifier keywords — coloured separately
// from type names. true/false/null are technically literals, not keywords,
// in the Java spec, but they read the same way to a highlighter, so they're
// folded in here rather than given a category of their own.
const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const',
  'continue', 'default', 'do', 'else', 'enum', 'extends', 'final',
  'finally', 'for', 'goto', 'if', 'implements', 'import', 'instanceof',
  'interface', 'native', 'new', 'non-sealed', 'package', 'permits',
  'private', 'protected', 'public', 'record', 'return', 'sealed', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'var', 'while', 'yield',
  'true', 'false', 'null',
]);

// Primitive types plus void. Reference types (String, CIntPointer, Player,
// ...) are recognised separately in classifyIdent() by their capitalized
// first letter, the standard Java naming convention.
const JAVA_PRIMITIVE_TYPES = new Set([
  'boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'char', 'void',
]);

// One master pattern, alternatives ordered so specific token kinds
// (comments, strings, annotations) are tried before the generic ones
// (operators, identifiers) that would otherwise swallow their start
// character. A match always starts at the regex engine's current position,
// so only one alternative can ever fire per position.
const TOKEN_REGEX = new RegExp(
  '(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)' +
  '|(?<string>"(?:\\\\.|[^"\\\\\\n])*")' +
  '|(?<char>\'(?:\\\\.|[^\'\\\\\\n])\')' +
  '|(?<annotation>@[A-Za-z_]\\w*)' +
  '|(?<number>\\b0[xX][0-9a-fA-F_]+[lL]?\\b|\\b[\\d_]+\\.?[\\d_]*(?:[eE][+-]?\\d+)?[lLfFdD]?\\b)' +
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

// Classifies one identifier: a keyword/literal, a primitive type, a
// reference type (capitalized, by convention), a method call (name
// immediately followed by "(", skipping whitespace), or a plain identifier.
function classifyIdent(name, code, afterIndex) {
  if (JAVA_KEYWORDS.has(name)) return `<span class="tok-keyword">${name}</span>`;
  if (JAVA_PRIMITIVE_TYPES.has(name)) return `<span class="tok-type">${name}</span>`;
  if (/^[A-Z]/.test(name)) return `<span class="tok-type">${name}</span>`;

  let i = afterIndex;
  while (i < code.length && /\s/.test(code[i])) i++;
  if (code[i] === '(') return `<span class="tok-func">${name}</span>`;

  return name;
}

// Tokenizes a Java source string and returns highlighted HTML.
function highlightJava(code) {
  let html = '';
  TOKEN_REGEX.lastIndex = 0;
  let match;
  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    const text = match[0];
    const g = match.groups;

    if (g.comment) html += `<span class="tok-comment">${escapeHtml(text)}</span>`;
    else if (g.string) html += `<span class="tok-string">${escapeHtml(text)}</span>`;
    else if (g.char) html += `<span class="tok-char">${escapeHtml(text)}</span>`;
    else if (g.annotation) html += `<span class="tok-annotation">${escapeHtml(text)}</span>`;
    else if (g.number) html += `<span class="tok-number">${escapeHtml(text)}</span>`;
    else if (g.ident) html += classifyIdent(text, code, TOKEN_REGEX.lastIndex);
    else if (g.bracket) html += `<span class="tok-bracket">${escapeHtml(text)}</span>`;
    else if (g.punct) html += `<span class="tok-punct">${escapeHtml(text)}</span>`;
    else if (g.operator) html += `<span class="tok-operator">${escapeHtml(text)}</span>`;
    else html += escapeHtml(text); // whitespace and any stray character
  }
  return html;
}

// Highlights every Java code block on the page. Reading textContent (rather
// than innerHTML) gives back the plain source even though the markup wrote
// "<" and "&" as HTML entities, so highlightJava() sees real Java source text.
function highlightAllCodeBlocks() {
  document.querySelectorAll('code.language-java').forEach(block => {
    block.innerHTML = highlightJava(block.textContent);
  });
}

document.addEventListener('DOMContentLoaded', highlightAllCodeBlocks);
