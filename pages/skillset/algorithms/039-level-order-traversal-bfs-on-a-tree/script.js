// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: list the levels of a binary tree given in level order.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the tree from the level-order list, then traverse it with a queue, one level at a time.
function levelOrderDemo(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  const nodes = items.map(item => (item === 'null' ? null : { value: item, left: null, right: null }));
  let next = 1;
  for (const node of nodes) {
    if (!node) continue;
    if (next < nodes.length) node.left = nodes[next++];
    if (next < nodes.length) node.right = nodes[next++];
  }
  const levels = [];
  let queue = nodes.length && nodes[0] ? [nodes[0]] : [];
  while (queue.length) {
    levels.push('[' + queue.map(node => node.value).join(', ') + ']');
    queue = queue.flatMap(node => [node.left, node.right]).filter(Boolean);
  }
  return levels.join(' ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = levelOrderDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
