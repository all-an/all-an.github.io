// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count the ways to climb n stairs.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Roll two values forward: ways to reach a step = ways to reach the previous two steps.
function climbStairsDemo(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 45) throw new Error('out of range');
  let twoBack = 1;
  let oneBack = 1;
  for (let step = 2; step <= n; step++) [twoBack, oneBack] = [oneBack, oneBack + twoBack];
  return String(oneBack);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = climbStairsDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
