// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the maximum-sum contiguous subarray.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Run Kadane's algorithm, tracking the subarray boundaries of the best sum.
function kadaneDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  if (numbers.length === 0) return '';
  let best = numbers[0];
  let current = numbers[0];
  let start = 0;
  let bestStart = 0;
  let bestEnd = 0;
  for (let i = 1; i < numbers.length; i++) {
    if (current < 0) {
      current = numbers[i];
      start = i;
    } else {
      current += numbers[i];
    }
    if (current > best) {
      best = current;
      bestStart = start;
      bestEnd = i;
    }
  }
  return 'sum ' + best + '   [' + numbers.slice(bestStart, bestEnd + 1).join(', ') + ']';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = kadaneDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
