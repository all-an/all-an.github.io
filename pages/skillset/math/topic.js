// Shared runtime for every math topic page (NNN-topic/index.html).
//
// A topic's own script.js defines one object and hands it to initTopic():
//
//   const TOPIC = { demo: { type: '...', ... }, exercises: [ { fn, title, prompt, starter, solution, tests } ] };
//   initTopic(TOPIC);
//
// Two things are built from it:
//   1. The interactive demo, in <div id="demo">. Types: counter, calc, numberline,
//      plot, sequence, bars, truth, dots, or custom (the topic supplies its own run()).
//      Formulas in a demo are plain JavaScript expressions written as strings;
//      they are compiled once against the demo's input names plus the helpers below.
//   2. The JavaScript exercises, in <div id="exercises">: each asks the learner
//      to write a function, which is executed against fixed test cases and graded.

// ----------------------------------------------------------------------------
// Expression helpers
// ----------------------------------------------------------------------------

// Math members a demo expression can use directly, e.g. "sqrt(a*a + b*b)".
const MATH_NAMES = [
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sqrt', 'cbrt', 'abs', 'pow', 'exp',
  'log', 'log2', 'log10', 'floor', 'ceil', 'round', 'trunc', 'sign', 'min', 'max', 'hypot', 'PI', 'E',
];

// Small number-theory / counting helpers a demo expression can also use.
const HELPERS = {
  fact: n => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
  nPr: (n, k) => { let r = 1; for (let i = 0; i < k; i++) r *= n - i; return r; },
  nCr: (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); },
  gcd: (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; },
  lcm: (a, b) => (a === 0 || b === 0 ? 0 : Math.abs(a * b) / HELPERS.gcd(a, b)),
  isPrime: n => { if (n < 2 || !Number.isInteger(n)) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; },
  fib: n => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; },
  mod: (a, m) => ((a % m) + m) % m,
};
const HELPER_NAMES = Object.keys(HELPERS);

// Compiles an expression string into a function of a scope object whose keys
// are the variable names the expression may use.
function compileExpr(expr, names) {
  const compiled = new Function(...names, ...MATH_NAMES, ...HELPER_NAMES, 'return (' + expr + ');');
  const fixed = [...MATH_NAMES.map(name => Math[name]), ...HELPER_NAMES.map(name => HELPERS[name])];
  return scope => compiled(...names.map(name => scope[name]), ...fixed);
}

// Formats a value for display: whole numbers as they are, other numbers to
// six significant digits, arrays and booleans readably.
function formatValue(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    if (Number.isInteger(value)) return String(value);
    return String(Number(value.toPrecision(6)));
  }
  if (Array.isArray(value)) return '[' + value.map(formatValue).join(', ') + ']';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

// Escapes text destined for innerHTML so user errors can't inject markup.
function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Creates an element with a class and optional text.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ----------------------------------------------------------------------------
// Demo widgets
// ----------------------------------------------------------------------------

// Builds the demo's input controls (a slider when min and max are given, a
// number box otherwise, a text box for kind "text"), calls onChange whenever
// one moves, and returns a function that reads the current scope.
function buildInputs(parent, inputs, onChange) {
  const box = el('div', 'demo-inputs');
  const controls = {};
  for (const input of inputs || []) {
    const wrap = el('label', 'demo-input');
    wrap.append(input.label || input.name);
    const control = document.createElement('input');
    if (input.kind === 'text') {
      control.type = 'text';
    } else if (input.min !== undefined && input.max !== undefined) {
      control.type = 'range';
      control.min = input.min;
      control.max = input.max;
      control.step = input.step || 1;
    } else {
      control.type = 'number';
      if (input.step) control.step = input.step;
    }
    control.value = input.value;
    wrap.append(control);
    if (control.type === 'range') {
      const readout = el('span', 'range-value', formatValue(Number(control.value)));
      control.addEventListener('input', () => { readout.textContent = formatValue(Number(control.value)); });
      wrap.append(readout);
    }
    control.addEventListener('input', onChange);
    controls[input.name] = control;
    box.append(wrap);
  }
  if (inputs && inputs.length) parent.append(box);
  return () => {
    const scope = {};
    for (const input of inputs || []) {
      const control = controls[input.name];
      scope[input.name] = input.kind === 'text' ? control.value : Number(control.value);
    }
    return scope;
  };
}

