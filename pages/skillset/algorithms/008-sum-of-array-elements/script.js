// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: add up a comma-separated list of numbers.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Parse the list and add the numbers into a running total.
function sum(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  let total = 0;
  for (const n of numbers) total += n;
  return String(total);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = sum(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
