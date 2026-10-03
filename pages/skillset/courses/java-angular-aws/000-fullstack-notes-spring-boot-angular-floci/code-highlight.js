// Minimal, dependency-free syntax highlighter for this course's code blocks.
// No external library or CDN: each language is one regex whose named groups
// say what kind of token matched, and every token is wrapped in a
// <span class="tok-*"> coloured by style.css. A block opts in with
// <code class="language-NAME">; blocks without a language (command output,
// plain CSS) are left alone.

// Which stylesheet class each regex group maps to. A group not listed here
// (whitespace, plain words, stray characters) is emitted unstyled.
const CLASS_FOR_GROUP = {
  comment: 'comment', string: 'string', annotation: 'annotation', number: 'number',
  bracket: 'bracket', punct: 'punct', operator: 'operator', key: 'key', literal: 'literal',
  variable: 'variable', flag: 'flag', tag: 'tag', tagend: 'tag', attr: 'attr',
  interp: 'string', ctrl: 'keyword', keyword: 'keyword',
};

// Escapes text that is inserted as HTML.
function escapeHtml(text) {
  const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, c => chars[c]);
}

// Walks `code` with `regex` (every pattern consumes at least one character, so
// this always advances) and returns highlighted HTML. Words (the `ident`
// group) go through `classifyIdent` when the language has one.
function highlightWith(regex, code, classifyIdent) {
  let html = '';
  regex.lastIndex = 0;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const text = match[0];
    const group = Object.keys(match.groups).find(name => match.groups[name] !== undefined);
    if (group === 'ident' && classifyIdent) html += classifyIdent(text, code, regex.lastIndex);
    else if (CLASS_FOR_GROUP[group]) html += `<span class="tok-${CLASS_FOR_GROUP[group]}">${escapeHtml(text)}</span>`;
    else html += escapeHtml(text);
  }
  return html;
}

// ---- Java and TypeScript: one C-like tokenizer, two vocabularies ----
const JAVA_KEYWORDS = new Set([
  'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const', 'continue', 'default', 'do', 'else',
  'enum', 'extends', 'final', 'finally', 'for', 'if', 'implements', 'import', 'instanceof', 'interface',
  'new', 'package', 'private', 'protected', 'public', 'record', 'return', 'static', 'super', 'switch',
  'synchronized', 'this', 'throw', 'throws', 'try', 'var', 'while', 'true', 'false', 'null',
]);
const JAVA_PRIMITIVES = new Set(['boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'char', 'void']);

const TS_KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'constructor', 'continue', 'default',
  'else', 'enum', 'export', 'extends', 'finally', 'for', 'from', 'function', 'if', 'implements', 'import',
  'in', 'interface', 'let', 'new', 'of', 'private', 'protected', 'public', 'readonly', 'return', 'static',
  'switch', 'this', 'throw', 'try', 'type', 'typeof', 'var', 'while', 'true', 'false', 'null', 'undefined',
]);
const TS_PRIMITIVES = new Set(['string', 'number', 'boolean', 'any', 'unknown', 'never', 'object', 'void']);

