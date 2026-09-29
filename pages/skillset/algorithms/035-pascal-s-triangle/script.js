// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: draw the first n rows of Pascal's triangle.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build each row from the previous one by summing adjacent pairs.
function pascalRows(value) {
  const rowCount = Number(value);
  if (!Number.isInteger(rowCount) || rowCount < 0 || rowCount > 12) throw new Error('out of range');
  const rows = [];
  for (let r = 0; r < rowCount; r++) {
    const row = [1];
    for (let c = 1; c < r; c++) row.push(rows[r - 1][c - 1] + rows[r - 1][c]);
    if (r > 0) row.push(1);
    rows.push(row);
  }
  return rows.map(row => '[' + row.join(', ') + ']').join(' ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = pascalRows(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
