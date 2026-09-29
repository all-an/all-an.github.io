// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the bridges of an undirected graph.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Run DFS recording each node's discovery time and the earliest time reachable through back edges.
function bridgesDemo(value) {
  const [countText, edgesText] = value.split(';');
  const count = Number(countText);
  const edges = (edgesText || '').split(',').filter(part => part.trim() !== '').map(part => part.split('-').map(Number));
  if (!Number.isInteger(count) || edges.some(edge => edge.length !== 2 || edge.some(n => !Number.isInteger(n) || n < 0 || n >= count))) throw new Error('bad input');
  const graph = Array.from({ length: count }, () => []);
  for (const [a, b] of edges) {
    graph[a].push(b);
    graph[b].push(a);
  }
  const discovered = new Array(count).fill(-1);
  const lowest = new Array(count).fill(0);
  const bridges = [];
  let clock = 0;
  const visit = (node, parent) => {
    discovered[node] = lowest[node] = clock++;
    for (const next of graph[node]) {
      if (next === parent) continue;
      if (discovered[next] === -1) {
        visit(next, node);
        lowest[node] = Math.min(lowest[node], lowest[next]);
        if (lowest[next] > discovered[node]) bridges.push('[' + node + ',' + next + ']');
      } else {
        lowest[node] = Math.min(lowest[node], discovered[next]);
      }
    }
  };
  for (let node = 0; node < count; node++) if (discovered[node] === -1) visit(node, -1);
  return bridges.length ? bridges.join(' ') : 'none';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = bridgesDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
