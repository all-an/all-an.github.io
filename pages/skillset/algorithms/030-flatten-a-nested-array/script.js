// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: flatten a nested array typed as JSON.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Parse the JSON, then flatten it recursively: arrays are opened up, other values are kept.
function flattenDemo(value) {
  const flatten = items => items.flatMap(item => (Array.isArray(item) ? flatten(item) : [item]));
  return JSON.stringify(flatten(JSON.parse(value))).replace(/,/g, ', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = flattenDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