const C_LIKE_REGEX = new RegExp(
  '(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)' +
  '|(?<string>"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'|`(?:\\\\.|[^`\\\\])*`)' +
  '|(?<annotation>@[A-Za-z_]\\w*)' +
  '|(?<number>\\b\\d[\\d_]*\\.?[\\d_]*(?:[eE][+-]?\\d+)?[lLfFdD]?\\b)' +
  '|(?<ident>[A-Za-z_$][\\w$]*)' +
  '|(?<bracket>[(){}\\[\\]])' +
  '|(?<punct>[,;])' +
  '|(?<operator>[+\\-*/%=<>!&|^~?:.]+)' +
  '|(?<space>\\s+)' +
  '|(?<other>.)',
  'g'
);

// Builds a highlighter for one C-like language: keywords, primitive types,
// capitalized names (by convention, types) and names followed by "(" (calls).
function cLikeHighlighter(keywords, primitives) {
  function classify(name, code, afterIndex) {
    if (keywords.has(name)) return `<span class="tok-keyword">${name}</span>`;
    if (primitives.has(name)) return `<span class="tok-type">${name}</span>`;
    if (/^[A-Z]/.test(name)) return `<span class="tok-type">${name}</span>`;
    let i = afterIndex;
    while (i < code.length && /\s/.test(code[i])) i++;
    if (code[i] === '(') return `<span class="tok-func">${name}</span>`;
    return name;
  }
  return code => highlightWith(C_LIKE_REGEX, code, classify);
}

// ---- HTML and XML (including Angular's {{ }} and @if / @for control flow) ----
const MARKUP_REGEX = new RegExp(
  '(?<comment><!--[\\s\\S]*?-->)' +
  '|(?<interp>\\{\\{[\\s\\S]*?\\}\\})' +
  '|(?<ctrl>@(?:for|if|else|empty|switch|case|default|let)\\b)' +
  '|(?<tag></?[A-Za-z][\\w:.-]*)' +
  '|(?<tagend>/?>)' +
  '|(?<string>"[^"]*"|\'[^\']*\')' +
  '|(?<attr>[A-Za-z_@\\[(#*][\\w:.@\\[\\]()#*-]*(?=\\s*=))' +
  '|(?<space>\\s+)' +
  '|(?<other>[^<{@"\'\\s]+|.)',
  'g'
);

// ---- YAML ----
const YAML_REGEX = new RegExp(
  '(?<comment>#[^\\n]*)' +
  '|(?<string>"(?:\\\\.|[^"\\\\\\n])*"|\'[^\'\\n]*\')' +
  '|(?<key>[A-Za-z_][\\w.\\-/]*(?=\\s*:(?:\\s|$)))' +
  '|(?<number>\\b\\d+(?:\\.\\d+)?\\b)' +
  '|(?<literal>\\b(?:true|false|null)\\b)' +
  '|(?<punct>[:\\-\\[\\]{},|>])' +
  '|(?<space>\\s+)' +
  '|(?<other>[^\\s]+)',
  'g'
);

// ---- JSON ----
const JSON_REGEX = new RegExp(
  '(?<key>"(?:\\\\.|[^"\\\\])*"(?=\\s*:))' +
  '|(?<string>"(?:\\\\.|[^"\\\\])*")' +
  '|(?<number>-?\\b\\d+(?:\\.\\d+)?\\b)' +
  '|(?<literal>\\b(?:true|false|null)\\b)' +
  '|(?<punct>[{}\\[\\],:])' +
  '|(?<space>\\s+)' +
  '|(?<other>.)',
  'g'
);

// ---- Shell (also used for nginx configs: comments, strings, $variables) ----
const SHELL_COMMANDS = new Set([
  'docker', 'aws', 'curl', 'unzip', 'rm', 'cd', 'mkdir', 'sh', 'export', 'npm', 'npx', 'ng', 'java',
  'echo', 'until', 'sleep', 'cat', 'git', 'sdk', 'nvm', 'set', './mvnw',
]);
const SHELL_REGEX = new RegExp(
  '(?<comment>(?:^|(?<=\\s))#[^\\n]*)' +
  '|(?<string>"(?:\\\\.|[^"\\\\])*"|\'[^\']*\')' +
  '|(?<variable>\\$\\{[^}]*\\}|\\$[A-Za-z_]\\w*)' +
  '|(?<flag>(?<=\\s)--?[A-Za-z][\\w-]*)' +
  '|(?<ident>[^\\s"\'$]+)' +
  '|(?<space>\\s+)' +
  '|(?<other>.)',
  'g'
);

function classifyShellWord(word) {
  return SHELL_COMMANDS.has(word) ? `<span class="tok-func">${escapeHtml(word)}</span>` : escapeHtml(word);
}

// ---- Dockerfile ----
const DOCKERFILE_REGEX = new RegExp(
  '(?<comment>#[^\\n]*)' +
  '|(?<string>"(?:\\\\.|[^"\\\\])*")' +
  '|(?<keyword>\\b(?:FROM|RUN|COPY|WORKDIR|EXPOSE|ENTRYPOINT|CMD|ENV|ARG|AS)\\b)' +
  '|(?<ident>[^\\s"#]+)' +
  '|(?<space>\\s+)' +
  '|(?<other>.)',
  'g'
);

const HIGHLIGHTERS = {
  java: cLikeHighlighter(JAVA_KEYWORDS, JAVA_PRIMITIVES),
  typescript: cLikeHighlighter(TS_KEYWORDS, TS_PRIMITIVES),
  html: code => highlightWith(MARKUP_REGEX, code),
  xml: code => highlightWith(MARKUP_REGEX, code),
  yaml: code => highlightWith(YAML_REGEX, code),
  json: code => highlightWith(JSON_REGEX, code),
  bash: code => highlightWith(SHELL_REGEX, code, classifyShellWord),
  nginx: code => highlightWith(SHELL_REGEX, code, classifyShellWord),
  dockerfile: code => highlightWith(DOCKERFILE_REGEX, code),
};

// Highlights every code block that names a language. Reading textContent
// (rather than innerHTML) gives back the plain source even though the markup
// wrote "<" and "&" as HTML entities.
function highlightAllCodeBlocks() {
  document.querySelectorAll('pre code[class*="language-"]').forEach(block => {
    const language = Array.from(block.classList).find(c => c.startsWith('language-')).slice('language-'.length);
    const highlight = HIGHLIGHTERS[language];
    if (highlight) block.innerHTML = highlight(block.textContent);
  });
}

document.addEventListener('DOMContentLoaded', highlightAllCodeBlocks);
