// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: reverse a linked list, shown as a chain of nodes.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build a real linked list, reverse it by re-pointing each node, and print the chain.
function reverseListDemo(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  let head = null;
  for (let i = items.length - 1; i >= 0; i--) head = { value: items[i], next: head };
  let previous = null;
  let current = head;
  while (current) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }
  const values = [];
  for (let node = previous; node; node = node.next) values.push(node.value);
  return values.concat('null').join(' → ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = reverseListDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
