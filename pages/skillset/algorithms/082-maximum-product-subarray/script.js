// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the maximum product of a contiguous subarray.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Track both the largest and the smallest product ending at each position, since a negative can swap them.
function maxProductDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  if (numbers.length === 0) return '';
  let largest = numbers[0];
  let smallest = numbers[0];
  let best = numbers[0];
  for (let i = 1; i < numbers.length; i++) {
    const candidates = [numbers[i], largest * numbers[i], smallest * numbers[i]];
    largest = Math.max(...candidates);
    smallest = Math.min(...candidates);
    best = Math.max(best, largest);
  }
  return String(best);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = maxProductDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
