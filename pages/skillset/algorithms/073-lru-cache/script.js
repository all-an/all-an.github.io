// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: simulate an LRU cache and see what gets evicted.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Replay the operations on a Map, whose insertion order doubles as the recency order.
function lruDemo(value) {
  const [capacityText, opsText] = value.split(';');
  const capacity = Number(capacityText);
  if (!Number.isInteger(capacity) || capacity < 1) throw new Error('bad capacity');
  const cache = new Map();
  const results = [];
  for (const op of (opsText || '').split(',').map(part => part.trim().split(/\s+/)).filter(parts => parts[0] !== '')) {
    if (op[0] === 'put') {
      cache.delete(op[1]);
      cache.set(op[1], op[2]);
      if (cache.size > capacity) cache.delete(cache.keys().next().value);
    } else if (op[0] === 'get') {
      if (cache.has(op[1])) {
        const found = cache.get(op[1]);
        cache.delete(op[1]);
        cache.set(op[1], found);
        results.push(found);
      } else {
        results.push(-1);
      }
    } else {
      throw new Error('unknown operation');
    }
  }
  return results.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = lruDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