// Appends the optional explanatory note under a demo.
function appendNote(parent, cfg) {
  if (cfg.note) parent.append(el('p', 'demo-note', cfg.note));
}

// "successor machine": a counter that only ever moves by taking the next
// number, with one dot per unit so the symbol and the quantity agree.
function buildCounter(root, cfg) {
  let value = cfg.start || 0;
  const controls = el('div', 'demo-controls');
  controls.append(el('span', 'demo-label', cfg.label || 'current number'));
  const valueEl = el('span', 'demo-value');
  const step = el('button', 'primary', cfg.stepLabel || 'successor (+1)');
  const reset = el('button', null, 'reset');
  controls.append(valueEl, step, reset);
  const dots = el('div', 'dots');
  root.append(controls, dots);
  function render() {
    valueEl.textContent = value;
    dots.innerHTML = '';
    for (let i = 0; i < Math.min(value, 200); i++) dots.append(el('span', 'dot'));
  }
  step.addEventListener('click', () => { value += 1; render(); });
  reset.addEventListener('click', () => { value = cfg.start || 0; render(); });
  render();
}

// Builds the labelled-results list under a demo. Each output is an expression
// over the inputs; returns a function that recomputes them for a scope.
function buildOutputs(parent, outputs, names) {
  const compiled = (outputs || []).map(o => ({ label: o.label, fn: compileExpr(o.expr, names) }));
  const list = el('div', 'demo-outputs');
  const cells = compiled.map(o => {
    const row = el('div', 'demo-output');
    const value = el('span', 'out-value');
    row.append(el('span', 'out-label', o.label), value);
    list.append(row);
    return value;
  });
  if (compiled.length) parent.append(list);
  return scope => compiled.forEach((o, i) => {
    try { cells[i].textContent = formatValue(o.fn(scope)); } catch (e) { cells[i].textContent = '—'; }
  });
}

// Inputs in, labelled results out.
function buildCalc(root, cfg) {
  const names = cfg.inputs.map(i => i.name);
  let showOutputs = () => {};
  const read = buildInputs(root, cfg.inputs, () => showOutputs(read()));
  showOutputs = buildOutputs(root, cfg.outputs, names);
  showOutputs(read());
  appendNote(root, cfg);
}

// A number line from range[0] to range[1] with a labelled marker for each
// point expression (the inputs themselves, their sum, a root ...), redrawn as
// the sliders move. Results can be listed under it.
function buildNumberLine(root, cfg) {
  const names = (cfg.inputs || []).map(i => i.name);
  const points = cfg.points.map(p => ({ label: p.label, fn: compileExpr(p.expr, names) }));
  const canvas = el('canvas', 'demo-canvas');
  canvas.width = 640;
  canvas.height = 130;
  let showOutputs = () => {};
  const read = buildInputs(root, cfg.inputs, () => { draw(); showOutputs(read()); });
  root.append(canvas);
  showOutputs = buildOutputs(root, cfg.outputs, names);
  const accent = getComputedStyle(document.body).getPropertyValue('--color-accent').trim() || '#C0DD97';
  const palette = [accent, '#7EC8E3', '#F08A8A', '#E5C97A'];

  function draw() {
    const scope = read();
    const [min, max] = cfg.range;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, pad = 24, lineY = 82;
    const px = v => pad + (Math.min(max, Math.max(min, v)) - min) / (max - min) * (w - 2 * pad);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#5e5e66';
    ctx.fillStyle = '#9898a0';
    ctx.lineWidth = 1.5;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.beginPath(); ctx.moveTo(pad - 8, lineY); ctx.lineTo(w - pad + 8, lineY); ctx.stroke();
    const labelEvery = max - min > 30 ? 5 : (max - min > 16 ? 2 : 1);
    for (let t = Math.ceil(min); t <= max; t++) {
      ctx.lineWidth = t === 0 ? 2.5 : 1.5;
      ctx.beginPath(); ctx.moveTo(px(t), lineY - (t === 0 ? 8 : 5)); ctx.lineTo(px(t), lineY + (t === 0 ? 8 : 5)); ctx.stroke();
      if (t % labelEvery === 0) ctx.fillText(String(t), px(t), lineY + 24);
    }
    points.forEach((p, i) => {
      let value;
      try { value = p.fn(scope); } catch (e) { return; }
      if (!Number.isFinite(value)) return;
      const colour = palette[i % palette.length];
      const x = px(value);
      ctx.strokeStyle = colour;
      ctx.fillStyle = colour;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, lineY); ctx.lineTo(x, 50 - (i % 2) * 20 + 6); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, lineY, 6, 0, 2 * Math.PI); ctx.fill();
      ctx.fillText(p.label + ' = ' + formatValue(value), x, 50 - (i % 2) * 20);
    });
  }
  draw();
  showOutputs(read());
  appendNote(root, cfg);
}

