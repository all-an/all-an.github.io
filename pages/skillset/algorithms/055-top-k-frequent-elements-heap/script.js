// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the k most frequent elements.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Count each value, then keep the k with the highest counts.
function topKDemo(value) {
  const [list, kText] = value.split(';');
  const numbers = list.split(',').filter(part => part.trim() !== '').map(Number);
  const k = Number(kText);
  if (kText === undefined || numbers.some(Number.isNaN) || !Number.isInteger(k) || k < 1) throw new Error('bad input');
  const counts = new Map();
  for (const n of numbers) counts.set(n, (counts.get(n) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, k).map(([n, count]) => n + ' ×' + count).join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = topKDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
