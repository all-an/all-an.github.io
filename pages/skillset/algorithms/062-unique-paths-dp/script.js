// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count the paths across a grid.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Fill a one-row table where each cell adds the paths from above and from the left.
function uniquePathsDemo(value) {
  const [rows, columns] = value.split(',').map(Number);
  if (!Number.isInteger(rows) || !Number.isInteger(columns) || rows < 1 || columns < 1 || rows > 30 || columns > 30) throw new Error('out of range');
  const paths = new Array(columns).fill(1);
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < columns; c++) paths[c] += paths[c - 1];
  }
  return String(paths[columns - 1]);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = uniquePathsDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
