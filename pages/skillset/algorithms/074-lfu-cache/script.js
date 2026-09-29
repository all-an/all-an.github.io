// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: simulate an LFU cache and see what gets evicted.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Replay the operations, tracking each key's use count and evicting the lowest count (oldest first on a tie).
function lfuDemo(value) {
  const [capacityText, opsText] = value.split(';');
  const capacity = Number(capacityText);
  if (!Number.isInteger(capacity) || capacity < 1) throw new Error('bad capacity');
  const entries = new Map(); // key -> { value, uses, tick }
  let clock = 0;
  const results = [];
  for (const op of (opsText || '').split(',').map(part => part.trim().split(/\s+/)).filter(parts => parts[0] !== '')) {
    if (op[0] === 'get') {
      const entry = entries.get(op[1]);
      if (entry) {
        entry.uses++;
        entry.tick = ++clock;
      }
      results.push(entry ? entry.value : -1);
    } else if (op[0] === 'put') {
      const entry = entries.get(op[1]);
      if (entry) {
        entry.value = op[2];
        entry.uses++;
        entry.tick = ++clock;
      } else {
        if (entries.size === capacity) {
          const victim = [...entries].sort((a, b) => a[1].uses - b[1].uses || a[1].tick - b[1].tick)[0][0];
          entries.delete(victim);
        }
        entries.set(op[1], { value: op[2], uses: 1, tick: ++clock });
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
    demoOutput.textContent = lfuDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
