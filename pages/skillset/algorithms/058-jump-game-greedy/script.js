// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: check whether the last index is reachable.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Greedy: track the farthest index reachable so far and fail if the scan gets ahead of it.
function canJumpDemo(value) {
  const jumps = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (jumps.some(Number.isNaN)) throw new Error('not numbers');
  let farthest = 0;
  for (let i = 0; i < jumps.length; i++) {
    if (i > farthest) return false;
    farthest = Math.max(farthest, i + jumps[i]);
  }
  return true;
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && canJumpDemo(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ reachable' : '✗ not reachable');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
