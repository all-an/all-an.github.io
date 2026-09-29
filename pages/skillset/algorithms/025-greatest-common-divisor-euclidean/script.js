// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute the GCD of two numbers and show each step.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Run Euclid's algorithm, recording each remainder step.
function gcdSteps(value) {
  let [a, b] = value.split(',').map(Number);
  if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('bad input');
  const steps = [];
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    steps.push('gcd(' + a + ', ' + b + ')');
    [a, b] = [b, a % b];
  }
  return a + (steps.length ? '   (' + steps.join(' → ') + ')' : '');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = gcdSteps(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
