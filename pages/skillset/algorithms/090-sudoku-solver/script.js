// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: solve a Sudoku puzzle.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Backtrack cell by cell: try each legal digit, recurse, and erase it if the recursion fails.
function sudokuDemo(value) {
  const cells = [...value.replace(/\s/g, '').replace(/\./g, '0')].map(Number);
  if (cells.length !== 81 || cells.some(cell => !(cell >= 0 && cell <= 9))) throw new Error('need 81 digits');
  const isLegal = (index, digit) => {
    const row = Math.floor(index / 9);
    const column = index % 9;
    for (let i = 0; i < 9; i++) {
      if (cells[row * 9 + i] === digit || cells[i * 9 + column] === digit) return false;
      const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const boxColumn = 3 * Math.floor(column / 3) + (i % 3);
      if (cells[boxRow * 9 + boxColumn] === digit) return false;
    }
    return true;
  };
  const solve = () => {
    const index = cells.indexOf(0);
    if (index === -1) return true;
    for (let digit = 1; digit <= 9; digit++) {
      if (isLegal(index, digit)) {
        cells[index] = digit;
        if (solve()) return true;
        cells[index] = 0;
      }
    }
    return false;
  };
  return solve() ? cells.join('') : '✗ no solution';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = sudokuDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
