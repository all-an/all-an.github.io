// java-runner.js — In-browser Java programming language interpreter for the terminal and PseudoVimim

(function () {

// Maximum number of AST steps evaluated per execution to prevent infinite loops
const MAX_EXECUTION_STEPS = 100000;

// Java type and modifier keywords recognized by the parser
const JAVA_MODIFIERS = new Set([
    'public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'default',
]);

const JAVA_TYPE_KEYWORDS = new Set([
    'void', 'boolean', 'byte', 'short', 'int', 'long', 'float', 'double', 'char',
    'var', 'String', 'Object', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character',
    'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet',
]);

// Strips single-line `//` and multi-line `/* ... */` comments while preserving line numbers.
function stripJavaComments(rawSource) {
    const withoutBlock = rawSource.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));

    return withoutBlock
        .split('\n')
        .map((line) => {
            let inStr = false;
            let quote = '';
            for (let i = 0; i < line.length; i++) {
                const ch = line[i];
                if (inStr) {
                    if (ch === '\\') {
                        i++;
                        continue;
                    }
                    if (ch === quote) {
                        inStr = false;
                    }
                } else if (ch === '"' || ch === '\'') {
                    inStr = true;
                    quote = ch;
                } else if (ch === '/' && line[i + 1] === '/') {
                    return line.slice(0, i);
                }
            }
            return line;
        })
        .join('\n');
}

