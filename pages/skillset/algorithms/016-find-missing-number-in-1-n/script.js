// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the missing number in a list drawn from 0..n.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Compare the expected total 0+1+…+n with the actual total of the list.
function findMissing(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  const n = numbers.length;
  const expected = n * (n + 1) / 2;
  return String(expected - numbers.reduce((total, x) => total + x, 0));
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = findMissing(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
