// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count the islands in a grid.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Scan every cell; each unvisited land cell starts a new island, which a flood fill then sinks.
function countIslands(value) {
  const grid = value.split('/').map(row => [...row.trim()]);
  if (grid.some(row => row.some(cell => cell !== '0' && cell !== '1'))) throw new Error('bad grid');
  let islands = 0;
  const sink = (r, c) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[r].length || grid[r][c] !== '1') return;
    grid[r][c] = '0';
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === '1') {
        islands++;
        sink(r, c);
      }
    }
  }
  return String(islands);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = countIslands(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
