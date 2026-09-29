// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute the edit distance between two words.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Fill the DP table where cell (i, j) is the distance between the first i letters of one word and the first j of the other.
function editDistanceDemo(value) {
  const [a, b] = value.split(',').map(text => text.trim());
  if (b === undefined) throw new Error('need two strings');
  const table = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      table[i][j] = a[i - 1] === b[j - 1]
        ? table[i - 1][j - 1]
        : 1 + Math.min(table[i - 1][j - 1], table[i - 1][j], table[i][j - 1]);
    }
  }
  return String(table[a.length][b.length]);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = editDistanceDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
