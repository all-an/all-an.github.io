// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute the maximum flow of a network.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Edmonds-Karp: repeatedly find the shortest augmenting path with BFS and push the bottleneck amount along it.
function maxFlowDemo(value) {
  const [edgesText, endpointsText] = value.split(';');
  const edges = edgesText.split(',').map(part => part.trim().split(/[>:]/).map(Number));
  const [source, sink] = (endpointsText || '').split(',').map(Number);
  if (edges.some(edge => edge.length !== 3 || edge.some(Number.isNaN)) || Number.isNaN(source) || Number.isNaN(sink)) throw new Error('bad input');
  const size = Math.max(source, sink, ...edges.flatMap(([from, to]) => [from, to])) + 1;
  const residual = Array.from({ length: size }, () => new Array(size).fill(0));
  for (const [from, to, capacity] of edges) residual[from][to] += capacity;
  let flow = 0;
  for (;;) {
    const parent = new Array(size).fill(-1);
    parent[source] = source;
    const queue = [source];
    while (queue.length && parent[sink] === -1) {
      const node = queue.shift();
      for (let next = 0; next < size; next++) {
        if (parent[next] === -1 && residual[node][next] > 0) {
          parent[next] = node;
          queue.push(next);
        }
      }
    }
    if (parent[sink] === -1) return String(flow);
    let bottleneck = Infinity;
    for (let node = sink; node !== source; node = parent[node]) bottleneck = Math.min(bottleneck, residual[parent[node]][node]);
    for (let node = sink; node !== source; node = parent[node]) {
      residual[parent[node]][node] -= bottleneck;
      residual[node][parent[node]] += bottleneck;
    }
    flow += bottleneck;
  }
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = maxFlowDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
