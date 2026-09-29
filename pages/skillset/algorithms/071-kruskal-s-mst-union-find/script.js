// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: build a minimum spanning tree with Kruskal's algorithm.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Sort the edges, then use Union-Find to accept an edge only when it joins two separate components.
function kruskalDemo(value) {
  const edges = value.split(',').map(part => part.trim().split(/[-:]/).map(Number));
  if (edges.some(edge => edge.length !== 3 || edge.some(Number.isNaN))) throw new Error('bad input');
  const size = Math.max(...edges.flatMap(([a, b]) => [a, b])) + 1;
  const parent = Array.from({ length: size }, (_, i) => i);
  const find = node => (parent[node] === node ? node : (parent[node] = find(parent[node])));
  const chosen = [];
  let total = 0;
  for (const [a, b, weight] of [...edges].sort((x, y) => x[2] - y[2])) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) {
      parent[rootA] = rootB;
      chosen.push(a + '-' + b);
      total += weight;
    }
  }
  return chosen.length === size - 1 ? 'weight ' + total + '   edges ' + chosen.join(' ') : '✗ graph is not connected';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = kruskalDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
