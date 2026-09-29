// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: derive the alien alphabet from sorted words.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Compare each adjacent pair of words to find one ordering rule, then topologically sort the letters.
function alienOrderDemo(value) {
  const words = value.split(',').map(word => word.trim()).filter(word => word !== '');
  const after = new Map();
  const waiting = new Map();
  for (const word of words) {
    for (const char of word) {
      if (!after.has(char)) after.set(char, new Set());
      if (!waiting.has(char)) waiting.set(char, 0);
    }
  }
  for (let i = 0; i + 1 < words.length; i++) {
    const [first, second] = [words[i], words[i + 1]];
    if (first.length > second.length && first.startsWith(second)) return '✗ invalid';
    for (let j = 0; j < Math.min(first.length, second.length); j++) {
      if (first[j] !== second[j]) {
        if (!after.get(first[j]).has(second[j])) {
          after.get(first[j]).add(second[j]);
          waiting.set(second[j], waiting.get(second[j]) + 1);
        }
        break;
      }
    }
  }
  const ready = [...waiting].filter(([, count]) => count === 0).map(([char]) => char);
  let order = '';
  while (ready.length) {
    const char = ready.shift();
    order += char;
    for (const next of after.get(char)) {
      waiting.set(next, waiting.get(next) - 1);
      if (waiting.get(next) === 0) ready.push(next);
    }
  }
  return order.length === after.size ? order : '✗ invalid (cycle)';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = alienOrderDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
