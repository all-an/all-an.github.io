// Renders a "solve" checklist page for the given language ('js' or 'java') and
// runs a timed coding session over the checked algorithms.
//
// Checklist ticks are saved per language in localStorage. Pressing Start opens a
// code editor for each checked algorithm in turn (optionally shuffled), each with
// a Run button, an output box, a Solution link, and a per-problem countdown that
// auto-advances when it hits zero.
//
// Real Java cannot run in the browser, so on the Java page Run transpiles the
// learner's Java to JavaScript (see java-to-js.js) and runs it against the same
// tests (see challenges.js). Java outside the transpiler's subset is reported
// instead of run.

// Longest call text shown in the output box before it is cut short, in characters.
const MAX_CALL_TEXT = 90;

function initSolvePage(lang) {
  const STORAGE_KEY = 'solve-' + lang + '-checked'; // ticked slugs, per language
  const tbody = document.getElementById('tbody');

  // ---- progress persistence --------------------------------------------------

  // Load the set of solved algorithm slugs from localStorage (empty on failure).
  function loadChecked() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []); }
    catch { return new Set(); }
  }
  const checked = loadChecked();

  function saveChecked() { localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked])); }

  function updateProgress() {
    document.getElementById('progress').textContent = `Solved: ${checked.size} / ${DATA.length}`;
  }

  // ---- render the checklist ---------------------------------------------------

  tbody.innerHTML = DATA.map((d, i) => {
    // Link the name to the local detail page (one level up) when it exists,
    // otherwise show it as plain text.
    const href = d.page ? '../' + d.page + '/' : null;
    const name = href ? `<a href="${href}">${d.n}</a>` : d.n;
    const isSolved = checked.has(d.slug);
    return `
      <tr class="${isSolved ? 'solved' : ''}">
        <td><input type="checkbox" class="solve-check" data-slug="${d.slug}"${isSolved ? ' checked' : ''} /></td>
        <td><span class="idx">${i + 1}</span></td>
        <td><div class="algo">${name}</div></td>
        <td><span class="diff ${diffClass[d.cat]}">${diffLabel[d.cat]}</span></td>
        <td><span class="tech">${d.tech}</span></td>
      </tr>`;
  }).join('');

  const checkAll = document.getElementById('checkAll');

  // Keep the header "select all" box in sync: ticked when every row is ticked,
  // indeterminate (a dash) when only some are.
  function syncCheckAll() {
    checkAll.checked = checked.size === DATA.length;
    checkAll.indeterminate = checked.size > 0 && checked.size < DATA.length;
  }

  // Header checkbox: tick or untick every algorithm at once.
  checkAll.addEventListener('change', () => {
    tbody.querySelectorAll('.solve-check').forEach(box => {
      box.checked = checkAll.checked;
      box.closest('tr').classList.toggle('solved', checkAll.checked);
      if (checkAll.checked) checked.add(box.dataset.slug); else checked.delete(box.dataset.slug);
    });
    saveChecked();
    updateProgress();
  });

  // Toggle and persist a row checkbox; keep its row, the counter and the header
  // box in sync.
  tbody.addEventListener('change', (event) => {
    const box = event.target;
    if (!box.classList.contains('solve-check')) return;
    if (box.checked) checked.add(box.dataset.slug); else checked.delete(box.dataset.slug);
    box.closest('tr').classList.toggle('solved', box.checked);
    saveChecked();
    updateProgress();
    syncCheckAll();
  });
  updateProgress();
  syncCheckAll();

  // ---- session over the checked algorithms -----------------------------------

  const listView = document.getElementById('listView');
  const session = document.getElementById('session');
  const editor = document.getElementById('editor');
  const output = document.getElementById('output');
  const sessionTitle = document.getElementById('sessionTitle');
  const sessionTimer = document.getElementById('sessionTimer');
  const solutionBtn = document.getElementById('solutionBtn');
  const progress = document.getElementById('progress');

  let queue = [];      // DATA entries to solve, in play order
  let current = 0;     // index into queue
  let countdownId = null;
  let remaining = 0;   // seconds left on the current problem

  // Parse the "mm:ss" (or plain minutes) time box into seconds; default 5 minutes.
  function parseTime(text) {
    const t = text.trim();
    if (t.includes(':')) {
      const [m, s] = t.split(':');
      return (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0);
    }
    return (parseInt(t, 10) || 5) * 60;
  }

  // Format a number of seconds as MM:SS.
  function formatTime(total) {
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  // Return a shuffled copy of an array (Fisher–Yates).
  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Start a session from the checked algorithms (optionally randomised).
  document.getElementById('startBtn').addEventListener('click', () => {
    let picked = DATA.filter(d => checked.has(d.slug));
    if (!picked.length) { progress.textContent = 'Tick at least one algorithm to start.'; return; }
    if (document.getElementById('randomChk').checked) picked = shuffled(picked);
    queue = picked;
    current = 0;
    listView.hidden = true;
    session.hidden = false;
    loadProblem();
  });

  // Load the current problem into the editor and (re)start its countdown.
  function loadProblem() {
    const d = queue[current];
    const spec = CHALLENGES[d.slug];
    sessionTitle.textContent = `${current + 1} / ${queue.length} · ${d.n}`;

    // Starter code for the typed language (or a generic stub when none is defined).
    if (spec) {
      editor.value = lang === 'java' ? spec.javaStarter : spec.jsStarter;
    } else {
      editor.value = lang === 'java'
        ? '// Type your Java solution here.\n'
        : '// Type your JavaScript solution here.\n';
    }
    output.textContent = '';

    // Solution link → the local detail page if it exists; hidden otherwise.
    if (d.page) {
      solutionBtn.href = '../' + d.page + '/';
      solutionBtn.hidden = false;
    } else {
      solutionBtn.removeAttribute('href');
      solutionBtn.hidden = true;
    }

    startCountdown();
  }

  // (Re)start the per-problem countdown from the value in the time box.
  function startCountdown() {
    clearInterval(countdownId);
    remaining = parseTime(document.getElementById('timeInput').value);
    sessionTimer.textContent = formatTime(remaining);
    sessionTimer.classList.remove('up');
    countdownId = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(countdownId);
        sessionTimer.textContent = '00:00';
        sessionTimer.classList.add('up');
        goNext(); // time's up → move on to the next problem
        return;
      }
      sessionTimer.textContent = formatTime(remaining);
    }, 1000);
  }

  // Run button: execute the editor's code and show the result.
  document.getElementById('runBtn').addEventListener('click', () => {
    const spec = CHALLENGES[queue[current].slug];
    output.textContent = runCode(spec, editor.value);
  });

  // Advance to the next problem, or end the session after the last one.
  function goNext() {
    if (current < queue.length - 1) { current++; loadProblem(); }
    else endSession(true);
  }
  document.getElementById('nextBtn').addEventListener('click', goNext);
  document.getElementById('endBtn').addEventListener('click', () => endSession(false));

  // Leave the session and return to the checklist.
  function endSession(finished) {
    clearInterval(countdownId);
    session.hidden = true;
    listView.hidden = false;
    updateProgress();
    if (finished) progress.textContent = `Session complete — ${queue.length} attempted.`;
  }

  // Insert two spaces on Tab instead of moving focus out of the editor.
  editor.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const start = editor.selectionStart, end = editor.selectionEnd;
    editor.value = editor.value.slice(0, start) + '  ' + editor.value.slice(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
  });

  // ---- running code ----------------------------------------------------------

  // Run code for one problem and return the text to show in the output box.
  function runCode(spec, code) {
    // Turn the editor's code into runnable JS — on the Java page that means
    // transpiling it (see java-to-js.js); on the JS page it runs as-is.
    let jsCode;
    try {
      jsCode = lang === 'java' ? transpileJava(code) : code;
    } catch (err) {
      return 'Transpile error: ' + err.message;
    }

    // No runnable spec yet: run the code for its console output.
    if (!spec) {
      if (lang === 'java') return 'Your Java transpiled OK, but there is no test harness for this algorithm yet.\nClick Solution for the explanation.';
      return runConsole(jsCode);
    }

    // Build the learner's function (plus any helper functions the spec names).
    const symbolNames = [spec.fn, ...(spec.helpers || [])];
    let symbols;
    try {
      symbols = new Function(jsCode + '\nreturn [' + symbolNames.map(name => `typeof ${name} === "function" ? ${name} : null`).join(', ') + '];')();
    } catch (err) {
      return 'Error: ' + err.message;
    }
    const missing = symbolNames.filter((name, i) => symbols[i] === null);
    if (missing.length) return `Define ${missing.join(' and ')} (see the starter code).`;

    // The learner's code and the reference are both run through the same pipeline,
    // so the reference never has to match the learner's function signature.
    const learner = { fn: symbols[0], helpers: Object.fromEntries(symbolNames.map((name, i) => [name, symbols[i]])) };
    const reference = spec.helpers
      ? { fn: spec.reference[spec.fn], helpers: spec.reference }
      : { fn: spec.reference, helpers: {} };

    let passed = 0;
    const lines = spec.tests.map(args => {
      const call = callText(spec.fn, args);
      const expected = runImplementation(spec, reference, args);
      let got;
      try { got = runImplementation(spec, learner, args); }
      catch (err) { return `✗ ${call} threw ${err.message}`; }
      const ok = JSON.stringify(got) === JSON.stringify(expected);
      if (ok) passed++;
      return `${ok ? '✓' : '✗'} ${call} → ${JSON.stringify(got)}`
           + (ok ? '' : ` (expected ${JSON.stringify(expected)})`);
    });
    const note = lang === 'java' ? '\n(Your Java was transpiled to JavaScript and run.)' : '';
    return lines.join('\n') + `\n\n${passed} / ${spec.tests.length} passed` + note;
  }

  // Run one implementation on a fresh copy of the test inputs (so in-place edits
  // never leak between runs), through the spec's optional adapters:
  //   prepare   - turn the plain test arguments into the real arguments (e.g. build a tree)
  //   exec      - call the implementation (default: fn(...args)); also gets the helper functions
  //   finish    - turn the raw result into plain data (e.g. read a list back into an array)
  //   normalize - put unordered results into a canonical order before comparing
  function runImplementation(spec, implementation, args) {
    const prepare = spec.prepare || (a => a);
    const exec = spec.exec || ((fn, a) => fn(...a));
    const finish = spec.finish || (result => result);
    const normalize = spec.normalize || (result => result);
    return normalize(finish(exec(implementation.fn, prepare(structuredClone(args)), implementation.helpers)));
  }

  // Render a call like reverse("hello") for the output lines, shortened when the
  // arguments are large (a whole Sudoku board, say).
  function callText(fn, args) {
    const text = `${fn}(${args.map(a => JSON.stringify(a)).join(', ')})`;
    return text.length > MAX_CALL_TEXT ? text.slice(0, MAX_CALL_TEXT) + '…)' : text;
  }

  // Generic JS runner: execute code with a captured console.log.
  function runConsole(code) {
    const logs = [];
    const fakeConsole = { log: (...a) => logs.push(a.map(String).join(' ')) };
    try {
      new Function('console', code)(fakeConsole);
    } catch (err) {
      return 'Error: ' + err.message;
    }
    return logs.join('\n') || '(no console output)';
  }
}