// A row of terms: expr(n) for n = from..from+count-1 (count may itself be an expression).
function buildSequence(root, cfg) {
  const names = (cfg.inputs || []).map(i => i.name);
  const term = compileExpr(cfg.expr, [...names, 'n']);
  const count = compileExpr(String(cfg.count || 10), names);
  const hot = cfg.hot ? compileExpr(cfg.hot, [...names, 'n', 'v']) : null;
  const chips = el('div', 'chips');
  const read = buildInputs(root, cfg.inputs, update);
  root.append(chips);
  function update() {
    const scope = read();
    chips.innerHTML = '';
    const total = Math.min(Math.max(0, Math.floor(count(scope))), 60);
    const from = cfg.from === undefined ? 1 : cfg.from;
    for (let n = from; n < from + total; n++) {
      const v = term({ ...scope, n });
      const chip = el('span', 'chip', formatValue(v));
      if (hot && hot({ ...scope, n, v })) chip.classList.add('hot');
      chips.append(chip);
    }
  }
  update();
  appendNote(root, cfg);
}

// A bar chart of expr(k) for k = from..from+count-1 — a probability mass
// function, a histogram, a row of Pascal's triangle.
function buildBars(root, cfg) {
  const names = (cfg.inputs || []).map(i => i.name);
  const height = compileExpr(cfg.expr, [...names, 'k']);
  const count = compileExpr(String(cfg.count), names);
  const bars = el('div', 'bars');
  const labels = el('div', 'bar-labels');
  const readout = el('div', 'demo-output');
  const read = buildInputs(root, cfg.inputs, update);
  root.append(bars, labels);
  if (cfg.outputs) root.append(readout);
  const outs = (cfg.outputs || []).map(o => ({ label: o.label, fn: compileExpr(o.expr, names) }));
  function update() {
    const scope = read();
    const from = cfg.from === undefined ? 0 : cfg.from;
    const total = Math.min(Math.max(1, Math.floor(count(scope))), 80);
    const values = [];
    for (let k = from; k < from + total; k++) values.push(height({ ...scope, k }));
    const peak = Math.max(...values, 1e-12);
    bars.innerHTML = '';
    labels.innerHTML = '';
    values.forEach((v, i) => {
      const bar = el('div', 'bar');
      bar.style.height = Math.max(0, (v / peak) * 100) + '%';
      bar.title = 'k = ' + (from + i) + ': ' + formatValue(v);
      bars.append(bar);
      labels.append(el('span', null, total <= 24 ? String(from + i) : ''));
    });
    readout.textContent = outs.map(o => o.label + ' = ' + formatValue(o.fn(scope))).join('    ');
  }
  update();
  appendNote(root, cfg);
}

