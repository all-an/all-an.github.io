// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the first non-repeating character.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Count every character, then return the first one whose count is exactly one.
function firstUnique(value) {
  const counts = new Map();
  for (const char of value) counts.set(char, (counts.get(char) || 0) + 1);
  for (const char of value) {
    if (counts.get(char) === 1) return "'" + char + "'";
  }
  return value ? 'none' : '';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = firstUnique(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
