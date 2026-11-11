// casm-runner.js — In-browser C and x86-64 Assembly (NASM/Intel) interpreter for the terminal and PseudoVimim

(function () {

// Maximum number of AST nodes or assembly instructions executed per run to prevent infinite loops
const MAX_EXECUTION_STEPS = 100000;
// Default stack pointer base address in the virtual x86-64 memory space (bytes)
const ASM_STACK_BASE      = 65536;
// Word size in bytes for 64-bit stack push/pop operations
const ASM_WORD_BYTES      = 8;

// ══════════════════════════════════════════════════════════════════════════════
// PART 1 — C LANGUAGE INTERPRETER
// ══════════════════════════════════════════════════════════════════════════════

// C type keywords recognized by the declaration and cast parser
const C_TYPE_KEYWORDS = new Set([
    'int', 'long', 'short', 'char', 'float', 'double', 'void', 'bool', 'unsigned', 'signed', 'size_t', 'const',
]);

// Strips comments and applies simple `#define NAME VALUE` macros while keeping line counts intact.
function preprocessCCode(rawSource) {
    const macros = {};

    // Remove multi-line /* ... */ comments while preserving newlines inside them
    let cleaned = rawSource.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));

    const lines = cleaned.split('\n');
    const processedLines = lines.map((line) => {
        // Strip single-line // comments
        const commentIdx = line.indexOf('//');
        const noComment  = commentIdx !== -1 ? line.slice(0, commentIdx) : line;
        const trimmed    = noComment.trim();

        if (trimmed.startsWith('#')) {
            const defMatch = trimmed.match(/^#\s*define\s+([A-Za-z_]\w*)\s+(.+)$/);
            if (defMatch) {
                macros[defMatch[1]] = defMatch[2].trim();
            }
            return '';
        }

        let expanded = noComment;
        for (const [name, replacement] of Object.entries(macros)) {
            expanded = expanded.replace(new RegExp(`\\b${name}\\b`, 'g'), replacement);
        }
        return expanded;
    });

    return processedLines.join('\n');
}

// Converts preprocessed C source code into a flat stream of typed lexical tokens.
function tokenizeC(source) {
    const tokens = [];
    let i    = 0;
    let line = 1;

    const multiCharOps = [
        '<<=', '>>=', '++', '--', '==', '!=', '<=', '>=', '&&', '||',
        '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '->',
    ];

    while (i < source.length) {
        const ch = source[i];

        if (ch === '\n') {
            line++;
            i++;
            continue;
        }
        if (/\s/.test(ch)) {
            i++;
            continue;
        }

        // String literal "..."
        if (ch === '"') {
            let str = '';
            i++;
            while (i < source.length && source[i] !== '"') {
                if (source[i] === '\\' && i + 1 < source.length) {
                    const esc = source[i + 1];
                    if (esc === 'n') str += '\n';
                    else if (esc === 't') str += '\t';
                    else if (esc === 'r') str += '\r';
                    else if (esc === '0') str += '\0';
                    else str += esc;
                    i += 2;
                } else {
                    str += source[i++];
                }
            }
            i++; // skip closing quote
            tokens.push({ type: 'STRING', value: str, line });
            continue;
        }

        // Character literal 'a'
        if (ch === '\'') {
            let charVal = 0;
            i++;
            if (source[i] === '\\' && i + 1 < source.length) {
                const esc = source[i + 1];
                if (esc === 'n') charVal = 10;
                else if (esc === 't') charVal = 9;
                else if (esc === '0') charVal = 0;
                else charVal = esc.charCodeAt(0);
                i += 2;
            } else if (i < source.length) {
                charVal = source.charCodeAt(i++);
            }
            if (source[i] === '\'') i++;
            tokens.push({ type: 'NUMBER', value: charVal, line });
            continue;
        }

        // Numeric literal (hexadecimal 0x... or decimal/float)
        if (/\d/.test(ch)) {
            let numStr = '';
            if (ch === '0' && (source[i + 1] === 'x' || source[i + 1] === 'X')) {
                numStr = '0x';
                i += 2;
                while (i < source.length && /[0-9a-fA-F]/.test(source[i])) {
                    numStr += source[i++];
                }
                tokens.push({ type: 'NUMBER', value: parseInt(numStr, 16), line });
            } else {
                let isFloat = false;
                while (i < source.length && (/\d/.test(source[i]) || source[i] === '.')) {
                    if (source[i] === '.') isFloat = true;
                    numStr += source[i++];
                }
                // Skip optional C numeric suffixes such as L, U, f
                while (i < source.length && /[uUlLfF]/.test(source[i])) i++;
                tokens.push({
                    type:  'NUMBER',
                    value: isFloat ? parseFloat(numStr) : parseInt(numStr, 10),
                    line,
                });
            }
            continue;
        }

        // Identifier or keyword
        if (/[A-Za-z_]/.test(ch)) {
            let ident = '';
            while (i < source.length && /\w/.test(source[i])) {
                ident += source[i++];
            }
            tokens.push({ type: 'IDENT', value: ident, line });
            continue;
        }

        // Multi-character operators
        const matchedOp = multiCharOps.find((op) => source.startsWith(op, i));
        if (matchedOp) {
            tokens.push({ type: 'OP', value: matchedOp, line });
            i += matchedOp.length;
            continue;
        }

        // Single-character punctuation or operator
        tokens.push({ type: 'OP', value: ch, line });
        i++;
    }

    tokens.push({ type: 'EOF', value: '', line });
    return tokens;
}

// Parses a C token stream into an AST containing function definitions and top-level statements.
function parseCProgram(tokens) {
    let pos = 0;

    function peek(offset = 0) {
        return tokens[Math.min(pos + offset, tokens.length - 1)];
    }

    function next() {
        return tokens[pos++];
    }

    function matchOp(val) {
        if (peek().type === 'OP' && peek().value === val) {
            pos++;
            return true;
        }
        return false;
    }

    function expectOp(val) {
        const tok = peek();
        if (tok.type !== 'OP' || tok.value !== val) {
            throw new Error(`Line ${tok.line}: Expected '${val}', found '${tok.value || tok.type}'`);
        }
        return next();
    }

    // Checks whether the current token starts a C type specifier (e.g. `int`, `unsigned long`, `char *`).
    function isTypeStart() {
        const tok = peek();
        return tok.type === 'IDENT' && C_TYPE_KEYWORDS.has(tok.value);
    }

    // Consumes a full C type specifier including modifiers (`unsigned long int`) and pointer stars (`*`).
    function parseTypeSpecifier() {
        const parts = [];
        while (isTypeStart()) {
            parts.push(next().value);
        }
        while (matchOp('*')) {
            parts.push('*');
        }
        return parts.join(' ');
    }

    // Parses a block `{ ... }` or a single statement into an AST node.
    function parseStatement() {
        const tok = peek();

        if (matchOp('{')) {
            const body = [];
            while (!matchOp('}') && peek().type !== 'EOF') {
                body.push(parseStatement());
            }
            return { kind: 'Block', body, line: tok.line };
        }

        if (tok.type === 'IDENT' && tok.value === 'if') {
            next();
            expectOp('(');
            const cond = parseExpression();
            expectOp(')');
            const thenBranch = parseStatement();
            let elseBranch = null;
            if (peek().type === 'IDENT' && peek().value === 'else') {
                next();
                elseBranch = parseStatement();
            }
            return { kind: 'If', cond, thenBranch, elseBranch, line: tok.line };
        }

        if (tok.type === 'IDENT' && tok.value === 'while') {
            next();
            expectOp('(');
            const cond = parseExpression();
            expectOp(')');
            const body = parseStatement();
            return { kind: 'While', cond, body, line: tok.line };
        }

        if (tok.type === 'IDENT' && tok.value === 'do') {
            next();
            const body = parseStatement();
            if (peek().type === 'IDENT' && peek().value === 'while') next();
            expectOp('(');
            const cond = parseExpression();
            expectOp(')');
            matchOp(';');
            return { kind: 'DoWhile', cond, body, line: tok.line };
        }

        if (tok.type === 'IDENT' && tok.value === 'for') {
            next();
            expectOp('(');
            let init = null;
            if (!matchOp(';')) {
                if (isTypeStart()) {
                    init = parseVarDeclaration();
                } else {
                    init = parseExpression();
                    expectOp(';');
                }
            }
            const cond = matchOp(';') ? null : (() => { const c = parseExpression(); expectOp(';'); return c; })();
            const step = matchOp(')') ? null : (() => { const s = parseExpression(); expectOp(')'); return s; })();
            const body = parseStatement();
            return { kind: 'For', init, cond, step, body, line: tok.line };
        }

        if (tok.type === 'IDENT' && tok.value === 'return') {
            next();
            const expr = matchOp(';') ? null : (() => { const e = parseExpression(); expectOp(';'); return e; })();
            return { kind: 'Return', expr, line: tok.line };
        }

        if (tok.type === 'IDENT' && tok.value === 'break') {
            next();
            expectOp(';');
            return { kind: 'Break', line: tok.line };
        }

        if (tok.type === 'IDENT' && tok.value === 'continue') {
            next();
            expectOp(';');
            return { kind: 'Continue', line: tok.line };
        }

        if (isTypeStart()) {
            return parseVarDeclaration();
        }

        if (matchOp(';')) {
            return { kind: 'Empty', line: tok.line };
        }

        const expr = parseExpression();
        expectOp(';');
        return { kind: 'ExprStmt', expr, line: tok.line };
    }

    // Parses one or more comma-separated variable declarations (`int a = 1, b[5] = {1, 2};`).
    function parseVarDeclaration() {
        const line     = peek().line;
        const baseType = parseTypeSpecifier();
        const decls    = [];

        do {
            while (matchOp('*')) { /* pointer declarator */ }
            const nameTok = next();
            if (nameTok.type !== 'IDENT') {
                throw new Error(`Line ${nameTok.line}: Expected variable name`);
            }

            let arraySize = null;
            if (matchOp('[')) {
                if (!matchOp(']')) {
                    arraySize = parseExpression();
                    expectOp(']');
                }
            }

            let init = null;
            if (matchOp('=')) {
                if (matchOp('{')) {
                    const items = [];
                    if (!matchOp('}')) {
                        do {
                            items.push(parseExpression());
                        } while (matchOp(','));
                        expectOp('}');
                    }
                    init = { kind: 'ArrayInit', items, line };
                } else {
                    init = parseExpression();
                }
            }

            decls.push({ name: nameTok.value, baseType, arraySize, init });
        } while (matchOp(','));

        expectOp(';');
        return { kind: 'VarDecl', decls, line };
    }

    // Precedence climbing expression parsers
    function parseExpression() {
        return parseAssignment();
    }

    function parseAssignment() {
        const left = parseTernary();
        const tok  = peek();
        const assignOps = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=']);
        if (tok.type === 'OP' && assignOps.has(tok.value)) {
            const op = next().value;
            const right = parseAssignment();
            return { kind: 'Assign', op, left, right, line: tok.line };
        }
        return left;
    }

    function parseTernary() {
        let expr = parseLogicalOr();
        if (matchOp('?')) {
            const thenExpr = parseExpression();
            expectOp(':');
            const elseExpr = parseTernary();
            expr = { kind: 'Ternary', cond: expr, thenExpr, elseExpr, line: expr.line };
        }
        return expr;
    }

    function parseLogicalOr() {
        let left = parseLogicalAnd();
        while (matchOp('||')) {
            left = { kind: 'Binary', op: '||', left, right: parseLogicalAnd(), line: left.line };
        }
        return left;
    }

    function parseLogicalAnd() {
        let left = parseBitwiseOr();
        while (matchOp('&&')) {
            left = { kind: 'Binary', op: '&&', left, right: parseBitwiseOr(), line: left.line };
        }
        return left;
    }

    function parseBitwiseOr() {
        let left = parseBitwiseXor();
        while (matchOp('|')) {
            left = { kind: 'Binary', op: '|', left, right: parseBitwiseXor(), line: left.line };
        }
        return left;
    }

    function parseBitwiseXor() {
        let left = parseBitwiseAnd();
        while (matchOp('^')) {
            left = { kind: 'Binary', op: '^', left, right: parseBitwiseAnd(), line: left.line };
        }
        return left;
    }

    function parseBitwiseAnd() {
        let left = parseEquality();
        while (matchOp('&')) {
            left = { kind: 'Binary', op: '&', left, right: parseEquality(), line: left.line };
        }
        return left;
    }

    function parseEquality() {
        let left = parseRelational();
        while (peek().type === 'OP' && (peek().value === '==' || peek().value === '!=')) {
            const op = next().value;
            left = { kind: 'Binary', op, left, right: parseRelational(), line: left.line };
        }
        return left;
    }

    function parseRelational() {
        let left = parseShift();
        while (peek().type === 'OP' && ['<', '<=', '>', '>='].includes(peek().value)) {
            const op = next().value;
            left = { kind: 'Binary', op, left, right: parseShift(), line: left.line };
        }
        return left;
    }

    function parseShift() {
        let left = parseAdditive();
        while (peek().type === 'OP' && (peek().value === '<<' || peek().value === '>>')) {
            const op = next().value;
            left = { kind: 'Binary', op, left, right: parseAdditive(), line: left.line };
        }
        return left;
    }

    function parseAdditive() {
        let left = parseMultiplicative();
        while (peek().type === 'OP' && (peek().value === '+' || peek().value === '-')) {
            const op = next().value;
            left = { kind: 'Binary', op, left, right: parseMultiplicative(), line: left.line };
        }
        return left;
    }

    function parseMultiplicative() {
        let left = parseUnary();
        while (peek().type === 'OP' && ['*', '/', '%'].includes(peek().value)) {
            const op = next().value;
            left = { kind: 'Binary', op, left, right: parseUnary(), line: left.line };
        }
        return left;
    }

    function parseUnary() {
        const tok = peek();
        if (tok.type === 'OP' && ['+', '-', '!', '~', '++', '--', '*', '&'].includes(tok.value)) {
            const op = next().value;
            return { kind: 'Unary', op, expr: parseUnary(), prefix: true, line: tok.line };
        }
        if (tok.type === 'IDENT' && tok.value === 'sizeof') {
            next();
            expectOp('(');
            if (isTypeStart()) {
                const t = parseTypeSpecifier();
                expectOp(')');
                const sizeMap = { char: 1, short: 2, int: 4, float: 4, long: 8, double: 8 };
                return { kind: 'Literal', value: sizeMap[t] || 4, line: tok.line };
            }
            const inner = parseExpression();
            expectOp(')');
            return { kind: 'Sizeof', expr: inner, line: tok.line };
        }
        return parsePostfix();
    }

    function parsePostfix() {
        let expr = parsePrimary();
        while (true) {
            if (matchOp('[')) {
                const index = parseExpression();
                expectOp(']');
                expr = { kind: 'Index', target: expr, index, line: expr.line };
            } else if (matchOp('(')) {
                const args = [];
                if (!matchOp(')')) {
                    do {
                        args.push(parseExpression());
                    } while (matchOp(','));
                    expectOp(')');
                }
                expr = { kind: 'Call', callee: expr.name || '', args, line: expr.line };
            } else if (peek().type === 'OP' && (peek().value === '++' || peek().value === '--')) {
                const op = next().value;
                expr = { kind: 'Unary', op, expr, prefix: false, line: expr.line };
            } else {
                break;
            }
        }
        return expr;
    }

    function parsePrimary() {
        const tok = peek();
        if (matchOp('(')) {
            if (isTypeStart()) {
                parseTypeSpecifier();
                expectOp(')');
                return parseUnary();
            }
            const expr = parseExpression();
            expectOp(')');
            return expr;
        }
        if (tok.type === 'NUMBER' || tok.type === 'STRING') {
            next();
            return { kind: 'Literal', value: tok.value, line: tok.line };
        }
        if (tok.type === 'IDENT') {
            next();
            if (tok.value === 'true') return { kind: 'Literal', value: 1, line: tok.line };
            if (tok.value === 'false' || tok.value === 'NULL') return { kind: 'Literal', value: 0, line: tok.line };
            return { kind: 'Var', name: tok.value, line: tok.line };
        }
        throw new Error(`Line ${tok.line}: Unexpected token '${tok.value || tok.type}'`);
    }

    // Top-level parser: distinguishes function definitions from global variable declarations and statements.
    const functions = {};
    const topStatements = [];

    while (peek().type !== 'EOF') {
        if (isTypeStart()) {
            const savedPos = pos;
            const returnType = parseTypeSpecifier();
            const nameTok = peek();
            if (nameTok.type === 'IDENT' && peek(1).type === 'OP' && peek(1).value === '(') {
                next(); // consume function name
                expectOp('(');
                const params = [];
                if (!matchOp(')')) {
                    if (peek().type === 'IDENT' && peek().value === 'void' && peek(1).value === ')') {
                        next();
                        expectOp(')');
                    } else {
                        do {
                            const pType = parseTypeSpecifier();
                            const pName = next().value;
                            if (matchOp('[')) matchOp(']');
                            params.push({ name: pName, type: pType });
                        } while (matchOp(','));
                        expectOp(')');
                    }
                }
                if (matchOp(';')) {
                    // Forward prototype declaration
                    continue;
                }
                const body = parseStatement();
                functions[nameTok.value] = { name: nameTok.value, returnType, params, body, line: nameTok.line };
                continue;
            }
            // Rewind and parse as a variable declaration statement
            pos = savedPos;
        }
        topStatements.push(parseStatement());
    }

    return { functions, topStatements };
}

// Formats a C `printf` format string with the provided evaluated argument list.
function formatCPrintf(fmt, args) {
    let argIdx = 0;
    return String(fmt).replace(/%(-?\d*(?:\.\d+)?)([lL]?[diufFeEgGxXscp%])/g, (full, specWidth, conv) => {
        if (conv === '%') return '%';
        const val = args[argIdx++];
        const typeChar = conv[conv.length - 1];

        if (typeChar === 'd' || typeChar === 'i' || typeChar === 'u') {
            return String(Math.trunc(Number(val) || 0));
        }
        if (typeChar === 'f' || typeChar === 'F') {
            const num = Number(val) || 0;
            const precMatch = specWidth.match(/\.(\d+)/);
            const digits = precMatch ? parseInt(precMatch[1], 10) : 6;
            return num.toFixed(digits);
        }
        if (typeChar === 'x' || typeChar === 'p') {
            return (Math.trunc(Number(val) || 0) >>> 0).toString(16);
        }
        if (typeChar === 'X') {
            return (Math.trunc(Number(val) || 0) >>> 0).toString(16).toUpperCase();
        }
        if (typeChar === 'c') {
            return typeof val === 'string' ? val[0] || '' : String.fromCharCode(Number(val) || 0);
        }
        if (typeChar === 's') {
            return Array.isArray(val) ? val.map((c) => String.fromCharCode(c)).join('').replace(/\0.*$/, '') : String(val ?? '');
        }
        return String(val ?? '');
    });
}

// Executes a parsed C AST and returns captured stdout lines, stderr lines, and the last expression result.
function executeCProgram(ast) {
    let steps       = 0;
    let stdoutBuf   = '';
    let lastExprVal = undefined;

    function tick(line) {
        if (++steps > MAX_EXECUTION_STEPS) {
            throw new Error(`Line ${line}: Execution exceeded ${MAX_EXECUTION_STEPS} steps (infinite loop guard)`);
        }
    }

    function lookupVar(env, name, line) {
        for (let s = env.length - 1; s >= 0; s--) {
            if (Object.prototype.hasOwnProperty.call(env[s], name)) {
                return env[s];
            }
        }
        throw new Error(`Line ${line}: Undeclared identifier '${name}'`);
    }

    function evalExpr(node, env) {
        if (!node) return 0;
        tick(node.line);

        switch (node.kind) {
            case 'Literal':
                return node.value;

            case 'Var': {
                const scope = lookupVar(env, node.name, node.line);
                return scope[node.name];
            }

            case 'Index': {
                const target = evalExpr(node.target, env);
                const idx    = Math.trunc(evalExpr(node.index, env));
                if (typeof target === 'string') {
                    return idx < target.length ? target.charCodeAt(idx) : 0;
                }
                if (Array.isArray(target)) {
                    return target[idx] ?? 0;
                }
                throw new Error(`Line ${node.line}: Subscripted value is not an array`);
            }

            case 'Sizeof': {
                const v = evalExpr(node.expr, env);
                if (Array.isArray(v)) return v.length * 4;
                if (typeof v === 'string') return v.length + 1;
                return 4;
            }

            case 'Unary': {
                if (node.op === '++' || node.op === '--') {
                    const delta = node.op === '++' ? 1 : -1;
                    if (node.expr.kind === 'Var') {
                        const scope = lookupVar(env, node.expr.name, node.line);
                        const old   = Number(scope[node.expr.name]) || 0;
                        scope[node.expr.name] = old + delta;
                        return node.prefix ? scope[node.expr.name] : old;
                    }
                    if (node.expr.kind === 'Index') {
                        const arr = evalExpr(node.expr.target, env);
                        const idx = Math.trunc(evalExpr(node.expr.index, env));
                        const old = Number(arr[idx]) || 0;
                        arr[idx]  = old + delta;
                        return node.prefix ? arr[idx] : old;
                    }
                }
                const val = evalExpr(node.expr, env);
                if (node.op === '-') return -val;
                if (node.op === '+') return +val;
                if (node.op === '!') return val ? 0 : 1;
                if (node.op === '~') return ~val;
                return val;
            }

            case 'Binary': {
                if (node.op === '&&') return evalExpr(node.left, env) && evalExpr(node.right, env) ? 1 : 0;
                if (node.op === '||') return evalExpr(node.left, env) || evalExpr(node.right, env) ? 1 : 0;
                const l = evalExpr(node.left, env);
                const r = evalExpr(node.right, env);
                switch (node.op) {
                    case '+':  return l + r;
                    case '-':  return l - r;
                    case '*':  return l * r;
                    case '/':
                        if (r === 0) throw new Error(`Line ${node.line}: Division by zero`);
                        return Number.isInteger(l) && Number.isInteger(r) ? Math.trunc(l / r) : l / r;
                    case '%':  return l % r;
                    case '==': return l === r ? 1 : 0;
                    case '!=': return l !== r ? 1 : 0;
                    case '<':  return l < r ? 1 : 0;
                    case '<=': return l <= r ? 1 : 0;
                    case '>':  return l > r ? 1 : 0;
                    case '>=': return l >= r ? 1 : 0;
                    case '&':  return l & r;
                    case '|':  return l | r;
                    case '^':  return l ^ r;
                    case '<<': return l << r;
                    case '>>': return l >> r;
                }
                return 0;
            }

            case 'Ternary':
                return evalExpr(node.cond, env) ? evalExpr(node.thenExpr, env) : evalExpr(node.elseExpr, env);

            case 'Assign': {
                const rhs = evalExpr(node.right, env);
                const applyOp = (cur, val) => {
                    switch (node.op) {
                        case '=':   return val;
                        case '+=':  return cur + val;
                        case '-=':  return cur - val;
                        case '*=':  return cur * val;
                        case '/=':  return Number.isInteger(cur) && Number.isInteger(val) ? Math.trunc(cur / val) : cur / val;
                        case '%=':  return cur % val;
                        case '&=':  return cur & val;
                        case '|=':  return cur | val;
                        case '^=':  return cur ^ val;
                        case '<<=': return cur << val;
                        case '>>=': return cur >> val;
                        default:    return val;
                    }
                };

                if (node.left.kind === 'Var') {
                    const scope = lookupVar(env, node.left.name, node.line);
                    scope[node.left.name] = applyOp(scope[node.left.name], rhs);
                    return scope[node.left.name];
                }
                if (node.left.kind === 'Index') {
                    const arr = evalExpr(node.left.target, env);
                    const idx = Math.trunc(evalExpr(node.left.index, env));
                    arr[idx]  = applyOp(arr[idx] ?? 0, rhs);
                    return arr[idx];
                }
                throw new Error(`Line ${node.line}: Invalid assignment target`);
            }

            case 'Call': {
                const args = node.args.map((a) => evalExpr(a, env));
                return invokeFunction(node.callee, args, node.line);
            }
        }
        return 0;
    }

    function invokeFunction(name, args, line) {
        // Built-in C standard library functions
        if (name === 'printf') {
            const text = formatCPrintf(args[0] ?? '', args.slice(1));
            stdoutBuf += text;
            return text.length;
        }
        if (name === 'puts') {
            const str = String(args[0] ?? '');
            stdoutBuf += str + '\n';
            return str.length + 1;
        }
        if (name === 'putchar') {
            const ch = typeof args[0] === 'string' ? args[0][0] : String.fromCharCode(Number(args[0]) || 0);
            stdoutBuf += ch;
            return ch.charCodeAt(0);
        }
        if (name === 'strlen') return String(args[0] ?? '').length;
        if (name === 'strcmp') return String(args[0] ?? '').localeCompare(String(args[1] ?? ''));
        if (name === 'abs' || name === 'fabs') return Math.abs(Number(args[0]) || 0);
        if (name === 'sqrt') return Math.sqrt(Number(args[0]) || 0);
        if (name === 'pow') return Math.pow(Number(args[0]) || 0, Number(args[1]) || 0);

        const fn = ast.functions[name];
        if (!fn) {
            throw new Error(`Line ${line}: Implicit or undefined function '${name}'`);
        }

        const localScope = {};
        fn.params.forEach((p, idx) => {
            localScope[p.name] = args[idx] ?? 0;
        });

        const callEnv = [envRoot, localScope];
        const res = execStmt(fn.body, callEnv);
        if (res && res.type === 'return') {
            return res.value;
        }
        return 0;
    }

    function execStmt(stmt, env) {
        if (!stmt) return null;
        tick(stmt.line);

        switch (stmt.kind) {
            case 'Empty':
                return null;

            case 'Block': {
                const blockScope = {};
                env.push(blockScope);
                try {
                    for (const child of stmt.body) {
                        const signal = execStmt(child, env);
                        if (signal) return signal;
                    }
                } finally {
                    env.pop();
                }
                return null;
            }

            case 'VarDecl': {
                const currentScope = env[env.length - 1];
                for (const d of stmt.decls) {
                    if (d.arraySize !== null || (d.init && d.init.kind === 'ArrayInit')) {
                        const len   = d.arraySize ? Math.trunc(evalExpr(d.arraySize, env)) : d.init.items.length;
                        const items = d.init && d.init.kind === 'ArrayInit'
                            ? d.init.items.map((it) => evalExpr(it, env))
                            : [];
                        const arr = new Array(Math.max(len, items.length)).fill(0);
                        items.forEach((v, idx) => { arr[idx] = v; });
                        currentScope[d.name] = arr;
                    } else {
                        currentScope[d.name] = d.init ? evalExpr(d.init, env) : 0;
                    }
                    lastExprVal = currentScope[d.name];
                }
                return null;
            }

            case 'ExprStmt':
                lastExprVal = evalExpr(stmt.expr, env);
                return null;

            case 'If':
                if (evalExpr(stmt.cond, env)) {
                    return execStmt(stmt.thenBranch, env);
                } else if (stmt.elseBranch) {
                    return execStmt(stmt.elseBranch, env);
                }
                return null;

            case 'While':
                while (evalExpr(stmt.cond, env)) {
                    const sig = execStmt(stmt.body, env);
                    if (sig) {
                        if (sig.type === 'break') break;
                        if (sig.type === 'continue') continue;
                        return sig;
                    }
                }
                return null;

            case 'DoWhile':
                do {
                    const sig = execStmt(stmt.body, env);
                    if (sig) {
                        if (sig.type === 'break') break;
                        if (sig.type === 'continue') continue;
                        return sig;
                    }
                } while (evalExpr(stmt.cond, env));
                return null;

            case 'For': {
                const forScope = {};
                env.push(forScope);
                try {
                    if (stmt.init) {
                        if (stmt.init.kind === 'VarDecl') execStmt(stmt.init, env);
                        else evalExpr(stmt.init, env);
                    }
                    while (stmt.cond ? evalExpr(stmt.cond, env) : 1) {
                        const sig = execStmt(stmt.body, env);
                        if (sig) {
                            if (sig.type === 'break') break;
                            if (sig.type !== 'continue') return sig;
                        }
                        if (stmt.step) evalExpr(stmt.step, env);
                    }
                } finally {
                    env.pop();
                }
                return null;
            }

            case 'Return':
                return { type: 'return', value: stmt.expr ? evalExpr(stmt.expr, env) : 0 };

            case 'Break':
                return { type: 'break' };

            case 'Continue':
                return { type: 'continue' };
        }
        return null;
    }

    const envRoot = {};
    const topEnv  = [envRoot];

    for (const stmt of ast.topStatements) {
        execStmt(stmt, topEnv);
    }

    if (ast.functions.main) {
        lastExprVal = invokeFunction('main', [], ast.functions.main.line);
    }

    const outLines = stdoutBuf.length > 0
        ? stdoutBuf.replace(/\n$/, '').split('\n')
        : [];

    return { outLines, lastExprVal, envRoot };
}

// Runs a complete C source string and returns `{ outLines, errLines }`.
async function runCFile(codeString) {
    try {
        const cleaned = preprocessCCode(codeString);
        const tokens  = tokenizeC(cleaned);
        const ast     = parseCProgram(tokens);
        const result  = executeCProgram(ast);
        return { outLines: result.outLines, errLines: [] };
    } catch (err) {
        return { outLines: [], errLines: [String(err.message || err)] };
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// PART 2 — x86-64 / x86 ASSEMBLY (NASM / INTEL SYNTAX) INTERPRETER
// ══════════════════════════════════════════════════════════════════════════════

// Maps 64-bit, 32-bit, 16-bit, and 8-bit x86-64 register aliases to their canonical 64-bit register name.
const ASM_REGISTER_MAP = {
    rax: 'rax', eax: 'rax', ax: 'rax', al: 'rax',
    rbx: 'rbx', ebx: 'rbx', bx: 'rbx', bl: 'rbx',
    rcx: 'rcx', ecx: 'rcx', cx: 'rcx', cl: 'rcx',
    rdx: 'rdx', edx: 'rdx', dx: 'rdx', dl: 'rdx',
    rsi: 'rsi', esi: 'rsi', si: 'rsi',
    rdi: 'rdi', edi: 'rdi', di: 'rdi',
    rbp: 'rbp', ebp: 'rbp', bp: 'rbp',
    rsp: 'rsp', esp: 'rsp', sp: 'rsp',
    r8:  'r8',  r8d: 'r8',
    r9:  'r9',  r9d: 'r9',
    r10: 'r10', r10d: 'r10',
    r11: 'r11', r11d: 'r11',
    r12: 'r12', r12d: 'r12',
    r13: 'r13', r13d: 'r13',
    r14: 'r14', r14d: 'r14',
    r15: 'r15', r15d: 'r15',
};

// Strips `;`, `//`, or `#` comments from a single assembly line while preserving quoted strings.
function stripAsmComment(line) {
    let inQuotes = false;
    let quoteCh  = '';
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
            if (ch === quoteCh && line[i - 1] !== '\\') inQuotes = false;
        } else {
            if (ch === '"' || ch === '\'') {
                inQuotes = true;
                quoteCh  = ch;
            } else if (ch === ';' || ch === '#' || (ch === '/' && line[i + 1] === '/')) {
                return line.slice(0, i);
            }
        }
    }
    return line;
}

// Splits assembly operand lists by comma while keeping commas inside quotes or brackets intact.
function splitAsmOperands(operandStr) {
    const parts = [];
    let current = '';
    let inQuote = false;
    let quoteCh = '';
    let depth   = 0;

    for (let i = 0; i < operandStr.length; i++) {
        const ch = operandStr[i];
        if (inQuote) {
            current += ch;
            if (ch === quoteCh && operandStr[i - 1] !== '\\') inQuote = false;
        } else if (ch === '"' || ch === '\'') {
            inQuote = true;
            quoteCh = ch;
            current += ch;
        } else if (ch === '[') {
            depth++;
            current += ch;
        } else if (ch === ']') {
            depth = Math.max(0, depth - 1);
            current += ch;
        } else if (ch === ',' && depth === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) {
        parts.push(current.trim());
    }
    return parts;
}

// Parses and executes an x86-64 / x86 assembly program and returns its stdout, stderr, and final register state.
function executeAsmProgram(rawSource, stopAtLine = null) {
    const regs = {
        rax: 0, rbx: 0, rcx: 0, rdx: 0,
        rsi: 0, rdi: 0, rbp: ASM_STACK_BASE, rsp: ASM_STACK_BASE,
        r8: 0, r9: 0, r10: 0, r11: 0, r12: 0, r13: 0, r14: 0, r15: 0,
    };
    const flags      = { zf: 0, sf: 0, cf: 0, of: 0 };
    const memory     = new Uint8Array(ASM_STACK_BASE + 4096);
    const dataView   = new DataView(memory.buffer);
    const symbols    = {};
    const touchedRegs = new Set();
    let   nextMemPtr = 256; // Starting address for .data allocations
    let   stdoutBuf  = '';

    const rawLines = rawSource.split('\n');
    const instructions = [];
    const labels = {};

    // First pass: parse data definitions (`db`, `equ`), labels, and instructions
    rawLines.forEach((rawLine, lineIdx) => {
        if (stopAtLine !== null && lineIdx > stopAtLine) {
            return;
        }
        let clean = stripAsmComment(rawLine).trim();
        if (!clean) return;

        // Extract leading label `loop_start:` if present
        const labelMatch = clean.match(/^([A-Za-z_.$][\w.$]*):\s*(.*)$/);
        if (labelMatch) {
            const labelName = labelMatch[1];
            labels[labelName]  = instructions.length;
            symbols[labelName] = nextMemPtr;
            clean = labelMatch[2].trim();
            if (!clean) return;
        }

        // Ignore assembler directives like `section .text`, `global _start`, `bits 64`
        if (/^(section|segment|global|extern|bits|default)\b/i.test(clean)) {
            return;
        }

        // Handle `<name> equ <expr>` constant definitions (including `$ - label`)
        const equMatch = clean.match(/^([A-Za-z_.$][\w.$]*)\s+equ\s+(.+)$/i);
        if (equMatch) {
            const symName = equMatch[1];
            const expr    = equMatch[2].trim();
            const lenDiff = expr.match(/^\$\s*-\s*([A-Za-z_.$][\w.$]*)$/);
            if (lenDiff && symbols[lenDiff[1]] !== undefined) {
                symbols[symName] = nextMemPtr - symbols[lenDiff[1]];
            } else {
                symbols[symName] = parseAsmImmediate(expr, symbols);
            }
            return;
        }

        // Handle `<name> db/dw/dd/dq <values>` data definitions
        const dataMatch = clean.match(/^(?:([A-Za-z_.$][\w.$]*)\s+)?(db|dw|dd|dq)\s+(.+)$/i);
        if (dataMatch) {
            const symName = dataMatch[1];
            const dir     = dataMatch[2].toLowerCase();
            const items   = splitAsmOperands(dataMatch[3]);
            if (symName) {
                symbols[symName] = nextMemPtr;
            }
            for (const item of items) {
                if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith('\'') && item.endsWith('\''))) {
                    const strContent = item.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
                    for (let c = 0; c < strContent.length; c++) {
                        memory[nextMemPtr++] = strContent.charCodeAt(c);
                    }
                } else {
                    const val = parseAsmImmediate(item, symbols);
                    if (dir === 'db') {
                        memory[nextMemPtr++] = val & 0xff;
                    } else if (dir === 'dw') {
                        dataView.setInt16(nextMemPtr, val, true);
                        nextMemPtr += 2;
                    } else if (dir === 'dd') {
                        dataView.setInt32(nextMemPtr, val, true);
                        nextMemPtr += 4;
                    } else {
                        dataView.setInt32(nextMemPtr, val, true);
                        nextMemPtr += 8;
                    }
                }
            }
            return;
        }

        // Parse standard instruction mnemonic and operands
        const insMatch = clean.match(/^([A-Za-z]+)\s*(.*)$/);
        if (insMatch) {
            const op       = insMatch[1].toLowerCase();
            const operands = insMatch[2] ? splitAsmOperands(insMatch[2]) : [];
            instructions.push({ op, operands, line: lineIdx + 1 });
        }
    });

    function parseAsmImmediate(token, symMap) {
        const trimmed = String(token).trim().replace(/^%/, '');
        if (symMap && Object.prototype.hasOwnProperty.call(symMap, trimmed)) {
            return symMap[trimmed];
        }
        if (/^0x[0-9a-f]+$/i.test(trimmed)) return parseInt(trimmed, 16);
        if (/^[0-9a-f]+h$/i.test(trimmed)) return parseInt(trimmed.slice(0, -1), 16);
        if (/^0b[01]+$/i.test(trimmed)) return parseInt(trimmed.slice(2), 2);
        if ((trimmed.startsWith('\'') && trimmed.endsWith('\'')) && trimmed.length === 3) {
            return trimmed.charCodeAt(1);
        }
        const n = Number(trimmed);
        if (!Number.isNaN(n)) return Math.trunc(n);
        return 0;
    }

    function resolveReg(token) {
        if (!token) return null;
        const clean = token.trim().replace(/^%/, '').toLowerCase();
        return ASM_REGISTER_MAP[clean] || null;
    }

    function readEffectiveAddress(innerExpr) {
        // Supports `[reg]`, `[label]`, `[reg + imm]`, `[reg - imm]`
        const parts = innerExpr.replace(/\s+/g, '').split(/([+-])/);
        let addr = 0;
        let sign = 1;
        for (const p of parts) {
            if (p === '+') { sign = 1; continue; }
            if (p === '-') { sign = -1; continue; }
            if (!p) continue;
            const r = resolveReg(p);
            if (r) {
                addr += sign * regs[r];
            } else {
                addr += sign * parseAsmImmediate(p, symbols);
            }
        }
        return Math.max(0, Math.min(addr, memory.length - 8));
    }

    function readOperand(opStr) {
        if (!opStr) return 0;
        const trimmed = opStr.trim().replace(/^(byte|word|dword|qword)\s+(ptr\s+)?/i, '');
        const reg = resolveReg(trimmed);
        if (reg) return regs[reg];

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            const addr = readEffectiveAddress(trimmed.slice(1, -1));
            return dataView.getInt32(addr, true);
        }

        return parseAsmImmediate(trimmed, symbols);
    }

    function writeOperand(opStr, value) {
        const intVal  = Math.trunc(Number(value) || 0);
        const trimmed = opStr.trim().replace(/^(byte|word|dword|qword)\s+(ptr\s+)?/i, '');
        const reg     = resolveReg(trimmed);
        if (reg) {
            regs[reg] = intVal;
            touchedRegs.add(reg);
            return;
        }
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            const addr = readEffectiveAddress(trimmed.slice(1, -1));
            if (/^byte\b/i.test(opStr.trim())) {
                memory[addr] = intVal & 0xff;
            } else {
                dataView.setInt32(addr, intVal, true);
            }
        }
    }

    function updateFlags(result) {
        const v = Math.trunc(result);
        flags.zf = v === 0 ? 1 : 0;
        flags.sf = v < 0 ? 1 : 0;
    }

    function readCStringFromMemory(addr, maxLen = 256) {
        let out = '';
        for (let i = 0; i < maxLen && addr + i < memory.length; i++) {
            const byte = memory[addr + i];
            if (byte === 0) break;
            out += String.fromCharCode(byte);
        }
        return out;
    }

    // Start at `_start` or `main` if defined, otherwise at instruction 0
    let ip = labels._start ?? labels.main ?? 0;
    let steps = 0;
    const callStack = [];

    while (ip >= 0 && ip < instructions.length) {
        if (++steps > MAX_EXECUTION_STEPS) {
            throw new Error(`Assembly execution exceeded ${MAX_EXECUTION_STEPS} instructions (infinite loop guard)`);
        }

        const ins = instructions[ip];
        const op  = ins.op;
        const [a, b, c] = ins.operands;

        switch (op) {
            case 'nop':
                ip++;
                break;

            case 'mov':
            case 'movzx':
            case 'movsx':
                writeOperand(a, readOperand(b));
                ip++;
                break;

            case 'lea': {
                const inner = b.trim().replace(/^\[|\]$/g, '');
                writeOperand(a, readEffectiveAddress(inner));
                ip++;
                break;
            }

            case 'xchg': {
                const va = readOperand(a);
                const vb = readOperand(b);
                writeOperand(a, vb);
                writeOperand(b, va);
                ip++;
                break;
            }

            case 'add': {
                const res = readOperand(a) + readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'sub': {
                const res = readOperand(a) - readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'inc': {
                const res = readOperand(a) + 1;
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'dec': {
                const res = readOperand(a) - 1;
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'imul':
            case 'mul': {
                if (c !== undefined) {
                    const res = readOperand(b) * readOperand(c);
                    writeOperand(a, res);
                    updateFlags(res);
                } else if (b !== undefined) {
                    const res = readOperand(a) * readOperand(b);
                    writeOperand(a, res);
                    updateFlags(res);
                } else {
                    const res = regs.rax * readOperand(a);
                    regs.rax = res;
                    touchedRegs.add('rax');
                    updateFlags(res);
                }
                ip++;
                break;
            }

            case 'idiv':
            case 'div': {
                const divisor = readOperand(a);
                if (divisor === 0) throw new Error(`Line ${ins.line}: Division by zero`);
                const quotient  = Math.trunc(regs.rax / divisor);
                const remainder = regs.rax % divisor;
                regs.rax = quotient;
                regs.rdx = remainder;
                touchedRegs.add('rax');
                touchedRegs.add('rdx');
                ip++;
                break;
            }

            case 'neg': {
                const res = -readOperand(a);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'and': {
                const res = readOperand(a) & readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'or': {
                const res = readOperand(a) | readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'xor': {
                const res = readOperand(a) ^ readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'not': {
                const res = ~readOperand(a);
                writeOperand(a, res);
                ip++;
                break;
            }

            case 'shl':
            case 'sal': {
                const res = readOperand(a) << readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'shr': {
                const res = readOperand(a) >>> readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'sar': {
                const res = readOperand(a) >> readOperand(b);
                writeOperand(a, res);
                updateFlags(res);
                ip++;
                break;
            }

            case 'cmp': {
                const diff = readOperand(a) - readOperand(b);
                updateFlags(diff);
                flags.cf = readOperand(a) < readOperand(b) ? 1 : 0;
                ip++;
                break;
            }

            case 'test': {
                const res = readOperand(a) & readOperand(b);
                updateFlags(res);
                ip++;
                break;
            }

            case 'push':
                regs.rsp -= ASM_WORD_BYTES;
                dataView.setInt32(regs.rsp, readOperand(a), true);
                ip++;
                break;

            case 'pop':
                writeOperand(a, dataView.getInt32(regs.rsp, true));
                regs.rsp += ASM_WORD_BYTES;
                ip++;
                break;

            case 'jmp':
                if (labels[a] === undefined) throw new Error(`Line ${ins.line}: Unknown label '${a}'`);
                ip = labels[a];
                break;

            case 'je':
            case 'jz':
                ip = flags.zf === 1 ? (labels[a] ?? ip + 1) : ip + 1;
                break;

            case 'jne':
            case 'jnz':
                ip = flags.zf === 0 ? (labels[a] ?? ip + 1) : ip + 1;
                break;

            case 'jg':
            case 'jnle':
                ip = (flags.zf === 0 && flags.sf === 0) ? (labels[a] ?? ip + 1) : ip + 1;
                break;

            case 'jge':
            case 'jnl':
                ip = flags.sf === 0 ? (labels[a] ?? ip + 1) : ip + 1;
                break;

            case 'jl':
            case 'jnge':
                ip = flags.sf === 1 ? (labels[a] ?? ip + 1) : ip + 1;
                break;

            case 'jle':
            case 'jng':
                ip = (flags.zf === 1 || flags.sf === 1) ? (labels[a] ?? ip + 1) : ip + 1;
                break;

            case 'loop':
                regs.rcx -= 1;
                touchedRegs.add('rcx');
                ip = regs.rcx !== 0 ? (labels[a] ?? ip + 1) : ip + 1;
                break;

            case 'call':
                if (a === 'printf' || a === '_printf') {
                    // x86-64 System V ABI: rdi = format string address, rsi, rdx, rcx, r8, r9 = args
                    const fmt = readCStringFromMemory(regs.rdi);
                    stdoutBuf += formatCPrintf(fmt, [regs.rsi, regs.rdx, regs.rcx, regs.r8, regs.r9]);
                    ip++;
                } else {
                    if (labels[a] === undefined) throw new Error(`Line ${ins.line}: Unknown procedure '${a}'`);
                    callStack.push(ip + 1);
                    ip = labels[a];
                }
                break;

            case 'ret':
                if (callStack.length === 0) {
                    ip = instructions.length;
                } else {
                    ip = callStack.pop();
                }
                break;

            case 'syscall':
                // Linux x86-64 syscall ABI: rax=1 (sys_write: rdi=fd, rsi=buf, rdx=len), rax=60 (sys_exit)
                if (regs.rax === 1) {
                    const addr = regs.rsi;
                    const len  = regs.rdx;
                    for (let k = 0; k < len && addr + k < memory.length; k++) {
                        stdoutBuf += String.fromCharCode(memory[addr + k]);
                    }
                    ip++;
                } else if (regs.rax === 60) {
                    ip = instructions.length;
                } else {
                    ip++;
                }
                break;

            case 'int':
                // Linux x86 32-bit interrupt 0x80: eax=4 (sys_write: ebx=fd, ecx=buf, edx=len), eax=1 (sys_exit)
                if (regs.rax === 4) {
                    const addr = regs.rcx;
                    const len  = regs.rdx;
                    for (let k = 0; k < len && addr + k < memory.length; k++) {
                        stdoutBuf += String.fromCharCode(memory[addr + k]);
                    }
                } else if (regs.rax === 1) {
                    ip = instructions.length;
                    break;
                }
                ip++;
                break;

            case 'print': {
                // Convenience instruction: `print rax` or `print msg`
                if (symbols[a] !== undefined && memory[symbols[a]] !== 0) {
                    stdoutBuf += readCStringFromMemory(symbols[a]) + '\n';
                } else {
                    stdoutBuf += `${a} = ${readOperand(a)}\n`;
                }
                ip++;
                break;
            }

            default:
                throw new Error(`Line ${ins.line}: Unsupported assembly instruction '${ins.op}'`);
        }
    }

    const outLines = stdoutBuf.length > 0
        ? stdoutBuf.replace(/\n$/, '').split('\n')
        : [];

    // If no stdout was emitted via syscall/printf/print, display the modified registers summary
    if (outLines.length === 0 && touchedRegs.size > 0) {
        const summary = Array.from(touchedRegs)
            .map((r) => `${r}=${regs[r]} (0x${(regs[r] >>> 0).toString(16)})`)
            .join('  ');
        outLines.push(`Registers: ${summary}`);
    }

    return { outLines, regs, flags, touchedRegs, instructions };
}

// Runs a full x86-64 / x86 assembly file string and returns `{ outLines, errLines }`.
async function runAsmFile(codeString) {
    try {
        const result = executeAsmProgram(codeString);
        return { outLines: result.outLines, errLines: [] };
    } catch (err) {
        return { outLines: [], errLines: [String(err.message || err)] };
    }
}

// Evaluates a C or Assembly buffer up to `cursorRow` when pressing `Ctrl+E` inside PseudoVimim.
async function evaluateVimTarget(allLines, cursorRow, language) {
    if (language === 'asm') {
        try {
            const res = executeAsmProgram(allLines.join('\n'), cursorRow);
            const currentLine = stripAsmComment(allLines[cursorRow] || '').trim();
            const insMatch = currentLine.match(/^([A-Za-z]+)\s+([^,]+)/);
            if (insMatch) {
                const firstOp = insMatch[2].trim();
                const reg = ASM_REGISTER_MAP[firstOp.replace(/^%/, '').toLowerCase()];
                if (reg) {
                    return {
                        targetRow: cursorRow,
                        text:      `${reg} = ${res.regs[reg]} (0x${(res.regs[reg] >>> 0).toString(16)})`,
                        isError:   false,
                    };
                }
            }
            const summary = res.outLines.join(' | ') || `rax = ${res.regs.rax}`;
            return { targetRow: cursorRow, text: summary, isError: false };
        } catch (err) {
            return { targetRow: cursorRow, text: String(err.message || err), isError: true };
        }
    }

    // Evaluate C buffer up to cursorRow (or full buffer if cursor is inside `main` / a function)
    try {
        const sliceSource = allLines.slice(0, cursorRow + 1).join('\n');
        let result;
        try {
            const ast = parseCProgram(tokenizeC(preprocessCCode(sliceSource)));
            result = executeCProgram(ast);
        } catch {
            const ast = parseCProgram(tokenizeC(preprocessCCode(allLines.join('\n'))));
            result = executeCProgram(ast);
        }

        const printed = result.outLines.join(' | ');
        if (printed) {
            return { targetRow: cursorRow, text: printed, isError: false };
        }
        if (result.lastExprVal !== undefined) {
            return { targetRow: cursorRow, text: String(result.lastExprVal), isError: false };
        }
        return { targetRow: cursorRow, text: 'ok', isError: false };
    } catch (err) {
        return { targetRow: cursorRow, text: String(err.message || err), isError: true };
    }
}

window.CasmRunner = {
    runCFile,
    runAsmFile,
    evaluateVimTarget,
};

})();
