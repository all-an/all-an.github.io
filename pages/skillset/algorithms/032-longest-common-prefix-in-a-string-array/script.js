// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the longest common prefix of several words.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Compare column by column: stop at the first position where any word differs from the first.
function commonPrefix(value) {
  const words = value.split(',').map(word => word.trim()).filter(word => word !== '');
  if (words.length === 0) return '';
  for (let column = 0; column < words[0].length; column++) {
    for (const word of words) {
      if (word[column] !== words[0][column]) return '"' + words[0].slice(0, column) + '"';
    }
  }
  return '"' + words[0] + '"';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = commonPrefix(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
