// ── Test suites ──────────────────────────────────────────────────────
const TESTS = {
  1: { fn: 'add', cases: [
    { args: [3, 4],     expected: 7   },
    { args: [-1, 1],    expected: 0   },
    { args: [0, 0],     expected: 0   },
    { args: [100, -50], expected: 50  },
    { args: [-3, -7],   expected: -10 },
  ]},
  2: { fn: 'subtract', cases: [
    { args: [10, 3],  expected: 7  },
    { args: [5, 5],   expected: 0  },
    { args: [0, 4],   expected: -4 },
    { args: [-3, 2],  expected: -5 },
    { args: [100, 1], expected: 99 },
  ]},
  3: { fn: 'total', cases: [
    { args: [[1, 2, 3]],      expected: 6  },
    { args: [[]],             expected: 0  },
    { args: [[-1, 1]],        expected: 0  },
    { args: [[10, 20, 30]],   expected: 60 },
    { args: [[5, -5, 5, -5]], expected: 0  },
  ]},
  4: { fn: 'sumToN', cases: [
    { args: [10],  expected: 55   },
    { args: [1],   expected: 1    },
    { args: [100], expected: 5050 },
    { args: [0],   expected: 0    },
    { args: [4],   expected: 10   },
  ]},
  5: { fn: 'absDiff', cases: [
    { args: [5, 3],  expected: 2 },
    { args: [3, 5],  expected: 2 },
    { args: [0, 0],  expected: 0 },
    { args: [-4, 4], expected: 8 },
    { args: [7, 7],  expected: 0 },
  ]},
  6: { fn: 'runningBalance', cases: [
    { args: [[100, -30, 50]],      expected: [100, 70, 120]       },
    { args: [[0]],                 expected: [0]                  },
    { args: [[-10, -10, -10]],     expected: [-10, -20, -30]      },
    { args: [[200, -50, -50, 10]], expected: [200, 150, 100, 110] },
  ]},
  7: { fn: 'rangeSum', cases: [
    { args: [1, 5],   expected: 15   },
    { args: [3, 3],   expected: 3    },
    { args: [5, 1],   expected: 0    },
    { args: [1, 100], expected: 5050 },
    { args: [0, 0],   expected: 0    },
  ]},
  8: { fn: 'columnAdd', cases: [
    { args: [123, 456], expected: 579  },
    { args: [99, 1],    expected: 100  },
    { args: [0, 0],     expected: 0    },
    { args: [999, 1],   expected: 1000 },
    { args: [500, 500], expected: 1000 },
  ]},
};

const STARTER = {
  1: `function add(a, b) {\n  // your code here\n  return 0;\n}`,
  2: `function subtract(a, b) {\n  // your code here\n  return 0;\n}`,
  3: `function total(numbers) {\n  // no built-in reduce — use a loop\n  let result = 0;\n  return result;\n}`,
  4: `function sumToN(n) {\n  // closed-form: n * (n + 1) / 2\n  return 0;\n}`,
  5: `function absDiff(a, b) {\n  // no Math.abs — use an if statement\n  return 0;\n}`,
  6: `function runningBalance(transactions) {\n  const result = [];\n  let balance = 0;\n  // your code here\n  return result;\n}`,
  7: `function rangeSum(a, b) {\n  // return 0 if a > b\n  let s = 0;\n  return s;\n}`,
  8: `function columnAdd(a, b) {\n  const digits = [];\n  let carry = 0;\n  // extract digits: last = x % 10, drop = Math.trunc(x / 10)\n  // collect digits, reconstruct the number\n  return 0;\n}`,
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
