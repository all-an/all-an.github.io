// Natural numbers & counting — interactive page logic.
//
// Two independent pieces live here:
//   1. The "successor machine" demo: a counter that grows one dot at a time,
//      making the successor step (n → n + 1) visible.
//   2. The JavaScript exercise runner: each exercise asks the learner to write
//      a function, which is then executed against fixed test cases and graded.

// ----------------------------------------------------------------------------
// 1. Successor machine demo
// ----------------------------------------------------------------------------

// The number currently shown. Starts at 0 (Peano's starting point) and only
// ever moves by taking the successor, mirroring how counting actually works.
let counterValue = 0;

const counterValueEl = document.getElementById('counterValue');
const dotsEl = document.getElementById('dots');

// Redraws the number text and the matching number of dots (one dot per unit),
// so the symbol and the quantity it represents always agree.
function renderCounter() {
  counterValueEl.textContent = counterValue;
  dotsEl.innerHTML = '';
  for (let i = 0; i < counterValue; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dotsEl.appendChild(dot);
  }
}

// The successor step: the heart of counting — take the current number and move
// to the one right after it.
document.getElementById('successorBtn').addEventListener('click', () => {
  counterValue += 1;
  renderCounter();
});

// Return to the starting point.
document.getElementById('resetBtn').addEventListener('click', () => {
  counterValue = 0;
  renderCounter();
});

renderCounter();

// ----------------------------------------------------------------------------
// 2. Exercises
// ----------------------------------------------------------------------------

// Each exercise defines: the function name the learner must implement, the
// prompt, starter code, a worked solution, and the test cases used to grade it.
// Tests compare the learner's return value against `expected` via deep equality.
const EXERCISES = [
  {
    fn: 'successor',
    title: 'The successor',
    prompt: 'Return the natural number that comes right after n — its successor.',
    starter: 'function successor(n) {\n  // your code here\n}\n',
    solution: 'function successor(n) {\n  return n + 1;\n}\n',
    tests: [
      { args: [0], expected: 1 },
      { args: [1], expected: 2 },
      { args: [41], expected: 42 },
    ],
  },
  {
    fn: 'countTo',
    title: 'Count to n',
    prompt: 'Return an array of the natural numbers from 1 up to and including n. countTo(3) → [1, 2, 3].',
    starter: 'function countTo(n) {\n  // your code here\n}\n',
    solution: 'function countTo(n) {\n  const numbers = [];\n  for (let i = 1; i <= n; i++) {\n    numbers.push(i);\n  }\n  return numbers;\n}\n',
    tests: [
      { args: [1], expected: [1] },
      { args: [3], expected: [1, 2, 3] },
      { args: [5], expected: [1, 2, 3, 4, 5] },
    ],
  },
  {
    fn: 'sumTo',
    title: 'Sum of the first n',
    prompt: 'Return the sum of the natural numbers from 1 to n. sumTo(4) → 1 + 2 + 3 + 4 = 10.',
    starter: 'function sumTo(n) {\n  // your code here\n}\n',
    solution: '// The loop is fine; Gauss\'s closed form n(n+1)/2 is the elegant way.\nfunction sumTo(n) {\n  return n * (n + 1) / 2;\n}\n',
    tests: [
      { args: [1], expected: 1 },
      { args: [4], expected: 10 },
      { args: [100], expected: 5050 },
    ],
  },
  {
    fn: 'isNatural',
    title: 'Is it a natural number?',
    prompt: 'Return true if x is a natural number (a whole number 0, 1, 2, …) and false otherwise — reject negatives and non-integers like 2.5.',
    starter: 'function isNatural(x) {\n  // your code here\n}\n',
    solution: 'function isNatural(x) {\n  return Number.isInteger(x) && x >= 0;\n}\n',
    tests: [
      { args: [0], expected: true },
      { args: [7], expected: true },
      { args: [-3], expected: false },
      { args: [2.5], expected: false },
    ],
  },
  {
    fn: 'placeValue',
    title: 'Place value',
    prompt: 'Given a non-negative whole number and a place (0 = units, 1 = tens, 2 = hundreds, …), return the value contributed by the digit in that place. placeValue(374, 1) → 70.',
    starter: 'function placeValue(number, place) {\n  // your code here\n}\n',
    solution: 'function placeValue(number, place) {\n  const digit = Math.floor(number / 10 ** place) % 10;\n  return digit * 10 ** place;\n}\n',
    tests: [
      { args: [374, 0], expected: 4 },
      { args: [374, 1], expected: 70 },
      { args: [374, 2], expected: 300 },
      { args: [5, 1], expected: 0 },
    ],
  },
];

// Deep-equality good enough for the values these exercises return (numbers,
// booleans, and arrays of those). Uses JSON because the values are plain data.
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// Compactly renders a value the way the learner typed it, for result messages.
function show(value) {
  return JSON.stringify(value);
}

// Runs one exercise's code against its tests. Returns either an `error` string
// (code failed to define the function or threw while loading) or a list of
// per-test `results`.
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
  if (!userFn) {
    return { error: 'Define a function named "' + exercise.fn + '".' };
  }

  const results = exercise.tests.map(test => {
    let actual, thrown = null;
    try {
      actual = userFn(...test.args);
    } catch (e) {
      thrown = e.message;
    }
    const pass = !thrown && deepEqual(actual, test.expected);
    return { args: test.args, expected: test.expected, actual, thrown, pass };
  });
  return { results };
}

// Builds the results panel HTML for a finished run.
function renderResults(run) {
  if (run.error) {
    return '<div class="result-error">' + escapeHtml(run.error) + '</div>';
  }
  const passed = run.results.filter(r => r.pass).length;
  const total = run.results.length;
  const allPass = passed === total;
  const summary =
    '<div class="result-summary ' + (allPass ? 'all-pass' : 'some-fail') + '">' +
    (allPass ? '✓ All ' + total + ' tests passed!' : passed + ' / ' + total + ' tests passed') +
    '</div>';

  const cases = run.results.map(r => {
    const call = exerciseCall(r.args);
    if (r.thrown) {
      return '<div class="case fail"><span class="mark">✗</span>' + call +
        ' <span class="detail">threw: ' + escapeHtml(r.thrown) + '</span></div>';
    }
    const detail = r.pass
      ? '<span class="detail">→ ' + escapeHtml(show(r.actual)) + '</span>'
      : '<span class="detail">expected ' + escapeHtml(show(r.expected)) +
        ', got ' + escapeHtml(show(r.actual)) + '</span>';
    return '<div class="case ' + (r.pass ? 'pass' : 'fail') + '"><span class="mark">' +
      (r.pass ? '✓' : '✗') + '</span>' + call + ' ' + detail + '</div>';
  }).join('');

  return summary + cases;
}

// Renders the argument list of a single test case, e.g. "(374, 1)".
function exerciseCall(args) {
  return '<span>(' + args.map(show).join(', ').replace(/</g, '&lt;') + ')</span>';
}

// Escapes text destined for innerHTML so user errors can't inject markup.
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Builds the DOM for every exercise and wires up its Run / Reset buttons.
function buildExercises() {
  const container = document.getElementById('exercises');
  EXERCISES.forEach((exercise, index) => {
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

    // Run the learner's current code and show the graded results.
    card.querySelector('.run').addEventListener('click', () => {
      results.innerHTML = renderResults(runExercise(exercise, editor.value));
    });

    // Restore the starter code and clear any previous results.
    card.querySelector('.reset').addEventListener('click', () => {
      editor.value = exercise.starter;
      results.innerHTML = '';
    });

    container.appendChild(card);
  });
}

buildExercises();
