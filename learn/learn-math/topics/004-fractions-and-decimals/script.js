/* ── Shared helpers ── */
function gcd(a, b) {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function simplify(num, den) {
  if (den === 0) return [null, null];
  const g = gcd(Math.abs(num), Math.abs(den));
  return [num / g, den / g];
}


/* ── Fraction bar visualization ── */
(function initFracBar() {
  const numSlider = document.getElementById('frac-num');
  const denSlider = document.getElementById('frac-den');
  const numVal    = document.getElementById('num-val');
  const denVal    = document.getElementById('den-val');
  const label     = document.getElementById('frac-label');
  const simp      = document.getElementById('frac-simp');
  const fill      = document.getElementById('frac-fill');
  const note      = document.getElementById('frac-note');
  if (!numSlider) return;

  function render() {
    const num = parseInt(numSlider.value, 10);
    const den = parseInt(denSlider.value, 10);
    numVal.textContent = num;
    denVal.textContent = den;
    label.textContent  = `${num}/${den}`;

    const [sn, sd] = simplify(num, den);
    simp.textContent = (sn === sd) ? `${sn}/${sd} = 1` : `${sn}/${sd}`;

    const pct = Math.min((num / den) * 100, 100);
    fill.style.width = pct + '%';

    const decimal = (num / den).toFixed(4).replace(/\.?0+$/, '');
    const pctStr  = ((num / den) * 100).toFixed(2).replace(/\.?0+$/, '');
    note.textContent = `${num}/${den} = ${decimal} = ${pctStr}%`;
  }

  numSlider.addEventListener('input', render);
  denSlider.addEventListener('input', render);
  render();
})();


/* ── Fraction calculator ── */
(function initCalc() {
  const n1El  = document.getElementById('calc-n1');
  const d1El  = document.getElementById('calc-d1');
  const n2El  = document.getElementById('calc-n2');
  const d2El  = document.getElementById('calc-d2');
  const opEl  = document.getElementById('calc-op');
  const resN  = document.getElementById('res-num');
  const resD  = document.getElementById('res-den');
  const decEl = document.getElementById('calc-decimal');
  const noteEl = document.getElementById('calc-note');
  if (!n1El) return;

  function update() {
    const n1 = parseInt(n1El.value, 10) || 0;
    const d1 = parseInt(d1El.value, 10) || 0;
    const n2 = parseInt(n2El.value, 10) || 0;
    const d2 = parseInt(d2El.value, 10) || 0;
    const op = opEl.value;

    if (d1 === 0 || d2 === 0 || (op === 'div' && n2 === 0)) {
      resN.textContent = '?'; resD.textContent = '?';
      decEl.textContent = '';
      noteEl.textContent = 'Denominator cannot be zero.';
      return;
    }

    let rn, rd;
    switch (op) {
      case 'add': [rn, rd] = simplify(n1 * d2 + n2 * d1, d1 * d2); break;
      case 'sub': [rn, rd] = simplify(n1 * d2 - n2 * d1, d1 * d2); break;
      case 'mul': [rn, rd] = simplify(n1 * n2, d1 * d2); break;
      case 'div': [rn, rd] = simplify(n1 * d2, d1 * n2); break;
    }

    resN.textContent = rn;
    resD.textContent = rd;
    const decimal = (rn / rd).toFixed(6).replace(/\.?0+$/, '');
    decEl.textContent = `≈ ${decimal}`;
    noteEl.textContent = rd === 1 ? `Result is the whole number ${rn}.` : '';
  }

  [n1El, d1El, n2El, d2El, opEl].forEach(el => el.addEventListener('input', update));
  update();
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
