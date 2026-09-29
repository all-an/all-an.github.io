// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: merge overlapping intervals.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Sort by start, then either extend the last merged interval or begin a new one.
function mergeIntervalsDemo(value) {
  const intervals = value.split(',').filter(part => part.trim() !== '').map(part => part.split('-').map(Number));
  if (intervals.some(pair => pair.length !== 2 || pair.some(Number.isNaN))) throw new Error('bad input');
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged.map(([start, end]) => start + '-' + end).join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = mergeIntervalsDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
