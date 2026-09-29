// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: serialize a tree (given in level order) to a preorder string and rebuild it.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the tree, serialize it in preorder with "#" for gaps, deserialize that string, and confirm the round trip.
function serializeDemo(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  const nodes = items.map(item => (item === 'null' ? null : { value: item, left: null, right: null }));
  let next = 1;
  for (const node of nodes) {
    if (!node) continue;
    if (next < nodes.length) node.left = nodes[next++];
    if (next < nodes.length) node.right = nodes[next++];
  }
  const serialize = node => (node ? node.value + ',' + serialize(node.left) + ',' + serialize(node.right) : '#');
  const deserialize = text => {
    const tokens = text.split(',');
    const build = () => {
      const token = tokens.shift();
      if (token === '#') return null;
      return { value: token, left: build(), right: build() };
    };
    return build();
  };
  const text = serialize(nodes[0] || null);
  return text + '   ' + (serialize(deserialize(text)) === text ? '(round trip ✓)' : '(round trip ✗)');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = serializeDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
