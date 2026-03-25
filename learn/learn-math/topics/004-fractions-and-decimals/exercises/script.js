// ── Test suites ──────────────────────────────────────────────────────
const TESTS = {
  1: { fn: 'simplify', cases: [
    { args: [6, 4],   expected: [3, 2] },
    { args: [3, 9],   expected: [1, 3] },
    { args: [7, 14],  expected: [1, 2] },
    { args: [5, 5],   expected: [1, 1] },
    { args: [4, 6],   expected: [2, 3] },
  ]},
  2: { fn: 'addFractions', cases: [
    { args: [1, 2, 1, 3], expected: [5, 6]  },
    { args: [1, 4, 1, 4], expected: [1, 2]  },
    { args: [2, 3, 1, 6], expected: [5, 6]  },
    { args: [3, 4, 1, 4], expected: [1, 1]  },
    { args: [1, 3, 1, 6], expected: [1, 2]  },
  ]},
  3: { fn: 'toDecimal', cases: [
    { args: [1, 2], expected: 0.5  },
    { args: [1, 4], expected: 0.25 },
    { args: [3, 4], expected: 0.75 },
    { args: [2, 5], expected: 0.4  },
    { args: [7, 4], expected: 1.75 },
  ]},
  4: { fn: 'isProper', cases: [
    { args: [1, 2], expected: true  },
    { args: [3, 2], expected: false },
    { args: [5, 5], expected: false },
    { args: [2, 7], expected: true  },
    { args: [7, 3], expected: false },
  ]},
  5: { fn: 'toMixed', cases: [
    { args: [7, 2],  expected: [3, 1, 2] },
    { args: [9, 4],  expected: [2, 1, 4] },
    { args: [5, 3],  expected: [1, 2, 3] },
    { args: [11, 5], expected: [2, 1, 5] },
    { args: [3, 2],  expected: [1, 1, 2] },
  ]},
  6: { fn: 'multiplyFractions', cases: [
    { args: [2, 3, 3, 4], expected: [1, 2] },
    { args: [1, 2, 1, 2], expected: [1, 4] },
    { args: [3, 5, 5, 9], expected: [1, 3] },
    { args: [2, 3, 3, 2], expected: [1, 1] },
    { args: [4, 5, 5, 8], expected: [1, 2] },
  ]},
  7: { fn: 'roundTo', cases: [
    { args: [3.14159, 2], expected: 3.14  },
    { args: [2.567, 1],   expected: 2.6   },
    { args: [100.999, 0], expected: 101   },
    { args: [0.5555, 3],  expected: 0.556 },
    { args: [7.0, 2],     expected: 7     },
  ]},
  8: { fn: 'fractionToPercent', cases: [
    { args: [1, 2],  expected: 50 },
    { args: [1, 4],  expected: 25 },
    { args: [3, 4],  expected: 75 },
    { args: [1, 5],  expected: 20 },
    { args: [3, 10], expected: 30 },
  ]},
};

const STARTER = {
  1: `function simplify(num, den) {\n  // hint: write a gcd helper first\n  // return [num / g, den / g]\n  return [num, den];\n}`,
  2: `function addFractions(n1, d1, n2, d2) {\n  // cross-multiply then simplify\n  // you may reuse or rewrite gcd/simplify here\n  return [0, 1];\n}`,
  3: `function toDecimal(num, den) {\n  // your code here\n  return 0;\n}`,
  4: `function isProper(num, den) {\n  // return true if |num| < den\n  return false;\n}`,
  5: `function toMixed(num, den) {\n  // whole part = Math.floor(num / den)\n  // remainder numerator = num % den\n  return [0, 0, den];\n}`,
  6: `function multiplyFractions(n1, d1, n2, d2) {\n  // numerators multiply, denominators multiply, then simplify\n  return [0, 1];\n}`,
  7: `function roundTo(n, places) {\n  // use 10 ** places as a scaling factor\n  return n;\n}`,
  8: `function fractionToPercent(num, den) {\n  // multiply the decimal form by 100\n  return 0;\n}`,
};


