// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: rebuild a tree from its preorder and inorder traversals.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Recursively split the inorder list around each preorder root, then print the tree in level order.
function rebuildDemo(value) {
  const [preText, inText] = value.split(';');
  const preorder = preText.split(',').map(item => item.trim()).filter(item => item !== '');
  const inorder = (inText || '').split(',').map(item => item.trim()).filter(item => item !== '');
  if (preorder.length !== inorder.length) throw new Error('length mismatch');
  const inorderIndex = new Map(inorder.map((item, i) => [item, i]));
  let next = 0;
  const build = (low, high) => {
    if (low > high) return null;
    const rootValue = preorder[next++];
    const split = inorderIndex.get(rootValue);
    if (split === undefined) throw new Error('inconsistent');
    return { value: rootValue, left: build(low, split - 1), right: build(split + 1, high) };
  };
  const root = build(0, inorder.length - 1);
  const output = [];
  let queue = root ? [root] : [];
  while (queue.length) {
    output.push(...queue.map(node => node.value));
    queue = queue.flatMap(node => [node.left, node.right]).filter(Boolean);
  }
  return output.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = rebuildDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
