// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the maximum coins from bursting all balloons.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Interval DP: for each range, pick the balloon burst <em>last</em> in it and combine the best of the two sides.
function burstBalloonsDemo(value) {
  const balloons = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (balloons.some(Number.isNaN)) throw new Error('not numbers');
  const nums = [1, ...balloons, 1];
  const n = nums.length;
  const best = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let gap = 2; gap < n; gap++) {
    for (let left = 0; left + gap < n; left++) {
      const right = left + gap;
      for (let last = left + 1; last < right; last++) {
        best[left][right] = Math.max(best[left][right], best[left][last] + nums[left] * nums[last] * nums[right] + best[last][right]);
      }
    }
  }
  return String(best[0][n - 1]);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = burstBalloonsDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
