// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: flatten a tree (given in level order) into a preorder chain.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the tree, flatten it in place with the predecessor-splice method, then follow the right pointers.
function flattenTreeDemo(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  const nodes = items.map(item => (item === 'null' ? null : { value: item, left: null, right: null }));
  let next = 1;
  for (const node of nodes) {
    if (!node) continue;
    if (next < nodes.length) node.left = nodes[next++];
    if (next < nodes.length) node.right = nodes[next++];
  }
  let current = nodes[0] || null;
  while (current) {
    if (current.left) {
      let rightmost = current.left;
      while (rightmost.right) rightmost = rightmost.right;
      rightmost.right = current.right;
      current.right = current.left;
      current.left = null;
    }
    current = current.right;
  }
  const values = [];
  for (let node = nodes[0] || null; node; node = node.right) values.push(node.value);
  return values.join(' → ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = flattenTreeDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