// ── Score ────────────────────────────────────────────────────────────
const passed = {};
function updateScore() {
  const n = Object.values(passed).filter(Boolean).length;
  document.getElementById('score-display').textContent = `${n} / 8`;
  document.getElementById('progress-text').textContent = `${n} passed`;
  document.getElementById('progress-bar').style.width  = `${n * 12.5}%`;
}


// ── Run exercise ─────────────────────────────────────────────────────
function runExercise(id) {
  const code     = document.getElementById(`code-${id}`).value;
  const outBox   = document.getElementById(`out-${id}`);
  const badge    = document.getElementById(`badge-${id}`);
  const card     = document.getElementById(`ex-${id}`);
  const statusEl = document.getElementById(`status-${id}`);
  const { fn, cases } = TESTS[id];

  outBox.className = 'output-box show';
  statusEl.textContent = 'running…';

  // compile
  let func;
  try {
    const factory = new Function('"use strict";\n' + code +
      `\nreturn typeof ${fn} !== 'undefined' ? ${fn} : null;`);
    func = factory();
  } catch (err) {
    outBox.className = 'output-box show error';
    outBox.textContent = 'SyntaxError:\n' + err.message;
    badge.textContent = '✗'; badge.className = 'ex-badge err';
    card.classList.remove('passed'); card.classList.add('failed');
    statusEl.textContent = '';
    passed[id] = false; updateScore();
    return;
  }

  if (!func) {
    outBox.className = 'output-box show error';
    outBox.textContent = `Function "${fn}" not found — check the function name.`;
    badge.textContent = '✗'; badge.className = 'ex-badge err';
    card.classList.remove('passed'); card.classList.add('failed');
    statusEl.textContent = '';
    passed[id] = false; updateScore();
    return;
  }

  // run test cases
  let lines = [], allPass = true;
  for (const t of cases) {
    let result, ok;
    try {
      result = func(...t.args);
      if (Array.isArray(result)) result = [...result];
      ok = JSON.stringify(result) === JSON.stringify(t.expected);
    } catch (err) {
      result = 'ERROR: ' + err.message;
      ok = false;
    }
    if (!ok) allPass = false;
    const argStr = t.args.map(a => JSON.stringify(a)).join(', ');
    lines.push(
      `<span class="${ok ? 'pass-line' : 'fail-line'}">${ok ? '✓' : '✗'}  ${fn}(${argStr})  →  ${JSON.stringify(result)}${ok ? '' : `  (expected ${JSON.stringify(t.expected)})`}</span>`
    );
  }

  outBox.className = 'output-box show ' + (allPass ? 'ok' : 'error');
  outBox.innerHTML = lines.join('\n');
  badge.textContent = allPass ? '✓ pass' : '✗ fail';
  badge.className   = 'ex-badge ' + (allPass ? 'ok' : 'err');
  card.classList.toggle('passed', allPass);
  card.classList.toggle('failed', !allPass);
  statusEl.textContent = '';
  passed[id] = allPass;
  updateScore();
}


// ── Wire buttons ─────────────────────────────────────────────────────
for (let id = 1; id <= 8; id++) {
  document.getElementById(`run-${id}`).addEventListener('click', () => runExercise(id));

  document.getElementById(`reset-${id}`).addEventListener('click', () => {
    document.getElementById(`code-${id}`).value = STARTER[id];
    const outBox = document.getElementById(`out-${id}`);
    outBox.className = 'output-box'; outBox.innerHTML = '';
    document.getElementById(`badge-${id}`).textContent = '';
    document.getElementById(`badge-${id}`).className = 'ex-badge';
    document.getElementById(`status-${id}`).textContent = '';
    document.getElementById(`ex-${id}`).classList.remove('passed', 'failed');
    passed[id] = false; updateScore();
  });

  document.getElementById(`code-${id}`).addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target, s = ta.selectionStart, end = ta.selectionEnd;
      ta.value = ta.value.substring(0, s) + '  ' + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = s + 2;
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runExercise(id);
  });
}


// ── Hints ────────────────────────────────────────────────────────────
document.querySelectorAll('.hint-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const box = document.getElementById(btn.dataset.hint);
    const open = box.classList.toggle('show');
    btn.textContent = open ? '▾ hide hint' : '▸ show hint';
  });
});
