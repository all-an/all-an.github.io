// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute a factorial and show the recursive expansion.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Compute n! recursively and describe the chain of calls it unwinds.
function factorialTrace(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 15) throw new Error('out of range');
  const factorial = k => (k <= 1 ? 1 : k * factorial(k - 1));
  const chain = [];
  for (let k = n; k > 1; k--) chain.push(k);
  return (chain.length ? chain.join(' × ') + ' × 1' : '1') + ' = ' + factorial(n);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = factorialTrace(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
