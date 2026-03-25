/* ── Times table ── */
(function buildTimesTable() {
  const table = document.getElementById('times-table');
  if (!table) return;

  const headRow = document.createElement('tr');
  const corner = document.createElement('th');
  corner.textContent = '×';
  headRow.appendChild(corner);
  for (let c = 1; c <= 10; c++) {
    const th = document.createElement('th');
    th.textContent = c;
    headRow.appendChild(th);
  }
  table.appendChild(headRow);

  for (let r = 1; r <= 10; r++) {
    const row = document.createElement('tr');
    const rh = document.createElement('th');
    rh.textContent = r;
    row.appendChild(rh);
    for (let c = 1; c <= 10; c++) {
      const td = document.createElement('td');
      td.textContent = r * c;
      if (r === c) td.classList.add('square');
      row.appendChild(td);
    }
    table.appendChild(row);
  }

  table.addEventListener('mouseover', e => {
    const td = e.target.closest('td');
    if (!td) return;
    const row = td.parentElement;
    const colIdx = [...row.children].indexOf(td);
    table.querySelectorAll('td.highlight').forEach(el => el.classList.remove('highlight'));
    [...row.querySelectorAll('td')].forEach(el => el.classList.add('highlight'));
    table.querySelectorAll('tr').forEach(tr => {
      const cell = tr.children[colIdx];
      if (cell && cell.tagName === 'TD') cell.classList.add('highlight');
    });
  });

  table.addEventListener('mouseleave', () => {
    table.querySelectorAll('td.highlight').forEach(el => el.classList.remove('highlight'));
  });
})();


/* ── Calculator demo ── */
(function initCalc() {
  const inpA   = document.getElementById('inp-a');
  const inpB   = document.getElementById('inp-b');
  const inpOp  = document.getElementById('inp-op');
  const resEl  = document.getElementById('calc-result');
  const noteEl = document.getElementById('calc-note');
  if (!inpA) return;

  function update() {
    const a  = parseFloat(inpA.value) || 0;
    const b  = parseFloat(inpB.value) || 0;
    const op = inpOp.value;

    if (op !== 'mul' && b === 0) {
      resEl.textContent = 'undefined';
      noteEl.textContent = 'Division by zero is undefined.';
      return;
    }

    let result, note = '';
    switch (op) {
      case 'mul':
        result = a * b;
        note = `${a} added to itself ${b} times`;
        break;
      case 'div':
        result = a / b;
        note = 'true division (float)';
        break;
      case 'floordiv':
        result = Math.floor(a / b);
        note = `floor(${a}/${b}) = ${result}  →  remainder ${a - result * b}`;
        break;
      case 'mod':
        result = a - Math.floor(a / b) * b;
        note = `${a} = ${Math.floor(a / b)} × ${b} + ${result}`;
        break;
    }

    resEl.textContent = Number.isInteger(result) ? result : result.toFixed(4).replace(/\.?0+$/, '');
    noteEl.textContent = note;
  }

  inpA.addEventListener('input', update);
  inpB.addEventListener('input', update);
  inpOp.addEventListener('change', update);
  update();
})();


/* ── Factor explorer ── */
(function initFactors() {
  const input    = document.getElementById('factor-input');
  const resultEl = document.getElementById('factor-result');
  const noteEl   = document.getElementById('factor-note');
  if (!input) return;

  function factors(n) {
    const list = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) { list.push(i); if (i !== n / i) list.push(n / i); }
    }
    return list.sort((a, b) => a - b);
  }

  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  }

  function primeFactors(n) {
    const pf = []; let d = 2;
    while (d * d <= n) {
      while (n % d === 0) { pf.push(d); n = Math.floor(n / d); }
      d++;
    }
    if (n > 1) pf.push(n);
    return pf;
  }

  function render() {
    const n = parseInt(input.value, 10);
    resultEl.innerHTML = ''; noteEl.textContent = '';
    if (!n || n < 1 || n > 10000) { noteEl.textContent = 'Enter a number between 1 and 10 000.'; return; }

    const fs = factors(n);
    fs.forEach(f => {
      const chip = document.createElement('span');
      chip.textContent = f;
      chip.style.cssText = `background:#111;border:1px solid ${isPrime(f) ? '#1e4a1e' : '#1e1e1e'};border-radius:4px;padding:4px 10px;font-size:0.82rem;color:${isPrime(f) ? '#00ff88' : '#555'}`;
      resultEl.appendChild(chip);
    });

    const pf = primeFactors(n);
    noteEl.textContent = isPrime(n)
      ? `${n} is prime — only factors are 1 and itself.`
      : `Prime factorization: ${n} = ${pf.join(' × ')}  ·  ${fs.length} factors total`;
  }

  input.addEventListener('input', render);
  render();
})();


/* ── Copy buttons ── */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pre = document.getElementById(btn.dataset.target);
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = 'copied'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1800);
    });
  });
});
