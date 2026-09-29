// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the largest and smallest number in a comma-separated list.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Parse the list, then scan it once, tracking the smallest and largest value seen so far.
function findMinMax(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  if (numbers.length === 0) return '';
  let min = numbers[0];
  let max = numbers[0];
  for (const n of numbers) {
    if (n < min) min = n;
    if (n > max) max = n;
  }
  return 'min ' + min + ', max ' + max;
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = findMinMax(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
