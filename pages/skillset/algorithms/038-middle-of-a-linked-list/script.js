// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the middle node of a linked list.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the list, then advance slow one step and fast two steps until fast runs out.
function middleNodeDemo(value) {
  const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
  let head = null;
  for (let i = items.length - 1; i >= 0; i--) head = { value: items[i], next: head };
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow ? slow.value : '';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = middleNodeDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
