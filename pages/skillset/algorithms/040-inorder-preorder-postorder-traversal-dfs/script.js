// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: show the three depth-first orders of a binary tree given in level order.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the tree from the level-order list, then run all three recursive traversals.
function dfsOrders(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  const nodes = items.map(item => (item === 'null' ? null : { value: item, left: null, right: null }));
  let next = 1;
  for (const node of nodes) {
    if (!node) continue;
    if (next < nodes.length) node.left = nodes[next++];
    if (next < nodes.length) node.right = nodes[next++];
  }
  const preorder = [];
  const inorder = [];
  const postorder = [];
  const visit = node => {
    if (!node) return;
    preorder.push(node.value);
    visit(node.left);
    inorder.push(node.value);
    visit(node.right);
    postorder.push(node.value);
  };
  visit(nodes[0]);
  return preorder.join(' ') + '  |  ' + inorder.join(' ') + '  |  ' + postorder.join(' ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = dfsOrders(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
