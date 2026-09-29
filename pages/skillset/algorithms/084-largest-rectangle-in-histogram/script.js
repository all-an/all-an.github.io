// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the largest rectangle in a histogram.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Keep a stack of bars with increasing heights; a shorter bar closes every taller rectangle on the stack.
function largestRectangleDemo(value) {
  const heights = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (heights.some(Number.isNaN)) throw new Error('not numbers');
  const stack = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    const current = i === heights.length ? 0 : heights[i];
    while (stack.length && heights[stack[stack.length - 1]] >= current) {
      const height = heights[stack.pop()];
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  }
  return String(best);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = largestRectangleDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
