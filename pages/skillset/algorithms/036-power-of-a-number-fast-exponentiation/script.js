// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute a power by repeated squaring.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Square the base and halve the exponent, multiplying into the result whenever the exponent is odd.
function fastPower(value) {
  const [base, exponent] = value.split(',').map(Number);
  if (Number.isNaN(base) || !Number.isInteger(exponent) || exponent < 0) throw new Error('bad input');
  let result = 1;
  let square = base;
  let remaining = exponent;
  while (remaining > 0) {
    if (remaining % 2 === 1) result *= square;
    square *= square;
    remaining = Math.floor(remaining / 2);
  }
  return String(result);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = fastPower(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
