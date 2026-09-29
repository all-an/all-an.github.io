// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: check whether a tree given in level order is a valid BST.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the tree, then check every node against the min/max bounds inherited from its ancestors.
function isValidBST(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  const nodes = items.map(item => (item === 'null' ? null : { value: Number(item), left: null, right: null }));
  let next = 1;
  for (const node of nodes) {
    if (!node) continue;
    if (next < nodes.length) node.left = nodes[next++];
    if (next < nodes.length) node.right = nodes[next++];
  }
  const check = (node, low, high) => {
    if (!node) return true;
    if (node.value <= low || node.value >= high) return false;
    return check(node.left, low, node.value) && check(node.right, node.value, high);
  };
  return check(nodes[0], -Infinity, Infinity);
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && isValidBST(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ valid BST' : '✗ not a BST');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
