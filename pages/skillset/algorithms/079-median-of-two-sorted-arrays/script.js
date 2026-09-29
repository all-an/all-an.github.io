// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the median of two sorted lists.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Binary-search a partition of the shorter array so both halves of the merged data are balanced.
function medianDemo(value) {
  let [a, b] = value.split(';').map(part => part.split(',').filter(x => x.trim() !== '').map(Number));
  if (!b || a.some(Number.isNaN) || b.some(Number.isNaN) || a.length + b.length === 0) throw new Error('bad input');
  if (a.length > b.length) [a, b] = [b, a];
  let low = 0;
  let high = a.length;
  const half = Math.floor((a.length + b.length + 1) / 2);
  while (low <= high) {
    const cutA = Math.floor((low + high) / 2);
    const cutB = half - cutA;
    const maxLeftA = cutA === 0 ? -Infinity : a[cutA - 1];
    const minRightA = cutA === a.length ? Infinity : a[cutA];
    const maxLeftB = cutB === 0 ? -Infinity : b[cutB - 1];
    const minRightB = cutB === b.length ? Infinity : b[cutB];
    if (maxLeftA <= minRightB && maxLeftB <= minRightA) {
      const maxLeft = Math.max(maxLeftA, maxLeftB);
      if ((a.length + b.length) % 2 === 1) return String(maxLeft);
      return String((maxLeft + Math.min(minRightA, minRightB)) / 2);
    }
    if (maxLeftA > minRightB) high = cutA - 1;
    else low = cutA + 1;
  }
  throw new Error('inputs must be sorted');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = medianDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
