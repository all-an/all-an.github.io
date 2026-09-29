// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute the maximum of every sliding window.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Keep a deque of indices whose values decrease, so its front always holds the current window's maximum.
function slidingMaxDemo(value) {
  const [list, kText] = value.split(';');
  const numbers = list.split(',').filter(part => part.trim() !== '').map(Number);
  const k = Number(kText);
  if (kText === undefined || numbers.some(Number.isNaN) || !Number.isInteger(k) || k < 1) throw new Error('bad input');
  const deque = [];
  const maximums = [];
  for (let i = 0; i < numbers.length; i++) {
    if (deque.length && deque[0] <= i - k) deque.shift();
    while (deque.length && numbers[deque[deque.length - 1]] <= numbers[i]) deque.pop();
    deque.push(i);
    if (i >= k - 1) maximums.push(numbers[deque[0]]);
  }
  return maximums.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = slidingMaxDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
