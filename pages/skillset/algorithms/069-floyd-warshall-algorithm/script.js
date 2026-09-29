// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute all-pairs shortest distances.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Allow each node in turn as an intermediate stop and improve every pair that gets shorter through it.
function floydWarshallDemo(value) {
  const edges = value.split(',').map(part => part.trim().split(/[>:]/).map(Number));
  if (edges.some(edge => edge.length !== 3 || edge.some(Number.isNaN))) throw new Error('bad input');
  const size = Math.max(...edges.flatMap(([from, to]) => [from, to])) + 1;
  const dist = Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => (i === j ? 0 : Infinity)));
  for (const [from, to, weight] of edges) dist[from][to] = Math.min(dist[from][to], weight);
  for (let via = 0; via < size; via++) {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (dist[i][via] + dist[via][j] < dist[i][j]) dist[i][j] = dist[i][via] + dist[via][j];
      }
    }
  }
  return dist.map(row => row.map(d => (d === Infinity ? '∞' : d)).join(' ')).join('  |  ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = floydWarshallDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
