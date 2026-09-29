// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: build a minimum spanning tree with Prim's algorithm.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Grow the tree from node 0, each round adding the cheapest edge that leaves the tree.
function primDemo(value) {
  const edges = value.split(',').map(part => part.trim().split(/[-:]/).map(Number));
  if (edges.some(edge => edge.length !== 3 || edge.some(Number.isNaN))) throw new Error('bad input');
  const size = Math.max(...edges.flatMap(([a, b]) => [a, b])) + 1;
  const inTree = new Array(size).fill(false);
  inTree[0] = true;
  const chosen = [];
  let total = 0;
  for (let step = 1; step < size; step++) {
    let cheapest = null;
    for (const edge of edges) {
      if (inTree[edge[0]] !== inTree[edge[1]] && (!cheapest || edge[2] < cheapest[2])) cheapest = edge;
    }
    if (!cheapest) return '✗ graph is not connected';
    inTree[cheapest[0]] = inTree[cheapest[1]] = true;
    chosen.push(cheapest[0] + '-' + cheapest[1]);
    total += cheapest[2];
  }
  return 'weight ' + total + '   edges ' + chosen.join(' ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = primDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