// A truth table: every combination of the variables, one column per expression.
function buildTruth(root, cfg) {
  const fns = cfg.exprs.map(e => ({ label: e.label, fn: compileExpr(e.expr, cfg.vars) }));
  const table = el('table', 'truth');
  const head = el('tr');
  [...cfg.vars, ...fns.map(f => f.label)].forEach(name => head.append(el('th', null, name)));
  table.append(head);
  for (let mask = (1 << cfg.vars.length) - 1; mask >= 0; mask--) {
    const scope = {};
    cfg.vars.forEach((name, i) => { scope[name] = Boolean(mask & (1 << (cfg.vars.length - 1 - i))); });
    const row = el('tr');
    const cells = [...cfg.vars.map(name => scope[name]), ...fns.map(f => Boolean(f.fn(scope)))];
    cells.forEach(v => row.append(el('td', v ? 't' : 'f', v ? 'T' : 'F')));
    table.append(row);
  }
  root.append(table);
  appendNote(root, cfg);
}

// A grid of dots: count(scope) of them, perRow(scope) to a row — for arrays
// (rows × columns), arrangements and the like. Results show under the grid.
function buildDots(root, cfg) {
  const names = cfg.inputs.map(i => i.name);
  const count = compileExpr(cfg.count, names);
  const perRow = compileExpr(String(cfg.perRow || cfg.count), names);
  const outs = (cfg.outputs || []).map(o => ({ label: o.label, fn: compileExpr(o.expr, names) }));
  const grid = el('div', 'dot-grid');
  const list = el('div', 'demo-outputs');
  const read = buildInputs(root, cfg.inputs, update);
  root.append(grid, list);
  function update() {
    const scope = read();
    const total = Math.min(Math.max(0, Math.floor(count(scope))), 400);
    const columns = Math.max(1, Math.floor(perRow(scope)));
    grid.style.gridTemplateColumns = 'repeat(' + Math.min(columns, 60) + ', 18px)';
    grid.innerHTML = '';
    for (let i = 0; i < total; i++) grid.append(el('span', 'dot'));
    list.innerHTML = '';
    outs.forEach(o => {
      const row = el('div', 'demo-output');
      row.append(el('span', 'out-label', o.label), el('span', 'out-value', formatValue(o.fn(scope))));
      list.append(row);
    });
  }
  update();
  appendNote(root, cfg);
}

