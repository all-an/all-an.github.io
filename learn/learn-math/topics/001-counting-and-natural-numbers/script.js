/* ── Number line ── */
(function buildNumberLine() {
  const svg = document.getElementById('number-line-svg');
  if (!svg) return;

  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const startX = 40;
  const step = 58;
  const y = 34;

  numbers.forEach((n, i) => {
    const x = startX + i * step;

    // tick
    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', x);
    tick.setAttribute('y1', y - 7);
    tick.setAttribute('x2', x);
    tick.setAttribute('y2', y + 7);
    tick.setAttribute('stroke', n === 0 ? '#005577' : '#1e4a1e');
    tick.setAttribute('stroke-width', '1.5');
    svg.appendChild(tick);

    // label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 22);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '11');
    text.setAttribute('font-family', 'Consolas, Monaco, monospace');
    text.setAttribute('fill', n === 0 ? '#005577' : '#2a6a2a');
    text.textContent = n;
    svg.appendChild(text);

    // dot
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', n === 0 ? '#003344' : '#0e2e0e');
    circle.setAttribute('stroke', n === 0 ? '#00ccff' : '#00ff88');
    circle.setAttribute('stroke-width', '1');
    svg.appendChild(circle);
  });

  // "…" label
  const ellipsis = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  const ex = startX + numbers.length * step - 20;
  ellipsis.setAttribute('x', ex);
  ellipsis.setAttribute('y', y + 5);
  ellipsis.setAttribute('font-size', '14');
  ellipsis.setAttribute('font-family', 'Consolas, Monaco, monospace');
  ellipsis.setAttribute('fill', '#1e4a1e');
  ellipsis.textContent = '…';
  svg.appendChild(ellipsis);
})();


/* ── Counter demo ── */
(function initCounter() {
  const display = document.getElementById('count-display');
  const info    = document.getElementById('counter-info');
  const btnInc  = document.getElementById('btn-increment');
  const btnRst  = document.getElementById('btn-reset');

  if (!display) return;

  let count = 0;

  const facts = [
    'Starting point: 0 is the additive identity.',
    'S(0) = 1 — your first successor!',
    'S(1) = 2',
    'S(2) = 3',
    'S(3) = 4',
    'S(4) = 5',
    'S(5) = 6',
    'S(6) = 7',
    'S(7) = 8',
    'S(8) = 9 — single digits are done.',
    'S(9) = 10 — now we need two digits.',
    'Notice how the pattern never stops.',
    'Every click is one successor step.',
    'No matter how high, there is always one more.',
    'This is what "infinite" means in practice.',
    'You could count forever and never finish.',
    'Mathematicians write this set as ℕ.',
    'The size of ℕ is called ℵ₀ (aleph-null).',
    'Still going? S(n) = n + 1, always.',
  ];

  function update() {
    display.textContent = count;
    display.classList.remove('bump');
    void display.offsetWidth; // reflow to restart animation
    display.classList.add('bump');

    const factIndex = Math.min(count, facts.length - 1);
    info.textContent = facts[factIndex] || `S(${count - 1}) = ${count}`;
  }

  btnInc.addEventListener('click', () => {
    count++;
    update();
  });

  btnRst.addEventListener('click', () => {
    count = 0;
    update();
  });

  // animate bump via CSS class removal
  display.addEventListener('animationend', () => {
    display.classList.remove('bump');
  });

  update();
})();


/* ── Successor explorer ── */
(function initSuccessor() {
  const input  = document.getElementById('succ-input');
  const result = document.getElementById('succ-result');

  if (!input) return;

  function render() {
    const raw = input.value.trim();
    const n = parseInt(raw, 10);

    if (raw === '' || isNaN(n) || n < 0) {
      result.innerHTML = '<span style="color:#444">Enter a non-negative integer.</span>';
      return;
    }

    const succ = n + 1;
    const prev = n > 0 ? `predecessor of ${n} = <span class="highlight">${n - 1}</span><br>` : '';
    result.innerHTML =
      `${prev}` +
      `S(${n}) = <span class="highlight">${succ}</span><br>` +
      `<span style="color:#333;font-size:0.8rem">S(S(${n})) = ${succ + 1} &nbsp;·&nbsp; S(S(S(${n}))) = ${succ + 2} &nbsp;·&nbsp; …</span>`;
  }

  input.addEventListener('input', render);
  render();
})();
