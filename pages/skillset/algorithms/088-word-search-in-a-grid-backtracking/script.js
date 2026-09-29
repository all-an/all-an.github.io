// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: search a grid for a word.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Start a depth-first search from every cell, marking cells as visited while on the path and restoring them after.
function wordSearchDemo(value) {
  const [gridText, wordText] = value.split(';');
  const word = (wordText || '').trim();
  const grid = gridText.split('/').map(row => [...row.trim()]);
  const search = (r, c, index) => {
    if (index === word.length) return true;
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[r].length || grid[r][c] !== word[index]) return false;
    const saved = grid[r][c];
    grid[r][c] = '#';
    const found = search(r + 1, c, index + 1) || search(r - 1, c, index + 1) || search(r, c + 1, index + 1) || search(r, c - 1, index + 1);
    grid[r][c] = saved;
    return found;
  };
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (word && search(r, c, 0)) return true;
    }
  }
  return false;
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && wordSearchDemo(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ found' : '✗ not found');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
