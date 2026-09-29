// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count the N-Queens solutions and show the first board.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Backtrack row by row, tracking attacked columns and diagonals in sets.
function nQueensDemo(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 9) throw new Error('out of range');
  const columns = new Set();
  const diagonals = new Set();
  const antiDiagonals = new Set();
  const placement = [];
  let count = 0;
  let first = null;
  const place = row => {
    if (row === n) {
      count++;
      if (!first) first = [...placement];
      return;
    }
    for (let column = 0; column < n; column++) {
      if (columns.has(column) || diagonals.has(row - column) || antiDiagonals.has(row + column)) continue;
      columns.add(column);
      diagonals.add(row - column);
      antiDiagonals.add(row + column);
      placement.push(column);
      place(row + 1);
      placement.pop();
      columns.delete(column);
      diagonals.delete(row - column);
      antiDiagonals.delete(row + column);
    }
  };
  place(0);
  return count + ' solutions' + (first ? '   first: [' + first.join(', ') + ']' : '');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = nQueensDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
