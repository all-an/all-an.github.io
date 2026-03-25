/* ── Number line ── */
(function buildNumberLine() {
  const svg = document.getElementById('nl-svg');
  if (!svg) return;

  const W = 680, CX = 340, Y = 36, STEP = 52;
  const visible = 12; // numbers to show each side
  const MIN = -6, MAX = 13;

  // axis
  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  axis.setAttribute('x1', 10); axis.setAttribute('y1', Y);
  axis.setAttribute('x2', W - 14); axis.setAttribute('y2', Y);
  axis.setAttribute('stroke', '#1e1e1e'); axis.setAttribute('stroke-width', '1.5');
  svg.appendChild(axis);

  // arrow right
  const arr = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  arr.setAttribute('points', `${W - 14},${Y} ${W - 24},${Y - 5} ${W - 24},${Y + 5}`);
  arr.setAttribute('fill', '#1e1e1e');
  svg.appendChild(arr);

  function xOf(n) { return CX + n * STEP; }

  for (let n = MIN; n <= MAX; n++) {
    const x = xOf(n);
    if (x < 0 || x > W) continue;

    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tick.setAttribute('x1', x); tick.setAttribute('y1', Y - 6);
    tick.setAttribute('x2', x); tick.setAttribute('y2', Y + 6);
    tick.setAttribute('stroke', n === 0 ? '#1a3a4a' : '#1e2e1e');
    tick.setAttribute('stroke-width', '1.5');
    svg.appendChild(tick);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x); dot.setAttribute('cy', Y); dot.setAttribute('r', '3');
    dot.setAttribute('fill', n === 0 ? '#001a22' : '#0a0a0a');
    dot.setAttribute('stroke', n === 0 ? '#00ccff' : '#1e4a1e');
    dot.setAttribute('stroke-width', '1');
    svg.appendChild(dot);

    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', x); lbl.setAttribute('y', Y + 22);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('font-size', '10');
    lbl.setAttribute('font-family', 'Consolas, Monaco, monospace');
    lbl.setAttribute('fill', n === 0 ? '#005577' : '#2a4a2a');
    lbl.textContent = n;
    svg.appendChild(lbl);
  }

  // arc + result dot (updated live)
  let arc, resultDot, resultLbl;

  function drawArc(a, op, b) {
    // remove old
    if (arc)       { arc.forEach(el => el.remove()); }
    if (resultDot) { resultDot.remove(); }
    if (resultLbl) { resultLbl.remove(); }

    const result = op === '+' ? a + b : a - b;
    const x1 = xOf(a), x2 = xOf(result);

    // starting dot highlight
    const sd = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    sd.setAttribute('cx', x1); sd.setAttribute('cy', Y); sd.setAttribute('r', '5');
    sd.setAttribute('fill', 'none'); sd.setAttribute('stroke', '#00ff88'); sd.setAttribute('stroke-width', '1.5');
    svg.appendChild(sd);

    // arc path
    if (x1 !== x2) {
      const mx = (x1 + x2) / 2;
      const h  = Math.min(Math.abs(x2 - x1) * 0.35, 28);
      const ay = Y - h;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${Y} Q ${mx} ${ay} ${x2} ${Y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', op === '+' ? '#00ff88' : '#00ccff');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-dasharray', '4 3');
      svg.appendChild(path);
      arc = [sd, path];
    } else {
      arc = [sd];
    }

    // result dot
    resultDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    resultDot.setAttribute('cx', x2); resultDot.setAttribute('cy', Y); resultDot.setAttribute('r', '5');
    resultDot.setAttribute('fill', op === '+' ? '#00ff88' : '#00ccff');
    svg.appendChild(resultDot);

    // result label above
    resultLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    resultLbl.setAttribute('x', x2); resultLbl.setAttribute('y', Y - 12);
    resultLbl.setAttribute('text-anchor', 'middle');
    resultLbl.setAttribute('font-size', '11');
    resultLbl.setAttribute('font-family', 'Consolas, Monaco, monospace');
    resultLbl.setAttribute('fill', op === '+' ? '#00ff88' : '#00ccff');
    resultLbl.textContent = result;
    svg.appendChild(resultLbl);
  }

  // wire inputs
  const inpA  = document.getElementById('inp-a');
  const inpB  = document.getElementById('inp-b');
  const inpOp = document.getElementById('inp-op');
  const resEl = document.getElementById('calc-result');
  const noteEl = document.getElementById('calc-note');

  function update() {
    const a  = parseInt(inpA.value, 10)  || 0;
    const b  = parseInt(inpB.value, 10)  || 0;
    const op = inpOp.value;
    const r  = op === '+' ? a + b : a - b;
    resEl.textContent = r;

    const outOfRange = xOf(a) < 0 || xOf(a) > W || xOf(r) < 0 || xOf(r) > W;
    noteEl.textContent = outOfRange
      ? 'number outside visible range — try values between −6 and 13'
      : '';

    if (!outOfRange) drawArc(a, op, b);
    else { if (arc) arc.forEach(e => e.remove()); if (resultDot) resultDot.remove(); if (resultLbl) resultLbl.remove(); arc = null; }
  }

  inpA.addEventListener('input', update);
  inpB.addEventListener('input', update);
  inpOp.addEventListener('change', update);
  update();
})();


/* ── Copy buttons ── */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pre = document.getElementById(btn.dataset.target);
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      btn.textContent = 'copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'copy'; btn.classList.remove('copied'); }, 1800);
    });
  });
});