// A function graph on a canvas: one or more curves y = expr(x), redrawn as the
// sliders move. Curves with a break (1/x, tan x) are drawn with a gap.
function buildPlot(root, cfg) {
  const names = (cfg.inputs || []).map(i => i.name);
  const curves = cfg.curves.map((c, i) => ({ label: c.label, fn: compileExpr(c.expr, [...names, 'x']), color: c.color, index: i }));
  const canvas = el('canvas', 'demo-canvas');
  canvas.width = 640;
  canvas.height = 320;
  const legend = el('div', 'demo-outputs');
  const read = buildInputs(root, cfg.inputs, draw);
  root.append(canvas, legend);
  const accent = getComputedStyle(document.body).getPropertyValue('--color-accent').trim() || '#C0DD97';
  const palette = [accent, '#9898a0', '#F08A8A', '#7EC8E3'];

  function draw() {
    const scope = read();
    const [xmin, xmax] = cfg.x;
    const samples = 480;
    const series = curves.map(c => {
      const points = [];
      for (let i = 0; i <= samples; i++) {
        const x = xmin + (xmax - xmin) * i / samples;
        let y;
        try { y = c.fn({ ...scope, x }); } catch (e) { y = NaN; }
        points.push([x, y]);
      }
      return points;
    });
    let ymin, ymax;
    if (cfg.y) {
      [ymin, ymax] = cfg.y;
    } else {
      const ys = series.flat().map(p => p[1]).filter(y => Number.isFinite(y) && Math.abs(y) < 1e6);
      ymin = Math.min(...ys, 0);
      ymax = Math.max(...ys, 0);
      const pad = (ymax - ymin || 1) * 0.1;
      ymin -= pad;
      ymax += pad;
    }
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const px = x => (x - xmin) / (xmax - xmin) * w;
    const py = y => h - (y - ymin) / (ymax - ymin) * h;
    ctx.clearRect(0, 0, w, h);

    // grid lines at whole numbers (or every 5/10 when the range is wide), and the axes
    ctx.lineWidth = 1;
    const stepFor = range => (range > 40 ? 10 : range > 16 ? 5 : range > 8 ? 2 : 1);
    ctx.strokeStyle = '#232328';
    for (let gx = Math.ceil(xmin / stepFor(xmax - xmin)) * stepFor(xmax - xmin); gx <= xmax; gx += stepFor(xmax - xmin)) {
      ctx.beginPath(); ctx.moveTo(px(gx), 0); ctx.lineTo(px(gx), h); ctx.stroke();
    }
    for (let gy = Math.ceil(ymin / stepFor(ymax - ymin)) * stepFor(ymax - ymin); gy <= ymax; gy += stepFor(ymax - ymin)) {
      ctx.beginPath(); ctx.moveTo(0, py(gy)); ctx.lineTo(w, py(gy)); ctx.stroke();
    }
    ctx.strokeStyle = '#5e5e66';
    if (xmin < 0 && xmax > 0) { ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), h); ctx.stroke(); }
    if (ymin < 0 && ymax > 0) { ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(w, py(0)); ctx.stroke(); }
    ctx.fillStyle = '#5e5e66';
    ctx.font = '12px monospace';
    ctx.fillText(formatValue(xmin), 4, h - 4);
    ctx.fillText(formatValue(xmax), w - 28, h - 4);
    ctx.fillText(formatValue(Number(ymax.toPrecision(3))), 4, 14);
    ctx.fillText(formatValue(Number(ymin.toPrecision(3))), 4, h - 16);

    // the curves, lifting the pen at breaks and off-screen jumps
    series.forEach((points, i) => {
      ctx.strokeStyle = curves[i].color || palette[i % palette.length];
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let pen = false;
      let prev = null;
      points.forEach(([x, y]) => {
        const ok = Number.isFinite(y) && Math.abs(y) < 1e6;
        const jump = prev !== null && Math.abs(y - prev) > (ymax - ymin) * 2;
        if (!ok || jump) { pen = false; prev = ok ? y : null; return; }
        if (pen) ctx.lineTo(px(x), py(y)); else { ctx.moveTo(px(x), py(y)); pen = true; }
        prev = y;
      });
      ctx.stroke();
    });

    legend.innerHTML = '';
    curves.forEach((c, i) => {
      if (!c.label) return;
      const row = el('div', 'demo-output');
      const name = el('span', 'out-label', c.label);
      name.style.color = c.color || palette[i % palette.length];
      row.append(name);
      legend.append(row);
    });
  }
  draw();
  appendNote(root, cfg);
}

// Escape hatch for a demo no generic widget fits: the topic supplies the
// markup and a run(root) function that wires it up.
function buildCustom(root, cfg) {
  root.insertAdjacentHTML('beforeend', cfg.html || '');
  cfg.run(root);
}

const DEMO_BUILDERS = {
  counter: buildCounter, calc: buildCalc, numberline: buildNumberLine, plot: buildPlot, sequence: buildSequence,
  bars: buildBars, truth: buildTruth, dots: buildDots, custom: buildCustom,
};

// ----------------------------------------------------------------------------
// Exercises
// ----------------------------------------------------------------------------

// Deep-equality good enough for the values these exercises return (numbers,
// strings, booleans, and arrays/objects of those). Uses JSON because the
// values are plain data; -0 and NaN are normalised so they compare sensibly.
function deepEqual(a, b) {
  const normalise = (key, value) => (typeof value === 'number' && !Number.isFinite(value) ? String(value) : (Object.is(value, -0) ? 0 : value));
  return JSON.stringify(a, normalise) === JSON.stringify(b, normalise);
}

// Compactly renders a value the way the learner typed it, for result messages.
function show(value) {
  if (value === undefined) return 'undefined';
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  return JSON.stringify(value);
}

