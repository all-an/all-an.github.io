// pyodide-runner.js — Lazy-loads Pyodide (Python 3 in WebAssembly) and evaluates scripts or inline Vim blocks

(function () {

// CDN URL for the Pyodide distribution
const PYODIDE_CDN_URL   = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
const PYODIDE_SCRIPT_JS = PYODIDE_CDN_URL + 'pyodide.js';

let pyodideInstance = null;
let pyodideLoading  = null;

// Dynamically injects the Pyodide loader script and initializes the Python 3 runtime once.
async function ensurePyodide() {
    if (pyodideInstance) {
        return pyodideInstance;
    }
    if (pyodideLoading) {
        return pyodideLoading;
    }

    pyodideLoading = (async () => {
        if (typeof window.loadPyodide === 'undefined') {
            await new Promise((resolve, reject) => {
                const script   = document.createElement('script');
                script.src     = PYODIDE_SCRIPT_JS;
                script.onload  = resolve;
                script.onerror = () => reject(new Error('Failed to load Pyodide from CDN'));
                document.head.appendChild(script);
            });
        }
        pyodideInstance = await window.loadPyodide({ indexURL: PYODIDE_CDN_URL });
        return pyodideInstance;
    })();

    try {
        return await pyodideLoading;
    } catch (err) {
        pyodideLoading = null;
        throw err;
    }
}

// Runs a full Python 3 script string and returns its captured stdout and stderr lines.
async function runPythonFile(codeString) {
    const pyodide = await ensurePyodide();
    const outLines = [];
    const errLines = [];

    pyodide.setStdout({ batched: (line) => outLines.push(line) });
    pyodide.setStderr({ batched: (line) => errLines.push(line) });

    try {
        await pyodide.runPythonAsync(codeString);
    } catch (err) {
        // Extract the final readable exception line from the Python traceback
        const msgLines = String(err.message || err).trim().split('\n');
        errLines.push(msgLines[msgLines.length - 1]);
    }

    return { outLines, errLines };
}

// Evaluates a target line or function block in PseudoVimim (`Ctrl+E`) using the buffer lines
// up to that point for context, returning the target row index and formatted inline result.
async function evaluateVimTarget(allLines, cursorRow) {
    const pyodide = await ensurePyodide();

    // Pass buffer lines and 0-indexed cursor row into Python's AST inspector
    pyodide.globals.set('_vim_lines', pyodide.toPy(allLines));
    pyodide.globals.set('_vim_row', cursorRow);

    const helperCode = `
import ast, io, sys, inspect

def _eval_vim_line(lines, row):
    if not lines or row < 0 or row >= len(lines):
        return (row, "", False)

    # Determine if cursorRow is inside or on a multi-line block (such as a def function)
    full_source = "\\n".join(lines)
    target_lineno = row + 1  # 1-indexed for ast

    # Try parsing the full buffer; if lines below the cursor have incomplete syntax,
    # fall back to parsing up to the end of the current indented block.
    tree = None
    for end_idx in range(len(lines), row, -1):
        try:
            tree = ast.parse("\\n".join(lines[:end_idx]))
            break
        except SyntaxError:
            continue

    if tree is None:
        try:
            ast.parse(lines[row])
        except SyntaxError as e:
            return (row, f"SyntaxError: {e.msg}", True)
        return (row, "SyntaxError in buffer", True)

    # Find the top-level AST statement containing target_lineno
    target_node = None
    for node in tree.body:
        start = getattr(node, 'lineno', 0)
        end   = getattr(node, 'end_lineno', start)
        if start <= target_lineno <= end:
            target_node = node
            break

    if target_node is None:
        return (row, "", False)

    display_row = getattr(target_node, 'end_lineno', target_lineno) - 1
    ns = {}

    # Execute all preceding top-level statements silently so definitions/variables are in scope
    for node in tree.body:
        if node is target_node:
            break
        try:
            mod = ast.Module(body=[node], type_ignores=[])
            exec(compile(mod, "<vim>", "exec"), ns)
        except Exception:
            pass

    # Now evaluate or execute target_node while capturing stdout
    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf
    try:
        if isinstance(target_node, ast.Expr):
            expr_ast = ast.Expression(body=target_node.value)
            val = eval(compile(expr_ast, "<vim>", "eval"), ns)
            printed = buf.getvalue().strip()
            if printed and val is None:
                return (display_row, printed.replace("\\n", " | "), False)
            elif printed and val is not None:
                return (display_row, f"{printed.replace(chr(10), ' | ')} => {repr(val)}", False)
            elif val is not None:
                return (display_row, repr(val), False)
            else:
                return (display_row, "None", False)

        elif isinstance(target_node, (ast.Assign, ast.AugAssign, ast.AnnAssign)):
            mod = ast.Module(body=[target_node], type_ignores=[])
            exec(compile(mod, "<vim>", "exec"), ns)
            printed = buf.getvalue().strip()
            target_name = None
            if isinstance(target_node, ast.Assign) and isinstance(target_node.targets[0], ast.Name):
                target_name = target_node.targets[0].id
            elif isinstance(target_node, (ast.AugAssign, ast.AnnAssign)) and isinstance(target_node.target, ast.Name):
                target_name = target_node.target.id
            if target_name and target_name in ns:
                return (display_row, f"{target_name} = {repr(ns[target_name])}", False)
            return (display_row, printed or "ok", False)

        elif isinstance(target_node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            mod = ast.Module(body=[target_node], type_ignores=[])
            exec(compile(mod, "<vim>", "exec"), ns)
            fn = ns.get(target_node.name)
            if callable(fn):
                sig = inspect.signature(fn)
                required = [
                    p for p in sig.parameters.values()
                    if p.default is inspect.Parameter.empty
                    and p.kind in (inspect.Parameter.POSITIONAL_ONLY, inspect.Parameter.POSITIONAL_OR_KEYWORD)
                ]
                if len(required) == 0:
                    val = fn()
                    printed = buf.getvalue().strip()
                    if printed and val is None:
                        return (display_row, printed.replace("\\n", " | "), False)
                    elif printed and val is not None:
                        return (display_row, f"{printed.replace(chr(10), ' | ')} => {repr(val)}", False)
                    return (display_row, repr(val), False)
                else:
                    params = ", ".join(sig.parameters.keys())
                    # Check if a later top-level expression calls this function; if so, show its result at the end of the function
                    for later in tree.body:
                        if getattr(later, 'lineno', 0) > end and isinstance(later, ast.Expr) and isinstance(later.value, ast.Call):
                            callee = later.value.func
                            if isinstance(callee, ast.Name) and callee.id == target_node.name:
                                expr_ast = ast.Expression(body=later.value)
                                val = eval(compile(expr_ast, "<vim>", "eval"), ns)
                                printed = buf.getvalue().strip()
                                if printed and val is not None:
                                    return (display_row, f"{printed.replace(chr(10), ' | ')} => {repr(val)}", False)
                                elif printed:
                                    return (display_row, printed.replace("\\n", " | "), False)
                                return (display_row, repr(val), False)
                    return (display_row, f"def {target_node.name}({params}) ready", False)
            return (display_row, f"def {target_node.name} ready", False)

        else:
            mod = ast.Module(body=[target_node], type_ignores=[])
            exec(compile(mod, "<vim>", "exec"), ns)
            printed = buf.getvalue().strip()
            return (display_row, printed.replace("\\n", " | ") if printed else "ok", False)
    except Exception as e:
        return (display_row, f"{type(e).__name__}: {e}", True)
    finally:
        sys.stdout = old_stdout

_eval_vim_line(_vim_lines, _vim_row)
`;

    const pyResult = await pyodide.runPythonAsync(helperCode);
    const [targetRow, text, isError] = pyResult.toJs();
    pyResult.destroy();
    return { targetRow, text, isError };
}

window.PyodideRunner = {
    ensurePyodide,
    runPythonFile,
    evaluateVimTarget,
};

})();
