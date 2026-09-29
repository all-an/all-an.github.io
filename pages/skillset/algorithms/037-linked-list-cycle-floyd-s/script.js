// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: detect a cycle in a linked list built from your input.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the list, optionally link the tail back, then run tortoise-and-hare.
function hasCycleDemo(value) {
  const [list, linkText] = value.split(';');
  const nodes = list.split(',').map(item => ({ value: item.trim(), next: null }));
  const linkIndex = Number(linkText);
  nodes.forEach((node, i) => { node.next = nodes[i + 1] || null; });
  if (linkIndex >= 0 && nodes[linkIndex]) nodes[nodes.length - 1].next = nodes[linkIndex];
  let slow = nodes[0];
  let fast = nodes[0];
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && hasCycleDemo(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ has a cycle' : '✗ no cycle');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
