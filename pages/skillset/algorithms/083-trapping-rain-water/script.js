// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute the trapped rain water.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Two pointers move inward from both ends, always advancing the side with the lower wall.
function trapDemo(value) {
  const heights = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (heights.some(Number.isNaN)) throw new Error('not numbers');
  let left = 0;
  let right = heights.length - 1;
  let leftWall = 0;
  let rightWall = 0;
  let water = 0;
  while (left < right) {
    if (heights[left] < heights[right]) {
      leftWall = Math.max(leftWall, heights[left]);
      water += leftWall - heights[left++];
    } else {
      rightWall = Math.max(rightWall, heights[right]);
      water += rightWall - heights[right--];
    }
  }
  return String(water);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = trapDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
