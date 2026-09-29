// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: convert a Roman numeral to a number.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Add each symbol's value, but subtract it when a larger symbol follows.
function romanToInt(value) {
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const text = value.trim().toUpperCase();
  let total = 0;
  for (let i = 0; i < text.length; i++) {
    const current = values[text[i]];
    if (current === undefined) throw new Error('not a Roman numeral');
    const next = values[text[i + 1]];
    total += next > current ? -current : current;
  }
  return text ? String(total) : '';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = romanToInt(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
