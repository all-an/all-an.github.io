// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the length of the longest increasing subsequence.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Maintain the "tails" array: tails[i] is the smallest possible last value of an increasing subsequence of length i + 1.
function lisDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  const tails = [];
  for (const number of numbers) {
    let low = 0;
    let high = tails.length;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (tails[middle] < number) low = middle + 1;
      else high = middle;
    }
    tails[low] = number;
  }
  return 'length ' + tails.length + '   tails [' + tails.join(', ') + ']';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = lisDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
