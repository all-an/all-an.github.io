// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the two lines that hold the most water.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Start with the widest pair and move the shorter line inward, tracking the best area.
function mostWater(value) {
  const heights = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (heights.some(Number.isNaN)) throw new Error('not numbers');
  let left = 0;
  let right = heights.length - 1;
  let best = 0;
  while (left < right) {
    best = Math.max(best, (right - left) * Math.min(heights[left], heights[right]));
    if (heights[left] < heights[right]) left++;
    else right--;
  }
  return String(best);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = mostWater(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
