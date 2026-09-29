// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute shortest distances with negative edges allowed.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Relax every edge V − 1 times, then relax once more to detect a negative cycle.
function bellmanFordDemo(value) {
  const [edgesText, sourceText] = value.split(';');
  const edges = edgesText.split(',').map(part => part.trim().split(/[>:]/).map(Number));
  const source = Number(sourceText);
  if (edges.some(edge => edge.length !== 3 || edge.some(Number.isNaN)) || Number.isNaN(source)) throw new Error('bad input');
  const size = Math.max(source, ...edges.flatMap(([from, to]) => [from, to])) + 1;
  const distance = new Array(size).fill(Infinity);
  distance[source] = 0;
  for (let round = 1; round < size; round++) {
    for (const [from, to, weight] of edges) {
      if (distance[from] + weight < distance[to]) distance[to] = distance[from] + weight;
    }
  }
  for (const [from, to, weight] of edges) {
    if (distance[from] + weight < distance[to]) return '✗ negative cycle';
  }
  return distance.map((d, node) => node + ':' + (d === Infinity ? '∞' : d)).join('  ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = bellmanFordDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
