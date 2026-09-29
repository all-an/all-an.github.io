// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: rotate a list to the right by k steps.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Rotate with the three-reversals trick: reverse all, then reverse each of the two parts.
function rotateDemo(value) {
  const [list, kText] = value.split(';');
  const numbers = list.split(',').filter(part => part.trim() !== '').map(Number);
  const k = Number(kText);
  if (kText === undefined || numbers.some(Number.isNaN) || !Number.isInteger(k)) throw new Error('bad input');
  const steps = ((k % numbers.length) + numbers.length) % numbers.length;
  const reverse = (from, to) => {
    for (; from < to; from++, to--) [numbers[from], numbers[to]] = [numbers[to], numbers[from]];
  };
  reverse(0, numbers.length - 1);
  reverse(0, steps - 1);
  reverse(steps, numbers.length - 1);
  return numbers.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = rotateDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
