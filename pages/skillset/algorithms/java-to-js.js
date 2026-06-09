// A small, best-effort Java→JavaScript transpiler for the constrained code used
// in these algorithm exercises (a static method using primitives, String,
// arrays, StringBuilder and basic control flow). It rewrites Java *syntax* to JS
// and prepends a tiny runtime shim supplying the Java APIs the exercises lean on
// (System.out, Objects, Integer, Character, Arrays, StringBuilder).
//
// It supports only a subset on purpose: collections, streams, lambdas, casts and
// multi-dimensional arrays are rejected with a clear message rather than
// mistranslated. Note also that JS has no integer type, so Java integer division
// (7 / 2 == 3) and overflow are NOT reproduced.

// Java standard-library shim, prepended to the transpiled code before it runs.
const JAVA_SHIM = `
const System = { out: { println: (x) => console.log(x), print: (x) => console.log(x) } };
const Objects = {
  nonNull: (x) => x !== null && x !== undefined,
  isNull:  (x) => x === null || x === undefined,
  equals:  (a, b) => a === b,
};
const Integer = {
  parseInt: (s) => parseInt(s, 10), valueOf: (s) => parseInt(s, 10),
  toString: (n) => String(n), MAX_VALUE: 2147483647, MIN_VALUE: -2147483648,
};
const Long = { parseLong: (s) => parseInt(s, 10), valueOf: (s) => parseInt(s, 10) };
const Double = { parseDouble: (s) => parseFloat(s), valueOf: (s) => parseFloat(s) };
const Character = {
  isDigit: (c) => /[0-9]/.test(c), isLetter: (c) => /[a-zA-Z]/.test(c),
  isLetterOrDigit: (c) => /[a-zA-Z0-9]/.test(c), isWhitespace: (c) => /\\s/.test(c),
  toLowerCase: (c) => String(c).toLowerCase(), toUpperCase: (c) => String(c).toUpperCase(),
};
const Arrays = {
  sort: (a) => a.sort((x, y) => x - y),
  fill: (a, v) => a.fill(v),
  toString: (a) => '[' + a.join(', ') + ']',
  asList: (...a) => (a.length === 1 && Array.isArray(a[0]) ? a[0] : a),
};
class StringBuilder {
  constructor(init) { this.s = init === undefined ? '' : String(init); }
  append(x) { this.s += String(x); return this; }
  reverse() { this.s = [...this.s].reverse().join(''); return this; }
  charAt(i) { return this.s[i]; }
  insert(i, x) { this.s = this.s.slice(0, i) + String(x) + this.s.slice(i); return this; }
  deleteCharAt(i) { this.s = this.s.slice(0, i) + this.s.slice(i + 1); return this; }
  get length() { return this.s.length; }
  toString() { return this.s; }
}
`;

// Type tokens recognised in declarations (collections are intentionally absent).
const JAVA_TYPE = '\\b(?:final\\s+)?(?:int|long|short|byte|double|float|boolean|char|var|String|Object|Integer|Long|Double|Boolean|Character|StringBuilder)(?:\\[\\])*';

// Transpile a Java method (or two) into runnable JavaScript. Throws an Error with
// a friendly message when it meets a construct outside the supported subset.
function transpileJava(src) {
  // Reject what we can't faithfully translate, rather than emit wrong JS.
  const unsupported = [
    [/\b(?:ArrayList|LinkedList|HashMap|HashSet|TreeMap|TreeSet|ArrayDeque|PriorityQueue|Stack|List|Map|Set|Queue|Deque|Optional|Stream)\b/, 'collections / streams'],
    [/\(\s*(?:int|char|long|short|byte|double|float)\s*\)/, 'type casts such as (int) or (char)'],
    [/->/, 'lambdas'],
    [/\]\s*\[/, 'multi-dimensional arrays'],
    [/\binstanceof\b/, 'instanceof'],
  ];
  for (const [re, what] of unsupported) {
    if (re.test(src)) throw new Error('Unsupported Java for the transpiler: ' + what + '.');
  }

  let js = src;

  // Drop import/package lines and annotations.
  js = js.replace(/^\s*(?:import|package)\s+[^;]*;\s*$/gm, '');
  js = js.replace(/^\s*@\w+.*$/gm, '');

  // Drop access/other modifiers wherever they appear.
  js = js.replace(/\b(?:public|private|protected|static|final|abstract)\s+/g, '');

  // Method header:  ReturnType name(params) {  →  function name(args) {
  js = js.replace(/([A-Za-z_][\w.<>\[\]]*)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/g, (m, retType, name, params) => {
    if (['if', 'for', 'while', 'switch', 'catch'].includes(retType)) return m;
    const args = params.trim() === '' ? '' : params.split(',').map(p => p.trim().split(/\s+/).pop()).join(', ');
    return `function ${name}(${args}) {`;
  });

  // Enhanced for:  for (Type x : it)  →  for (const x of it)
  js = js.replace(new RegExp(`for\\s*\\(\\s*${JAVA_TYPE}\\s+([A-Za-z_]\\w*)\\s*:\\s*([^)]+)\\)`, 'g'), 'for (const $1 of $2)');
  // Classic for init:  for (Type i =  →  for (let i =
  js = js.replace(new RegExp(`for\\s*\\(\\s*${JAVA_TYPE}\\s+([A-Za-z_]\\w*)\\s*=`, 'g'), 'for (let $1 =');
  // Local declarations:  Type name = / ;  →  let name = / ;
  js = js.replace(new RegExp(`${JAVA_TYPE}\\s+([A-Za-z_]\\w*)\\s*(=|;)`, 'g'), 'let $1 $2');

  // Common API rewrites.
  js = js.replace(/\.length\(\)/g, '.length');                      // String/StringBuilder length()
  js = js.replace(/\.toCharArray\(\)/g, ".split('')");               // chars as a JS array
  js = js.replace(/new\s+String\s*\(([^)]*)\)/g, '($1).join("")');   // new String(charArray)
  js = js.replace(/new\s+(?:int|long|short|byte|double|float|boolean|char|Integer|String|Object)\s*\[([^\]]+)\]/g, 'new Array($1).fill(0)');
  js = js.replace(/new\s+\w*Exception\s*\(/g, 'new Error(');         // exceptions → Error

  return JAVA_SHIM + '\n' + js;
}
