// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: list the Fibonacci numbers up to the typed position.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Roll two variables forward n times, collecting each value on the way.
function fibonacci(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 50) throw new Error('out of range');
  let previous = 0;
  let current = 1;
  const sequence = [0];
  for (let i = 1; i <= n; i++) {
    sequence.push(current);
    [previous, current] = [current, previous + current];
  }
  return 'F(' + n + ') = ' + sequence[n] + '   [' + sequence.join(', ') + ']';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = fibonacci(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
