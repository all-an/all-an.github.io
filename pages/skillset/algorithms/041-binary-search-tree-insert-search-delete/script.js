// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: insert values into a BST, then delete one and show the sorted contents.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Insert the values one by one, delete the chosen one (handling all three node cases), and print the inorder list each time.
function bstDemo(value) {
  const [list, deleteText] = value.split(';');
  const insert = (node, key) => {
    if (!node) return { key, left: null, right: null };
    if (key < node.key) node.left = insert(node.left, key);
    else if (key > node.key) node.right = insert(node.right, key);
    return node;
  };
  const remove = (node, key) => {
    if (!node) return null;
    if (key < node.key) node.left = remove(node.left, key);
    else if (key > node.key) node.right = remove(node.right, key);
    else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      let successor = node.right;
      while (successor.left) successor = successor.left;
      node.key = successor.key;
      node.right = remove(node.right, successor.key);
    }
    return node;
  };
  const inorder = node => (node ? [...inorder(node.left), node.key, ...inorder(node.right)] : []);
  const keys = list.split(',').map(Number);
  if (deleteText === undefined || keys.some(Number.isNaN) || Number.isNaN(Number(deleteText))) throw new Error('bad input');
  let root = null;
  for (const key of keys) root = insert(root, key);
  const before = inorder(root).join(' ');
  root = remove(root, Number(deleteText));
  return before + '  →  ' + inorder(root).join(' ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = bstDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
