// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: remove duplicates from a comma-separated list, keeping the first occurrence.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Keep an item only the first time it is seen, tracked with a Set.
function removeDuplicates(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  return [...new Set(items)].join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = removeDuplicates(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
