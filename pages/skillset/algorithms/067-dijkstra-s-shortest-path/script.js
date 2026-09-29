// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute shortest distances from a source node.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Repeatedly settle the closest unvisited node and relax the edges leaving it.
function dijkstraDemo(value) {
  const [edgesText, sourceText] = value.split(';');
  const edges = edgesText.split(',').map(part => part.trim().split(/[>:]/).map(Number));
  const source = Number(sourceText);
  if (edges.some(edge => edge.length !== 3 || edge.some(Number.isNaN) || edge[2] < 0) || Number.isNaN(source)) throw new Error('bad input');
  const size = Math.max(source, ...edges.flatMap(([from, to]) => [from, to])) + 1;
  const distance = new Array(size).fill(Infinity);
  const settled = new Array(size).fill(false);
  distance[source] = 0;
  for (let round = 0; round < size; round++) {
    let node = -1;
    for (let i = 0; i < size; i++) {
      if (!settled[i] && (node === -1 || distance[i] < distance[node])) node = i;
    }
    if (distance[node] === Infinity) break;
    settled[node] = true;
    for (const [from, to, weight] of edges) {
      if (from === node && distance[node] + weight < distance[to]) distance[to] = distance[node] + weight;
    }
  }
  return distance.map((d, node) => node + ':' + (d === Infinity ? '∞' : d)).join('  ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = dijkstraDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
