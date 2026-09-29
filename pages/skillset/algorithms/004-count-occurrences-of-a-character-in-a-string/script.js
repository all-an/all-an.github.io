// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count how often each character appears in the typed text.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Tally every character in a map, then print the counts in first-seen order.
function countCharacters(value) {
  const counts = new Map();
  for (const char of value) {
    counts.set(char, (counts.get(char) || 0) + 1);
  }
  return [...counts].map(([char, count]) => char + ':' + count).join('  ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = countCharacters(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