// Runs one exercise's code against its tests. Returns either an `error` string
// (code failed to define the function or threw while loading) or a list of
// per-test `results`. Numbers are compared exactly unless the test sets `tol`.
function runExercise(exercise, code) {
  let userFn;
  try {
    // Execute the learner's code, then hand back the named function so we can
    // call it. Returning null lets us detect a missing/misnamed definition.
    const factory = new Function(
      code + '\nreturn typeof ' + exercise.fn + " === 'function' ? " + exercise.fn + ' : null;'
    );
    userFn = factory();
  } catch (e) {
    return { error: 'Your code did not run:\n' + e.message };
  }
  if (!userFn) return { error: 'Define a function named "' + exercise.fn + '".' };

  const results = exercise.tests.map(test => {
    let actual, thrown = null;
    try {
      actual = userFn(...test.args);
    } catch (e) {
      thrown = e.message;
    }
    const close = test.tol !== undefined && typeof actual === 'number' && typeof test.expected === 'number'
      && Math.abs(actual - test.expected) <= test.tol;
    const pass = !thrown && (close || deepEqual(actual, test.expected));
    return { args: test.args, expected: test.expected, actual, thrown, pass };
  });
  return { results };
}

// Renders the argument list of a single test case, e.g. "(374, 1)".
function exerciseCall(args) {
  return '<span>(' + escapeHtml(args.map(show).join(', ')) + ')</span>';
}

// Builds the results panel HTML for a finished run.
function renderResults(run) {
  if (run.error) return '<div class="result-error">' + escapeHtml(run.error) + '</div>';
  const passed = run.results.filter(r => r.pass).length;
  const total = run.results.length;
  const allPass = passed === total;
  const summary =
    '<div class="result-summary ' + (allPass ? 'all-pass' : 'some-fail') + '">' +
    (allPass ? '✓ All ' + total + ' tests passed!' : passed + ' / ' + total + ' tests passed') + '</div>';
  const cases = run.results.map(r => {
    const call = exerciseCall(r.args);
    if (r.thrown) {
      return '<div class="case fail"><span class="mark">✗</span>' + call +
        ' <span class="detail">threw: ' + escapeHtml(r.thrown) + '</span></div>';
    }
    const detail = r.pass
      ? '<span class="detail">→ ' + escapeHtml(show(r.actual)) + '</span>'
      : '<span class="detail">expected ' + escapeHtml(show(r.expected)) + ', got ' + escapeHtml(show(r.actual)) + '</span>';
    return '<div class="case ' + (r.pass ? 'pass' : 'fail') + '"><span class="mark">' +
      (r.pass ? '✓' : '✗') + '</span>' + call + ' ' + detail + '</div>';
  }).join('');
  return summary + cases;
}

// Builds the DOM for every exercise and wires up its Run / Reset buttons.
function buildExercises(exercises) {
  const container = document.getElementById('exercises');
  exercises.forEach((exercise, index) => {
    const card = document.createElement('div');
    card.className = 'exercise';
    card.innerHTML =
      '<div class="exercise-title"><span class="badge">' +
        String(index + 1).padStart(2, '0') + '</span>' + escapeHtml(exercise.title) + '</div>' +
      '<div class="exercise-prompt">' + escapeHtml(exercise.prompt) + '</div>' +
      '<textarea class="editor" spellcheck="false"></textarea>' +
      '<div class="exercise-actions">' +
        '<button class="primary run">Run</button>' +
        '<button class="reset">Reset</button>' +
      '</div>' +
      '<div class="results"></div>' +
      '<details class="solution"><summary>Show solution</summary><pre></pre></details>';

    const editor = card.querySelector('.editor');
    const results = card.querySelector('.results');
    editor.value = exercise.starter;
    card.querySelector('.solution pre').textContent = exercise.solution;

    card.querySelector('.run').addEventListener('click', () => {
      results.innerHTML = renderResults(runExercise(exercise, editor.value));
    });
    card.querySelector('.reset').addEventListener('click', () => {
      editor.value = exercise.starter;
      results.innerHTML = '';
    });
    container.appendChild(card);
  });
}

// ----------------------------------------------------------------------------
// Entry point
// ----------------------------------------------------------------------------

// Builds the demo (when the topic has one) and the exercises.
function initTopic(topic) {
  const demoRoot = document.getElementById('demo');
  if (topic.demo && demoRoot) DEMO_BUILDERS[topic.demo.type](demoRoot, topic.demo);
  buildExercises(topic.exercises);
}
