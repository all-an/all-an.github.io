// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: list all subsets of a comma-separated set.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Treat each subset as a bitmask over the items: bit i set means item i is included.
function powerSetDemo(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  if (items.length > 8) throw new Error('too many items');
  const subsets = [];
  for (let mask = 0; mask < (1 << items.length); mask++) {
    const subset = items.filter((_, i) => mask & (1 << i));
    subsets.push('{' + subset.join(',') + '}');
  }
  return subsets.join(' ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = powerSetDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
