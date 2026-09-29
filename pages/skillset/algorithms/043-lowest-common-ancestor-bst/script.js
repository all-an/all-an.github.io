// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the LCA of two values in a BST built from your input.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the BST by insertion, then walk down from the root until the two values split apart.
function lcaDemo(value) {
  const [list, pairText] = value.split(';');
  const keys = list.split(',').map(Number);
  const [p, q] = (pairText || '').split(',').map(Number);
  if (keys.some(Number.isNaN) || Number.isNaN(p) || Number.isNaN(q)) throw new Error('bad input');
  const insert = (node, key) => {
    if (!node) return { key, left: null, right: null };
    if (key < node.key) node.left = insert(node.left, key);
    else node.right = insert(node.right, key);
    return node;
  };
  let root = null;
  for (const key of keys) root = insert(root, key);
  let node = root;
  while (node) {
    if (p < node.key && q < node.key) node = node.left;
    else if (p > node.key && q > node.key) node = node.right;
    else return String(node.key);
  }
  return 'none';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = lcaDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