// Tokenizes Java source code into a flat stream of lexical tokens with 1-based line numbers.
function tokenizeJava(source) {
    const tokens = [];
    let i    = 0;
    let line = 1;

    const multiCharOps = [
        '>>>=', '<<=', '>>=', '>>>',
        '++', '--', '==', '!=', '<=', '>=', '&&', '||',
        '<<', '>>', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '->', '::',
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

        // Skip Java annotations such as `@Override` or `@SuppressWarnings(...)`
        if (ch === '@') {
            i++;
            while (i < source.length && /\w/.test(source[i])) i++;
            if (source[i] === '(') {
                let depth = 1;
                i++;
                while (i < source.length && depth > 0) {
                    if (source[i] === '(') depth++;
                    else if (source[i] === ')') depth--;
                    if (source[i] === '\n') line++;
                    i++;
                }
            }
            continue;
        }

        // String literal "..." (including Java text blocks """...""")
        if (ch === '"') {
            if (source.startsWith('"""', i)) {
                i += 3;
                let str = '';
                while (i < source.length && !source.startsWith('"""', i)) {
                    if (source[i] === '\n') line++;
                    str += source[i++];
                }
                i += 3;
                tokens.push({ type: 'STRING', value: str.replace(/^\n/, ''), line });
                continue;
            }
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
                    if (source[i] === '\n') line++;
                    str += source[i++];
                }
            }
            i++; // skip closing quote
            tokens.push({ type: 'STRING', value: str, line });
            continue;
        }

        // Character literal 'a'
        if (ch === '\'') {
            let charStr = '';
            i++;
            if (source[i] === '\\' && i + 1 < source.length) {
                const esc = source[i + 1];
                if (esc === 'n') charStr = '\n';
                else if (esc === 't') charStr = '\t';
                else if (esc === '0') charStr = '\0';
                else charStr = esc;
                i += 2;
            } else if (i < source.length) {
                charStr = source[i++];
            }
            if (source[i] === '\'') i++;
            tokens.push({ type: 'CHAR', value: charStr, line });
            continue;
        }

        // Numeric literal (hex `0x`, binary `0b`, integer, or float; underscores allowed)
        if (/\d/.test(ch)) {
            let numStr = '';
            if (ch === '0' && (source[i + 1] === 'x' || source[i + 1] === 'X')) {
                i += 2;
                while (i < source.length && /[0-9a-fA-F_]/.test(source[i])) {
                    if (source[i] !== '_') numStr += source[i];
                    i++;
                }
                if (/[lL]/.test(source[i] || '')) i++;
                tokens.push({ type: 'NUMBER', value: parseInt(numStr || '0', 16), line });
                continue;
            }
            if (ch === '0' && (source[i + 1] === 'b' || source[i + 1] === 'B')) {
                i += 2;
                while (i < source.length && /[01_]/.test(source[i])) {
                    if (source[i] !== '_') numStr += source[i];
                    i++;
                }
                if (/[lL]/.test(source[i] || '')) i++;
                tokens.push({ type: 'NUMBER', value: parseInt(numStr || '0', 2), line });
                continue;
            }

            let isFloat = false;
            while (i < source.length && (/\d/.test(source[i]) || source[i] === '.' || source[i] === '_')) {
                if (source[i] === '_') {
                    i++;
                    continue;
                }
                if (source[i] === '.') isFloat = true;
                numStr += source[i++];
            }
            while (i < source.length && /[lLfFdD]/.test(source[i])) i++;
            tokens.push({
                type:  'NUMBER',
                value: isFloat ? parseFloat(numStr) : parseInt(numStr, 10),
                line,
            });
            continue;
        }

        // Identifier or keyword
        if (/[A-Za-z_$]/.test(ch)) {
            let ident = '';
            while (i < source.length && /[\w$]/.test(source[i])) {
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

// Parses a Java token stream into an AST containing classes, methods, fields, and top-level statements.
function parseJavaProgram(tokens) {
    let pos = 0;
    const knownClassNames = new Set();

    // First pass: collect declared class and record names so constructor/type checks recognize them
    for (let k = 0; k < tokens.length - 1; k++) {
        if (tokens[k].type === 'IDENT' && (tokens[k].value === 'class' || tokens[k].value === 'record' || tokens[k].value === 'enum')) {
            if (tokens[k + 1].type === 'IDENT') {
                knownClassNames.add(tokens[k + 1].value);
            }
        }
    }

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

    function matchIdent(val) {
        if (peek().type === 'IDENT' && peek().value === val) {
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

    function skipModifiers() {
        while (peek().type === 'IDENT' && JAVA_MODIFIERS.has(peek().value)) {
            next();
        }
    }

    // Skips generic type arguments `<...>` if present after a type name.
    function skipGenerics() {
        if (peek().type === 'OP' && peek().value === '<') {
            let depth = 1;
            next();
            while (peek().type !== 'EOF' && depth > 0) {
                const v = next().value;
                if (v === '<') depth++;
                else if (v === '>') depth--;
                else if (v === '>>') depth -= 2;
            }
        }
    }

    // Checks whether the token at `pos` starts a Java type specifier (`int`, `String[]`, `List<Integer>`, custom class).
    function isTypeStart() {
        let idx = pos;
        while (idx < tokens.length && tokens[idx].type === 'IDENT' && JAVA_MODIFIERS.has(tokens[idx].value)) {
            idx++;
        }
        const tok = tokens[idx];
        if (!tok || tok.type !== 'IDENT') return false;
        if (JAVA_TYPE_KEYWORDS.has(tok.value) || knownClassNames.has(tok.value)) {
            return true;
        }
        // Heuristic: Uppercase identifier followed by another identifier, `[]`, or `<` is a type declaration
        if (/^[A-Z]/.test(tok.value)) {
            const after = tokens[idx + 1];
            if (!after) return false;
            if (after.type === 'IDENT') return true;
            if (after.type === 'OP' && (after.value === '[' || after.value === '<')) {
                // Make sure `ClassName[expr]` array indexing is only treated as a type if `[]` is empty
                if (after.value === '[' && tokens[idx + 2] && tokens[idx + 2].value === ']') return true;
                if (after.value === '<') return true;
            }
        }
        return false;
    }

    // Consumes a full Java type specifier including generics `<T>` and array brackets `[]`.
    function parseTypeSpecifier() {
        skipModifiers();
        const baseTok = next();
        let typeName  = baseTok.value;
        skipGenerics();
        while (peek().type === 'OP' && peek().value === '[' && peek(1).value === ']') {
            next();
            next();
            typeName += '[]';
        }
        // Varargs `String...`
        if (matchOp('.') && matchOp('.') && matchOp('.')) {
            typeName += '[]';
        }
        return typeName;
    }

    // Parses a method parameter list `(int a, String[] args)`.
    function parseParamList() {
        expectOp('(');
        const params = [];
        if (!matchOp(')')) {
            do {
                const pType = parseTypeSpecifier();
                const pName = next().value;
                while (matchOp('[') && matchOp(']')) { /* trailing C-style array brackets */ }
                params.push({ name: pName, type: pType });
            } while (matchOp(','));
            expectOp(')');
        }
        return params;
    }

    // Skips optional `throws ExceptionA, ExceptionB` clause before a method body.
    function skipThrowsClause() {
        if (matchIdent('throws')) {
            do {
                next();
            } while (matchOp(','));
        }
    }

    // Parses a statement inside a method or top-level block.
    function parseStatement() {
        const tok = peek();

        if (matchOp('{')) {
            const body = [];
            while (!matchOp('}') && peek().type !== 'EOF') {
                body.push(parseStatement());
            }
            return { kind: 'Block', body, line: tok.line };
        }

        if (matchIdent('if')) {
            expectOp('(');
            const cond = parseExpression();
            expectOp(')');
            const thenBranch = parseStatement();
            let elseBranch = null;
            if (matchIdent('else')) {
                elseBranch = parseStatement();
            }
            return { kind: 'If', cond, thenBranch, elseBranch, line: tok.line };
        }

        if (matchIdent('while')) {
            expectOp('(');
            const cond = parseExpression();
            expectOp(')');
            const body = parseStatement();
            return { kind: 'While', cond, body, line: tok.line };
        }

        if (matchIdent('do')) {
            const body = parseStatement();
            matchIdent('while');
            expectOp('(');
            const cond = parseExpression();
            expectOp(')');
            matchOp(';');
            return { kind: 'DoWhile', cond, body, line: tok.line };
        }

        if (matchIdent('for')) {
            expectOp('(');
            // Check for enhanced `for (Type item : collection)`
            const savedPos = pos;
            if (isTypeStart()) {
                const itemType = parseTypeSpecifier();
                const itemName = next().value;
                if (matchOp(':')) {
                    const iterable = parseExpression();
                    expectOp(')');
                    const body = parseStatement();
                    return { kind: 'ForEach', itemType, itemName, iterable, body, line: tok.line };
                }
            }
            pos = savedPos;

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
            const step = matchOp(')') ? null : (() => {
                const steps = [parseExpression()];
                while (matchOp(',')) steps.push(parseExpression());
                expectOp(')');
                return steps;
            })();
            const body = parseStatement();
            return { kind: 'For', init, cond, step, body, line: tok.line };
        }

        if (matchIdent('switch')) {
            expectOp('(');
            const expr = parseExpression();
            expectOp(')');
            expectOp('{');
            const cases = [];
            let defaultBody = null;

            while (!matchOp('}') && peek().type !== 'EOF') {
                if (matchIdent('case')) {
                    const values = [parseExpression()];
                    while (matchOp(',')) {
                        values.push(parseExpression());
                    }
                    const isArrow = matchOp('->');
                    if (!isArrow) expectOp(':');
                    const body = [];
                    if (isArrow) {
                        body.push(parseStatement());
                        body.push({ kind: 'Break', line: tok.line });
                    } else {
                        while (peek().type !== 'EOF' &&
                               !(peek().type === 'IDENT' && (peek().value === 'case' || peek().value === 'default')) &&
                               !(peek().type === 'OP' && peek().value === '}')) {
                            body.push(parseStatement());
                        }
                    }
                    cases.push({ values, body });
                } else if (matchIdent('default')) {
                    const isArrow = matchOp('->');
                    if (!isArrow) expectOp(':');
                    const body = [];
                    if (isArrow) {
                        body.push(parseStatement());
                    } else {
                        while (peek().type !== 'EOF' &&
                               !(peek().type === 'IDENT' && (peek().value === 'case' || peek().value === 'default')) &&
                               !(peek().type === 'OP' && peek().value === '}')) {
                            body.push(parseStatement());
                        }
                    }
                    defaultBody = body;
                } else {
                    next();
                }
            }
            return { kind: 'Switch', expr, cases, defaultBody, line: tok.line };
        }

        if (matchIdent('try')) {
            const tryBlock = parseStatement();
            let catchVar   = null;
            let catchBlock = null;
            let finallyBlock = null;
            if (matchIdent('catch')) {
                expectOp('(');
                parseTypeSpecifier();
                while (matchOp('|')) parseTypeSpecifier();
                catchVar = next().value;
                expectOp(')');
                catchBlock = parseStatement();
            }
            if (matchIdent('finally')) {
                finallyBlock = parseStatement();
            }
            return { kind: 'Try', tryBlock, catchVar, catchBlock, finallyBlock, line: tok.line };
        }

        if (matchIdent('throw')) {
            const expr = parseExpression();
            expectOp(';');
            return { kind: 'Throw', expr, line: tok.line };
        }

        if (matchIdent('return')) {
            const expr = matchOp(';') ? null : (() => { const e = parseExpression(); expectOp(';'); return e; })();
            return { kind: 'Return', expr, line: tok.line };
        }

        if (matchIdent('break')) {
            expectOp(';');
            return { kind: 'Break', line: tok.line };
        }

        if (matchIdent('continue')) {
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

    // Parses a local or field variable declaration (`int a = 1, b = 2;`).
    function parseVarDeclaration() {
        const line     = peek().line;
        const baseType = parseTypeSpecifier();
        const decls    = [];

        do {
            const nameTok = next();
            if (nameTok.type !== 'IDENT') {
                throw new Error(`Line ${nameTok.line}: Expected variable name, found '${nameTok.value}'`);
            }
            while (matchOp('[') && matchOp(']')) { /* trailing array brackets */ }

            let init = null;
            if (matchOp('=')) {
                if (matchOp('{')) {
                    const items = [];
                    if (!matchOp('}')) {
                        do {
                            if (peek().value === '}') break;
                            items.push(parseExpression());
                        } while (matchOp(','));
                        expectOp('}');
                    }
                    init = { kind: 'ArrayLiteral', items, line };
                } else {
                    init = parseExpression();
                }
            }
            decls.push({ name: nameTok.value, baseType, init });
        } while (matchOp(','));

        expectOp(';');
        return { kind: 'VarDecl', decls, line };
    }

    // ── Expression precedence hierarchy ───────────────────────────────────────

    function parseExpression() {
        return parseAssignment();
    }

    function parseAssignment() {
        const left = parseTernary();
        const tok  = peek();
        const assignOps = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>=']);
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
        while (true) {
            if (peek().type === 'OP' && ['<', '<=', '>', '>='].includes(peek().value)) {
                const op = next().value;
                left = { kind: 'Binary', op, left, right: parseShift(), line: left.line };
            } else if (matchIdent('instanceof')) {
                const typeName = parseTypeSpecifier();
                left = { kind: 'InstanceOf', expr: left, typeName, line: left.line };
            } else {
                break;
            }
        }
        return left;
    }

    function parseShift() {
        let left = parseAdditive();
        while (peek().type === 'OP' && ['<<', '>>', '>>>'].includes(peek().value)) {
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
        if (tok.type === 'OP' && ['+', '-', '!', '~', '++', '--'].includes(tok.value)) {
            const op = next().value;
            return { kind: 'Unary', op, expr: parseUnary(), prefix: true, line: tok.line };
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
            } else if (matchOp('.')) {
                const prop = next().value;
                if (matchOp('(')) {
                    const args = [];
                    if (!matchOp(')')) {
                        do {
                            args.push(parseExpression());
                        } while (matchOp(','));
                        expectOp(')');
                    }
                    expr = { kind: 'MethodCall', target: expr, method: prop, args, line: expr.line };
                } else {
                    expr = { kind: 'Member', target: expr, property: prop, line: expr.line };
                }
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

        // Grouping `(expr)` or type cast `(int) x`
        if (matchOp('(')) {
            if (isTypeStart() && peek(1).type === 'OP' && peek(1).value === ')') {
                const targetType = parseTypeSpecifier();
                expectOp(')');
                return { kind: 'Cast', targetType, expr: parseUnary(), line: tok.line };
            }
            const expr = parseExpression();
            expectOp(')');
            return expr;
        }

        // `new Type(...)` or `new Type[size]` or `new Type[]{...}`
        if (matchIdent('new')) {
            const typeTok = next();
            const typeName = typeTok.value;
            skipGenerics();

            // Array allocation `new int[5]` or `new int[]{1, 2, 3}`
            if (matchOp('[')) {
                if (matchOp(']')) {
                    while (matchOp('[') && matchOp(']')) { /* multi-dim */ }
                    expectOp('{');
                    const items = [];
                    if (!matchOp('}')) {
                        do {
                            if (peek().value === '}') break;
                            items.push(parseExpression());
                        } while (matchOp(','));
                        expectOp('}');
                    }
                    return { kind: 'ArrayLiteral', items, line: tok.line };
                }
                const sizeExpr = parseExpression();
                expectOp(']');
                return { kind: 'NewArray', typeName, sizeExpr, line: tok.line };
            }

            // Object allocation `new ClassName(arg1, arg2)`
            expectOp('(');
            const args = [];
            if (!matchOp(')')) {
                do {
                    args.push(parseExpression());
                } while (matchOp(','));
                expectOp(')');
            }
            return { kind: 'NewObject', className: typeName, args, line: tok.line };
        }

        if (tok.type === 'NUMBER' || tok.type === 'STRING' || tok.type === 'CHAR') {
            next();
            return { kind: 'Literal', value: tok.value, line: tok.line };
        }

        if (tok.type === 'IDENT') {
            next();
            if (tok.value === 'true') return { kind: 'Literal', value: true, line: tok.line };
            if (tok.value === 'false') return { kind: 'Literal', value: false, line: tok.line };
            if (tok.value === 'null') return { kind: 'Literal', value: null, line: tok.line };
            return { kind: 'Var', name: tok.value, line: tok.line };
        }

        throw new Error(`Line ${tok.line}: Unexpected token '${tok.value || tok.type}'`);
    }

    // Parses a `class Name { ... }` or `record Name(int x, int y) { ... }` declaration.
    function parseClassOrRecord() {
        skipModifiers();
        if (matchIdent('record')) {
            const nameTok = next();
            const params  = parseParamList();
            expectOp('{');
            const methods = {};
            while (!matchOp('}') && peek().type !== 'EOF') {
                skipModifiers();
                if (peek().type === 'IDENT' && peek().value === nameTok.value && peek(1).value === '{') {
                    // Compact canonical constructor
                    next();
                    parseStatement();
                    continue;
                }
                const retType = parseTypeSpecifier();
                const mName   = next().value;
                const mParams = parseParamList();
                skipThrowsClause();
                const body    = parseStatement();
                methods[mName] = { name: mName, returnType: retType, params: mParams, body };
            }
            return {
                kind:         'ClassDef',
                name:         nameTok.value,
                isRecord:     true,
                recordFields: params,
                fields:       [],
                constructors: [],
                methods,
                line:         nameTok.line,
            };
        }

        expectIdentOrClass();
        const className = next().value;
        skipGenerics();
        if (matchIdent('extends')) {
            parseTypeSpecifier();
        }
        if (matchIdent('implements')) {
            do {
                parseTypeSpecifier();
            } while (matchOp(','));
        }

        expectOp('{');
        const fields       = [];
        const constructors = [];
        const methods      = {};

        while (!matchOp('}') && peek().type !== 'EOF') {
            if (matchOp(';')) continue;
            skipModifiers();

            // Nested class or record
            if (peek().type === 'IDENT' && (peek().value === 'class' || peek().value === 'record')) {
                const nested = parseClassOrRecord();
                classes[nested.name] = nested;
                continue;
            }

            // Constructor `ClassName(...) { ... }`
            if (peek().type === 'IDENT' && peek().value === className && peek(1).type === 'OP' && peek(1).value === '(') {
                next();
                const cParams = parseParamList();
                skipThrowsClause();
                const cBody   = parseStatement();
                constructors.push({ params: cParams, body: cBody });
                continue;
            }

            // Method or field
            const memberType = parseTypeSpecifier();
            const memberName = next().value;

            if (peek().type === 'OP' && peek().value === '(') {
                const mParams = parseParamList();
                skipThrowsClause();
                const mBody   = matchOp(';') ? { kind: 'Block', body: [], line: peek().line } : parseStatement();
                methods[memberName] = { name: memberName, returnType: memberType, params: mParams, body: mBody };
            } else {
                // Field declaration
                let init = null;
                while (matchOp('[') && matchOp(']')) { /* trailing array brackets */ }
                if (matchOp('=')) {
                    if (matchOp('{')) {
                        const items = [];
                        if (!matchOp('}')) {
                            do {
                                if (peek().value === '}') break;
                                items.push(parseExpression());
                            } while (matchOp(','));
                            expectOp('}');
                        }
                        init = { kind: 'ArrayLiteral', items, line: peek().line };
                    } else {
                        init = parseExpression();
                    }
                }
                fields.push({ name: memberName, type: memberType, init });
                while (matchOp(',')) {
                    const nextField = next().value;
                    let nextInit = null;
                    if (matchOp('=')) nextInit = parseExpression();
                    fields.push({ name: nextField, type: memberType, init: nextInit });
                }
                expectOp(';');
            }
        }

        return {
            kind:         'ClassDef',
            name:         className,
            isRecord:     false,
            recordFields: [],
            fields,
            constructors,
            methods,
        };
    }

    function expectIdentOrClass() {
        if (peek().type === 'IDENT' && (peek().value === 'class' || peek().value === 'interface' || peek().value === 'enum')) {
            return next();
        }
        throw new Error(`Line ${peek().line}: Expected 'class', found '${peek().value}'`);
    }

    const classes       = {};
    const topMethods    = {};
    const topStatements = [];

    while (peek().type !== 'EOF') {
        // Ignore top-level `package ...;` and `import ...;`
        if (matchIdent('package') || matchIdent('import')) {
            while (peek().type !== 'EOF' && !matchOp(';')) {
                next();
            }
            continue;
        }

        const savedPos = pos;
        skipModifiers();
        if (peek().type === 'IDENT' && (peek().value === 'class' || peek().value === 'record')) {
            pos = savedPos;
            const cls = parseClassOrRecord();
            classes[cls.name] = cls;
            continue;
        }
        pos = savedPos;

        // Check for top-level / compact Java 21+ method `void main() { ... }` or `int add(int a, int b) { ... }`
        if (isTypeStart()) {
            const methodCheckPos = pos;
            const retType = parseTypeSpecifier();
            if (peek().type === 'IDENT' && peek(1).type === 'OP' && peek(1).value === '(') {
                const mName   = next().value;
                const mParams = parseParamList();
                skipThrowsClause();
                if (peek().type === 'OP' && peek().value === '{') {
                    const mBody = parseStatement();
                    topMethods[mName] = { name: mName, returnType: retType, params: mParams, body: mBody };
                    continue;
                }
            }
            pos = methodCheckPos;
        }

        topStatements.push(parseStatement());
    }

    return { classes, topMethods, topStatements };
}

// Formats a Java value into its standard `String.valueOf` representation.
function formatJavaValue(val) {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (Array.isArray(val)) return `[${val.map(formatJavaValue).join(', ')}]`;
    if (val instanceof Map) {
        const entries = [];
        for (const [k, v] of val.entries()) {
            entries.push(`${formatJavaValue(k)}=${formatJavaValue(v)}`);
        }
        return `{${entries.join(', ')}}`;
    }
    if (typeof val === 'object' && val.__class) {
        if (val.__isRecord) {
            const parts = Object.entries(val)
                .filter(([k]) => !k.startsWith('__'))
                .map(([k, v]) => `${k}=${formatJavaValue(v)}`);
            return `${val.__class}[${parts.join(', ')}]`;
        }
        return `${val.__class}@1`;
    }
    return String(val);
}

// Formats a `System.out.printf` or `String.format` string with arguments.
function formatJavaPrintf(fmtStr, args) {
    let argIdx = 0;
    return String(fmtStr).replace(/%(-?\d*(?:\.\d+)?)([dfsxXobct%n])/g, (full, spec, conv) => {
        if (conv === '%') return '%';
        if (conv === 'n') return '\n';
        const val = args[argIdx++];
        switch (conv) {
            case 's':
                return formatJavaValue(val);
            case 'b':
                return Boolean(val) ? 'true' : 'false';
            case 'd':
                return String(Math.trunc(Number(val) || 0));
            case 'x':
                return (Math.trunc(Number(val) || 0) >>> 0).toString(16);
            case 'X':
                return (Math.trunc(Number(val) || 0) >>> 0).toString(16).toUpperCase();
            case 'o':
                return (Math.trunc(Number(val) || 0) >>> 0).toString(8);
            case 'f': {
                const num = Number(val) || 0;
                const precMatch = spec.match(/\.(\d+)/);
                const digits = precMatch ? parseInt(precMatch[1], 10) : 6;
                return num.toFixed(digits);
            }
            case 'c':
                return typeof val === 'string' ? val[0] || '' : String.fromCharCode(Number(val) || 0);
            default:
                return formatJavaValue(val);
        }
    });
}

// Returns the default value for an uninitialized Java variable of the given type.
function defaultJavaValue(typeName) {
    if (!typeName) return null;
    if (typeName.endsWith('[]')) return null;
    if (['byte', 'short', 'int', 'long', 'float', 'double'].includes(typeName)) return 0;
    if (typeName === 'boolean') return false;
    if (typeName === 'char') return '\0';
    return null;
}

// Executes a parsed Java AST and returns captured stdout lines and the last evaluated expression.
function executeJavaProgram(ast) {
    let steps       = 0;
    let stdoutBuf   = '';
    let lastExprVal = undefined;

    function tick(line) {
        if (++steps > MAX_EXECUTION_STEPS) {
            throw new Error(`Line ${line}: Execution exceeded ${MAX_EXECUTION_STEPS} steps (infinite loop guard)`);
        }
    }

    function findScope(env, name) {
        for (let s = env.length - 1; s >= 0; s--) {
            if (Object.prototype.hasOwnProperty.call(env[s], name)) {
                return env[s];
            }
        }
        return null;
    }

    // Collects all methods across declared classes and top-level definitions for easy lookup
    const allMethods = { ...ast.topMethods };
    const globalScope = {};
    const rootEnv     = [globalScope];

    for (const cls of Object.values(ast.classes)) {
        Object.assign(allMethods, cls.methods);
        for (const f of cls.fields) {
            globalScope[f.name] = f.init ? evalExpr(f.init, rootEnv) : defaultJavaValue(f.type);
        }
    }

    function applyAssignOp(op, cur, rhs) {
        switch (op) {
            case '=':    return rhs;
            case '+=':   return (typeof cur === 'string' || typeof rhs === 'string')
                ? formatJavaValue(cur) + formatJavaValue(rhs)
                : cur + rhs;
            case '-=':   return cur - rhs;
            case '*=':   return cur * rhs;
            case '/=':   return Number.isInteger(cur) && Number.isInteger(rhs) ? Math.trunc(cur / rhs) : cur / rhs;
            case '%=':   return cur % rhs;
            case '&=':   return cur & rhs;
            case '|=':   return cur | rhs;
            case '^=':   return cur ^ rhs;
            case '<<=':  return cur << rhs;
            case '>>=':  return cur >> rhs;
            case '>>>=': return cur >>> rhs;
            default:     return rhs;
        }
    }

    function evalExpr(node, env) {
        if (!node) return null;
        tick(node.line);

        switch (node.kind) {
            case 'Literal':
                return node.value;

            case 'ArrayLiteral':
                return node.items.map((item) => evalExpr(item, env));

            case 'NewArray': {
                const len = Math.max(0, Math.trunc(Number(evalExpr(node.sizeExpr, env)) || 0));
                const def = defaultJavaValue(node.typeName);
                return Array.from({ length: len }, () => def);
            }

            case 'NewObject': {
                const args = node.args.map((a) => evalExpr(a, env));
                if (node.className === 'ArrayList' || node.className === 'LinkedList') {
                    return Array.isArray(args[0]) ? [...args[0]] : [];
                }
                if (node.className === 'HashMap' || node.className === 'TreeMap' || node.className === 'LinkedHashMap') {
                    return new Map();
                }
                if (node.className === 'StringBuilder') {
                    return { __stringBuilder: true, buf: args[0] !== undefined ? String(args[0]) : '' };
                }
                if (node.className.endsWith('Exception') || node.className.endsWith('Error')) {
                    return new Error(args[0] ? `${node.className}: ${args[0]}` : node.className);
                }

                const cls = ast.classes[node.className];
                if (!cls) {
                    throw new Error(`Line ${node.line}: Unknown class '${node.className}'`);
                }

                const instance = { __class: cls.name, __isRecord: cls.isRecord };
                if (cls.isRecord) {
                    cls.recordFields.forEach((rf, idx) => {
                        instance[rf.name] = args[idx] ?? defaultJavaValue(rf.type);
                    });
                    return instance;
                }

                for (const f of cls.fields) {
                    instance[f.name] = f.init ? evalExpr(f.init, [globalScope]) : defaultJavaValue(f.type);
                }
                const ctor = cls.constructors.find((c) => c.params.length === args.length) || cls.constructors[0];
                if (ctor) {
                    const ctorScope = { this: instance };
                    ctor.params.forEach((p, idx) => {
                        ctorScope[p.name] = args[idx] ?? defaultJavaValue(p.type);
                    });
                    execBlock(ctor.body, [globalScope, instance, ctorScope]);
                }
                return instance;
            }

            case 'Var': {
                if (['System', 'Math', 'Integer', 'Long', 'Double', 'Boolean', 'String', 'Arrays', 'List', 'Collections', 'IO'].includes(node.name)) {
                    return { __staticClass: node.name };
                }
                if (ast.classes[node.name]) {
                    return { __staticClass: node.name };
                }
                const scope = findScope(env, node.name);
                if (scope) return scope[node.name];
                throw new Error(`Line ${node.line}: Cannot find symbol '${node.name}'`);
            }

            case 'Member': {
                const target = evalExpr(node.target, env);
                if (target && target.__staticClass === 'System' && (node.property === 'out' || node.property === 'err')) {
                    return { __systemStream: node.property };
                }
                if (target && target.__staticClass === 'Math') {
                    if (node.property === 'PI') return Math.PI;
                    if (node.property === 'E') return Math.E;
                }
                if (target && target.__staticClass === 'Integer') {
                    if (node.property === 'MAX_VALUE') return 2147483647;
                    if (node.property === 'MIN_VALUE') return -2147483648;
                }
                if (Array.isArray(target) && node.property === 'length') {
                    return target.length;
                }
                if (target && typeof target === 'object' && Object.prototype.hasOwnProperty.call(target, node.property)) {
                    return target[node.property];
                }
                throw new Error(`Line ${node.line}: Cannot access property '${node.property}'`);
            }

            case 'Index': {
                const target = evalExpr(node.target, env);
                const idx    = Math.trunc(Number(evalExpr(node.index, env)) || 0);
                if (!Array.isArray(target)) {
                    throw new Error(`Line ${node.line}: Array required, but found ${typeof target}`);
                }
                if (idx < 0 || idx >= target.length) {
                    throw new Error(`Line ${node.line}: ArrayIndexOutOfBoundsException: Index ${idx} out of bounds for length ${target.length}`);
                }
                return target[idx];
            }

            case 'InstanceOf': {
                const val = evalExpr(node.expr, env);
                if (val === null || val === undefined) return false;
                if (node.typeName === 'String') return typeof val === 'string';
                if (node.typeName === 'Integer' || node.typeName === 'Double') return typeof val === 'number';
                if (val && val.__class) return val.__class === node.typeName;
                return false;
            }

            case 'Cast': {
                const val = evalExpr(node.expr, env);
                if (['int', 'long', 'short', 'byte'].includes(node.targetType)) {
                    if (typeof val === 'string' && val.length === 1) return val.charCodeAt(0);
                    return Math.trunc(Number(val) || 0);
                }
                if (node.targetType === 'double' || node.targetType === 'float') return Number(val) || 0;
                if (node.targetType === 'char') return typeof val === 'number' ? String.fromCharCode(val) : String(val)[0];
                return val;
            }

            case 'Unary': {
                if (node.op === '++' || node.op === '--') {
                    const delta = node.op === '++' ? 1 : -1;
                    if (node.expr.kind === 'Var') {
                        const scope = findScope(env, node.expr.name);
                        if (!scope) throw new Error(`Line ${node.line}: Cannot find symbol '${node.expr.name}'`);
                        const old = Number(scope[node.expr.name]) || 0;
                        scope[node.expr.name] = old + delta;
                        return node.prefix ? scope[node.expr.name] : old;
                    }
                    if (node.expr.kind === 'Index') {
                        const arr = evalExpr(node.expr.target, env);
                        const idx = Math.trunc(Number(evalExpr(node.expr.index, env)) || 0);
                        const old = Number(arr[idx]) || 0;
                        arr[idx]  = old + delta;
                        return node.prefix ? arr[idx] : old;
                    }
                    if (node.expr.kind === 'Member') {
                        const obj = evalExpr(node.expr.target, env);
                        const old = Number(obj[node.expr.property]) || 0;
                        obj[node.expr.property] = old + delta;
                        return node.prefix ? obj[node.expr.property] : old;
                    }
                }
                const val = evalExpr(node.expr, env);
                if (node.op === '-') return -val;
                if (node.op === '+') return +val;
                if (node.op === '!') return !val;
                if (node.op === '~') return ~val;
                return val;
            }

            case 'Binary': {
                if (node.op === '&&') return Boolean(evalExpr(node.left, env)) && Boolean(evalExpr(node.right, env));
                if (node.op === '||') return Boolean(evalExpr(node.left, env)) || Boolean(evalExpr(node.right, env));
                const l = evalExpr(node.left, env);
                const r = evalExpr(node.right, env);

                if (node.op === '+' && (typeof l === 'string' || typeof r === 'string')) {
                    return formatJavaValue(l) + formatJavaValue(r);
                }

                switch (node.op) {
                    case '+':   return l + r;
                    case '-':   return l - r;
                    case '*':   return l * r;
                    case '/':
                        if (r === 0) throw new Error(`Line ${node.line}: ArithmeticException: / by zero`);
                        return Number.isInteger(l) && Number.isInteger(r) ? Math.trunc(l / r) : l / r;
                    case '%':   return l % r;
                    case '==':  return l === r;
                    case '!=':  return l !== r;
                    case '<':   return l < r;
                    case '<=':  return l <= r;
                    case '>':   return l > r;
                    case '>=':  return l >= r;
                    case '&':   return l & r;
                    case '|':   return l | r;
                    case '^':   return l ^ r;
                    case '<<':  return l << r;
                    case '>>':  return l >> r;
                    case '>>>': return l >>> r;
                }
                return 0;
            }

            case 'Ternary':
                return evalExpr(node.cond, env) ? evalExpr(node.thenExpr, env) : evalExpr(node.elseExpr, env);

            case 'Assign': {
                const rhs = evalExpr(node.right, env);
                if (node.left.kind === 'Var') {
                    const scope = findScope(env, node.left.name);
                    if (!scope) throw new Error(`Line ${node.line}: Cannot find symbol '${node.left.name}'`);
                    scope[node.left.name] = applyAssignOp(node.op, scope[node.left.name], rhs);
                    return scope[node.left.name];
                }
                if (node.left.kind === 'Index') {
                    const arr = evalExpr(node.left.target, env);
                    const idx = Math.trunc(Number(evalExpr(node.left.index, env)) || 0);
                    arr[idx]  = applyAssignOp(node.op, arr[idx], rhs);
                    return arr[idx];
                }
                if (node.left.kind === 'Member') {
                    const obj = evalExpr(node.left.target, env);
                    const prop = node.left.property;
                    obj[prop] = applyAssignOp(node.op, obj[prop], rhs);
                    return obj[prop];
                }
                throw new Error(`Line ${node.line}: Invalid assignment target`);
            }

            case 'MethodCall':
                return invokeMethodCall(node, env);

            case 'Call': {
                const args = node.args.map((a) => evalExpr(a, env));
                return invokeNamedMethod(null, node.callee, args, node.line);
            }
        }

        return null;
    }

    // Invokes a method call `target.method(args)` on built-in Java objects, static classes, or user instances.
    function invokeMethodCall(node, env) {
        const target = evalExpr(node.target, env);
        const args   = node.args.map((a) => evalExpr(a, env));
        const m      = node.method;

        if (target === null || target === undefined) {
            throw new Error(`Line ${node.line}: NullPointerException: Cannot invoke "${m}()" on null`);
        }

        // System.out.println / print / printf
        if (target.__systemStream) {
            if (m === 'println') {
                stdoutBuf += (args.length > 0 ? formatJavaValue(args[0]) : '') + '\n';
                return null;
            }
            if (m === 'print') {
                stdoutBuf += args.length > 0 ? formatJavaValue(args[0]) : '';
                return null;
            }
            if (m === 'printf' || m === 'format') {
                stdoutBuf += formatJavaPrintf(args[0] ?? '', args.slice(1));
                return null;
            }
        }

        // Static class calls (`Math.*`, `Integer.*`, `String.*`, `Arrays.*`, `List.*`, `IO.*`)
        if (target.__staticClass) {
            const clsName = target.__staticClass;
            if (clsName === 'IO') {
                if (m === 'println') {
                    stdoutBuf += (args.length > 0 ? formatJavaValue(args[0]) : '') + '\n';
                    return null;
                }
                if (m === 'print') {
                    stdoutBuf += args.length > 0 ? formatJavaValue(args[0]) : '';
                    return null;
                }
            }
            if (clsName === 'Math') {
                const a = Number(args[0]) || 0;
                const b = Number(args[1]) || 0;
                if (m === 'abs') return Math.abs(a);
                if (m === 'max') return Math.max(a, b);
                if (m === 'min') return Math.min(a, b);
                if (m === 'sqrt') return Math.sqrt(a);
                if (m === 'pow') return Math.pow(a, b);
                if (m === 'floor') return Math.floor(a);
                if (m === 'ceil') return Math.ceil(a);
                if (m === 'round') return Math.round(a);
                if (m === 'sin') return Math.sin(a);
                if (m === 'cos') return Math.cos(a);
                if (m === 'random') return Math.random();
            }
            if (clsName === 'Integer' || clsName === 'Long') {
                if (m === 'parseInt' || m === 'parseLong' || m === 'valueOf') return parseInt(String(args[0]), args[1] || 10);
                if (m === 'toString') return Number(args[0]).toString(args[1] || 10);
                if (m === 'toBinaryString') return (Number(args[0]) >>> 0).toString(2);
                if (m === 'toHexString') return (Number(args[0]) >>> 0).toString(16);
                if (m === 'compare') return Number(args[0]) === Number(args[1]) ? 0 : (Number(args[0]) < Number(args[1]) ? -1 : 1);
            }
            if (clsName === 'Double' || clsName === 'Float') {
                if (m === 'parseDouble' || m === 'parseFloat' || m === 'valueOf') return parseFloat(String(args[0]));
            }
            if (clsName === 'String') {
                if (m === 'valueOf') return formatJavaValue(args[0]);
                if (m === 'format') return formatJavaPrintf(args[0] ?? '', args.slice(1));
                if (m === 'join') {
                    const delim = String(args[0] ?? '');
                    const items = Array.isArray(args[1]) ? args[1] : args.slice(1);
                    return items.map(formatJavaValue).join(delim);
                }
            }
            if (clsName === 'Arrays') {
                if (m === 'toString') return formatJavaValue(args[0]);
                if (m === 'sort' && Array.isArray(args[0])) {
                    args[0].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
                    return null;
                }
                if (m === 'asList') return [...args];
                if (m === 'fill' && Array.isArray(args[0])) {
                    args[0].fill(args[1]);
                    return null;
                }
            }
            if (clsName === 'List') {
                if (m === 'of') return [...args];
            }
            if (clsName === 'Collections') {
                if (m === 'sort' && Array.isArray(args[0])) {
                    args[0].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
                    return null;
                }
                if (m === 'reverse' && Array.isArray(args[0])) {
                    args[0].reverse();
                    return null;
                }
            }
            if (ast.classes[clsName] && ast.classes[clsName].methods[m]) {
                return invokeNamedMethod(null, m, args, node.line, ast.classes[clsName].methods[m]);
            }
        }

        // String instance methods
        if (typeof target === 'string') {
            if (m === 'length') return target.length;
            if (m === 'isEmpty') return target.length === 0;
            if (m === 'isBlank') return target.trim().length === 0;
            if (m === 'charAt') return target.charAt(Number(args[0]) || 0);
            if (m === 'substring') return args.length === 1 ? target.substring(Number(args[0])) : target.substring(Number(args[0]), Number(args[1]));
            if (m === 'toUpperCase') return target.toUpperCase();
            if (m === 'toLowerCase') return target.toLowerCase();
            if (m === 'trim' || m === 'strip') return target.trim();
            if (m === 'contains') return target.includes(String(args[0]));
            if (m === 'startsWith') return target.startsWith(String(args[0]));
            if (m === 'endsWith') return target.endsWith(String(args[0]));
            if (m === 'indexOf') return target.indexOf(String(args[0]));
            if (m === 'replace') return target.split(String(args[0])).join(String(args[1]));
            if (m === 'split') return target.split(new RegExp(String(args[0])));
            if (m === 'toCharArray') return target.split('');
            if (m === 'equals') return target === args[0];
            if (m === 'equalsIgnoreCase') return target.toLowerCase() === String(args[0] ?? '').toLowerCase();
            if (m === 'repeat') return target.repeat(Math.max(0, Number(args[0]) || 0));
            if (m === 'formatted') return formatJavaPrintf(target, args);
        }

        // StringBuilder instance methods
        if (target.__stringBuilder) {
            if (m === 'append') {
                target.buf += formatJavaValue(args[0]);
                return target;
            }
            if (m === 'reverse') {
                target.buf = target.buf.split('').reverse().join('');
                return target;
            }
            if (m === 'length') return target.buf.length;
            if (m === 'toString') return target.buf;
        }

        // List / ArrayList instance methods
        if (Array.isArray(target)) {
            if (m === 'size') return target.length;
            if (m === 'isEmpty') return target.length === 0;
            if (m === 'add') {
                if (args.length === 2) target.splice(Number(args[0]), 0, args[1]);
                else target.push(args[0]);
                return true;
            }
            if (m === 'get') return target[Number(args[0])];
            if (m === 'set') {
                const old = target[Number(args[0])];
                target[Number(args[0])] = args[1];
                return old;
            }
            if (m === 'remove') return target.splice(Number(args[0]), 1)[0];
            if (m === 'contains') return target.includes(args[0]);
            if (m === 'clear') {
                target.length = 0;
                return null;
            }
            if (m === 'toString') return formatJavaValue(target);
        }

        // Map / HashMap instance methods
        if (target instanceof Map) {
            if (m === 'put') return target.set(args[0], args[1]);
            if (m === 'get') return target.has(args[0]) ? target.get(args[0]) : null;
            if (m === 'getOrDefault') return target.has(args[0]) ? target.get(args[0]) : args[1];
            if (m === 'containsKey') return target.has(args[0]);
            if (m === 'remove') {
                const old = target.get(args[0]);
                target.delete(args[0]);
                return old;
            }
            if (m === 'size') return target.size;
            if (m === 'isEmpty') return target.size === 0;
            if (m === 'keySet') return Array.from(target.keys());
            if (m === 'values') return Array.from(target.values());
        }

        // User-defined class or record instance
        if (target.__class) {
            if (target.__isRecord && Object.prototype.hasOwnProperty.call(target, m)) {
                return target[m];
            }
            if (m === 'toString' && (!ast.classes[target.__class] || !ast.classes[target.__class].methods.toString)) {
                return formatJavaValue(target);
            }
            const cls = ast.classes[target.__class];
            if (cls && cls.methods[m]) {
                return invokeNamedMethod(target, m, args, node.line, cls.methods[m]);
            }
        }

        throw new Error(`Line ${node.line}: Cannot find method '${m}()'`);
    }

    // Invokes a user-defined Java method or built-in top-level helper (`println`, `print`, `printf`).
    function invokeNamedMethod(instance, name, args, line, explicitMethodDef = null) {
        if (name === 'println') {
            stdoutBuf += (args.length > 0 ? formatJavaValue(args[0]) : '') + '\n';
            return null;
        }
        if (name === 'print') {
            stdoutBuf += args.length > 0 ? formatJavaValue(args[0]) : '';
            return null;
        }
        if (name === 'printf') {
            stdoutBuf += formatJavaPrintf(args[0] ?? '', args.slice(1));
            return null;
        }

        const methodDef = explicitMethodDef || allMethods[name];
        if (!methodDef) {
            throw new Error(`Line ${line}: Cannot find method '${name}()'`);
        }

        const localScope = {};
        if (instance) {
            localScope.this = instance;
        }
        methodDef.params.forEach((p, idx) => {
            localScope[p.name] = args[idx] ?? defaultJavaValue(p.type);
        });

        const callEnv = instance ? [globalScope, instance, localScope] : [globalScope, localScope];
        const res = execBlock(methodDef.body, callEnv);
        if (res && res.type === 'return') {
            return res.value;
        }
        return null;
    }

    function execBlock(blockNode, env) {
        const blockScope = {};
        env.push(blockScope);
        try {
            for (const stmt of blockNode.body) {
                const r = execStmt(stmt, env);
                if (r) return r;
            }
        } finally {
            env.pop();
        }
        return null;
    }

    function execStmt(stmt, env) {
        if (!stmt || stmt.kind === 'Empty') return null;
        tick(stmt.line);

        switch (stmt.kind) {
            case 'Block':
                return execBlock(stmt, env);

            case 'VarDecl': {
                const curScope = env[env.length - 1];
                for (const d of stmt.decls) {
                    const val = d.init ? evalExpr(d.init, env) : defaultJavaValue(d.baseType);
                    curScope[d.name] = val;
                    lastExprVal = val;
                }
                return null;
            }

            case 'If':
                if (evalExpr(stmt.cond, env)) {
                    return execStmt(stmt.thenBranch, env);
                } else if (stmt.elseBranch) {
                    return execStmt(stmt.elseBranch, env);
                }
                return null;

            case 'While':
                while (evalExpr(stmt.cond, env)) {
                    tick(stmt.line);
                    const r = execStmt(stmt.body, env);
                    if (r) {
                        if (r.type === 'break') break;
                        if (r.type === 'continue') continue;
                        return r;
                    }
                }
                return null;

            case 'DoWhile':
                do {
                    tick(stmt.line);
                    const r = execStmt(stmt.body, env);
                    if (r) {
                        if (r.type === 'break') break;
                        if (r.type === 'continue') continue;
                        return r;
                    }
                } while (evalExpr(stmt.cond, env));
                return null;

            case 'For': {
                env.push({});
                try {
                    if (stmt.init) {
                        if (stmt.init.kind === 'VarDecl') execStmt(stmt.init, env);
                        else evalExpr(stmt.init, env);
                    }
                    while (!stmt.cond || evalExpr(stmt.cond, env)) {
                        tick(stmt.line);
                        const r = execStmt(stmt.body, env);
                        if (r) {
                            if (r.type === 'break') break;
                            if (r.type === 'continue') {
                                if (stmt.step) stmt.step.forEach((s) => evalExpr(s, env));
                                continue;
                            }
                            return r;
                        }
                        if (stmt.step) {
                            stmt.step.forEach((s) => evalExpr(s, env));
                        }
                    }
                } finally {
                    env.pop();
                }
                return null;
            }

            case 'ForEach': {
                const items = evalExpr(stmt.iterable, env);
                if (!Array.isArray(items)) {
                    throw new Error(`Line ${stmt.line}: for-each not applicable to non-iterable`);
                }
                const loopScope = {};
                env.push(loopScope);
                try {
                    for (const item of items) {
                        tick(stmt.line);
                        loopScope[stmt.itemName] = item;
                        const r = execStmt(stmt.body, env);
                        if (r) {
                            if (r.type === 'break') break;
                            if (r.type === 'continue') continue;
                            return r;
                        }
                    }
                } finally {
                    env.pop();
                }
                return null;
            }

            case 'Switch': {
                const targetVal = evalExpr(stmt.expr, env);
                let matched = false;
                for (const c of stmt.cases) {
                    if (matched || c.values.some((v) => evalExpr(v, env) === targetVal)) {
                        matched = true;
                        for (const s of c.body) {
                            const r = execStmt(s, env);
                            if (r) {
                                if (r.type === 'break') return null;
                                return r;
                            }
                        }
                    }
                }
                if (!matched && stmt.defaultBody) {
                    for (const s of stmt.defaultBody) {
                        const r = execStmt(s, env);
                        if (r) {
                            if (r.type === 'break') return null;
                            return r;
                        }
                    }
                }
                return null;
            }

            case 'Try':
                try {
                    return execStmt(stmt.tryBlock, env);
                } catch (err) {
                    if (stmt.catchBlock) {
                        const catchScope = {};
                        if (stmt.catchVar) {
                            catchScope[stmt.catchVar] = err.message || String(err);
                        }
                        env.push(catchScope);
                        try {
                            return execStmt(stmt.catchBlock, env);
                        } finally {
                            env.pop();
                        }
                    }
                    throw err;
                } finally {
                    if (stmt.finallyBlock) {
                        execStmt(stmt.finallyBlock, env);
                    }
                }

            case 'Throw': {
                const errVal = evalExpr(stmt.expr, env);
                if (errVal instanceof Error) throw errVal;
                throw new Error(formatJavaValue(errVal));
            }

            case 'Return':
                return { type: 'return', value: stmt.expr ? evalExpr(stmt.expr, env) : null };

            case 'Break':
                return { type: 'break' };

            case 'Continue':
                return { type: 'continue' };

            case 'ExprStmt':
                lastExprVal = evalExpr(stmt.expr, env);
                return null;
        }

        return null;
    }

    // Execute any top-level statements first
    for (const stmt of ast.topStatements) {
        execStmt(stmt, rootEnv);
    }

    // Invoke `main` if defined on any class or at the top level
    if (allMethods.main) {
        invokeNamedMethod(null, 'main', [[]], allMethods.main.body.line || 1, allMethods.main);
    }

    const outLines = stdoutBuf.length > 0
        ? stdoutBuf.replace(/\n$/, '').split('\n')
        : [];

    return { outLines, lastExprVal, globalScope };
}

// Runs a complete Java source file string and returns `{ outLines, errLines }`.
async function runJavaFile(codeString) {
    try {
        const cleaned = stripJavaComments(codeString);
        const tokens  = tokenizeJava(cleaned);
        const ast     = parseJavaProgram(tokens);
        const result  = executeJavaProgram(ast);
        return { outLines: result.outLines, errLines: [] };
    } catch (err) {
        return { outLines: [], errLines: [String(err.message || err)] };
    }
}

// Evaluates a Java buffer on `Ctrl+E` inside PseudoVimim.
async function evaluateVimTarget(allLines, cursorRow) {
    try {
        const fullSource = allLines.join('\n');
        let result;
        try {
            const ast = parseJavaProgram(tokenizeJava(stripJavaComments(fullSource)));
            result = executeJavaProgram(ast);
        } catch (fullErr) {
            const sliceSource = allLines.slice(0, cursorRow + 1).join('\n');
            try {
                const ast = parseJavaProgram(tokenizeJava(stripJavaComments(sliceSource)));
                result = executeJavaProgram(ast);
            } catch {
                throw fullErr;
            }
        }

        const printed = result.outLines.join(' | ');
        if (printed) {
            return { targetRow: cursorRow, text: printed, isError: false };
        }
        if (result.lastExprVal !== undefined && result.lastExprVal !== null) {
            return { targetRow: cursorRow, text: formatJavaValue(result.lastExprVal), isError: false };
        }
        return { targetRow: cursorRow, text: 'ok', isError: false };
    } catch (err) {
        return { targetRow: cursorRow, text: String(err.message || err), isError: true };
    }
}

window.JavaRunner = {
    runJavaFile,
    evaluateVimTarget,
};

})();
