// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: clone a graph and show that the copy has the same shape but new nodes.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the graph, deep-copy it with a DFS that remembers each original→copy pair, then verify and print the copy.
function cloneGraphDemo(value) {
  const nodes = value.split('|').map((_, i) => ({ id: i + 1, neighbors: [] }));
  value.split('|').forEach((row, i) => {
    nodes[i].neighbors = row.split(',').filter(x => x.trim() !== '').map(x => nodes[Number(x) - 1]);
  });
  const copies = new Map();
  const clone = node => {
    if (copies.has(node)) return copies.get(node);
    const copy = { id: node.id, neighbors: [] };
    copies.set(node, copy);
    copy.neighbors = node.neighbors.map(clone);
    return copy;
  };
  const start = clone(nodes[0]);
  const seen = new Set();
  const lines = [];
  const walk = node => {
    if (seen.has(node)) return;
    seen.add(node);
    lines.push(node.id + ' → ' + node.neighbors.map(n => n.id).join(','));
    node.neighbors.forEach(walk);
  };
  walk(start);
  const shared = [...seen].some(node => nodes.includes(node));
  return lines.join('   ') + (shared ? '   (shares nodes!)' : '   (all new nodes ✓)');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = cloneGraphDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
