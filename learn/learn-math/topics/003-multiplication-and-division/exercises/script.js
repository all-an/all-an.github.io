// ── Test suites ──────────────────────────────────────────────────────
const TESTS = {
  1: { fn: 'multiply', cases: [
    { args: [3, 4],    expected: 12   },
    { args: [0, 99],   expected: 0    },
    { args: [-2, 5],   expected: -10  },
    { args: [7, 7],    expected: 49   },
    { args: [1, 1000], expected: 1000 },
  ]},
  2: { fn: 'mulRepeat', cases: [
    { args: [4, 3],  expected: 12 },
    { args: [0, 5],  expected: 0  },
    { args: [7, 0],  expected: 0  },
    { args: [6, 6],  expected: 36 },
    { args: [1, 10], expected: 10 },
  ]},
  3: { fn: 'safeDivide', cases: [
    { args: [10, 2], expected: 5.0  },
    { args: [7, 2],  expected: 3.5  },
    { args: [0, 5],  expected: 0.0  },
    { args: [9, 0],  expected: null },
    { args: [0, 0],  expected: null },
  ]},
  4: { fn: 'factorial', cases: [
    { args: [0],  expected: 1       },
    { args: [1],  expected: 1       },
    { args: [5],  expected: 120     },
    { args: [10], expected: 3628800 },
    { args: [7],  expected: 5040    },
  ]},
  5: { fn: 'isDivisible', cases: [
    { args: [12, 3],   expected: true  },
    { args: [12, 5],   expected: false },
    { args: [0, 7],    expected: true  },
    { args: [9, 0],    expected: false },
    { args: [100, 10], expected: true  },
  ]},
  6: { fn: 'gcd', cases: [
    { args: [12, 8],   expected: 4  },
    { args: [48, 18],  expected: 6  },
    { args: [7, 13],   expected: 1  },
    { args: [100, 25], expected: 25 },
    { args: [0, 5],    expected: 5  },
  ]},
  7: { fn: 'timesTable', cases: [
    { args: [3],  expected: [3,6,9,12,15,18,21,24,27,30]     },
    { args: [1],  expected: [1,2,3,4,5,6,7,8,9,10]           },
    { args: [10], expected: [10,20,30,40,50,60,70,80,90,100] },
    { args: [5],  expected: [5,10,15,20,25,30,35,40,45,50]   },
  ]},
  8: { fn: 'primeFactors', cases: [
    { args: [2],   expected: [2]       },
    { args: [12],  expected: [2,2,3]   },
    { args: [60],  expected: [2,2,3,5] },
    { args: [13],  expected: [13]      },
    { args: [100], expected: [2,2,5,5] },
  ]},
};

const STARTER = {
  1: `function multiply(a, b) {\n  // your code here\n  return 0;\n}`,
  2: `function mulRepeat(a, b) {\n  // no * operator — use repeated addition\n  let result = 0;\n  return result;\n}`,
  3: `function safeDivide(a, b) {\n  // return null if b === 0\n  // otherwise return a / b as a float\n  return 0;\n}`,
  4: `function factorial(n) {\n  // 0! = 1, no Math.factorial\n  let result = 1;\n  return result;\n}`,
  5: `function isDivisible(n, d) {\n  // return false if d === 0\n  return false;\n}`,
  6: `function gcd(a, b) {\n  // Euclidean: while b !== 0, [a, b] = [b, a % b]\n  return 0;\n}`,
  7: `function timesTable(n) {\n  const result = [];\n  // push n*1, n*2, ..., n*10\n  return result;\n}`,
  8: `function primeFactors(n) {\n  const result = [];\n  let d = 2;\n  // your code here\n  return result;\n}`,
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
