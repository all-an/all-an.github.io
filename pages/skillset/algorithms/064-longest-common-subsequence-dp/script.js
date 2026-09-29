// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the longest common subsequence of two strings.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Fill the DP table of prefix answers, then walk it backwards to recover one actual subsequence.
function lcsDemo(value) {
  const [a, b] = value.split(',').map(text => text.trim());
  if (b === undefined) throw new Error('need two strings');
  const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      table[i][j] = a[i - 1] === b[j - 1] ? table[i - 1][j - 1] + 1 : Math.max(table[i - 1][j], table[i][j - 1]);
    }
  }
  let subsequence = '';
  for (let i = a.length, j = b.length; i > 0 && j > 0;) {
    if (a[i - 1] === b[j - 1]) {
      subsequence = a[i - 1] + subsequence;
      i--;
      j--;
    } else if (table[i - 1][j] >= table[i][j - 1]) i--;
    else j--;
  }
  return 'length ' + table[a.length][b.length] + (subsequence ? '   "' + subsequence + '"' : '');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = lcsDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
