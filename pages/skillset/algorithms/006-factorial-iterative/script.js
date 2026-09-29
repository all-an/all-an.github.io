// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute the factorial of the typed number.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Multiply 1 × 2 × … × n with BigInt so results past 2^53 stay exact.
function factorial(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 20) throw new Error('out of range');
  let result = 1n;
  for (let i = 2n; i <= BigInt(n); i++) result *= i;
  return result.toString();
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = factorial(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
