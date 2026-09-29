// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the maximum you can rob without hitting adjacent houses.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Track the best total if the previous house was robbed versus skipped.
function robDemo(value) {
  const money = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (money.some(Number.isNaN)) throw new Error('not numbers');
  let skipped = 0;
  let robbed = 0;
  for (const amount of money) [skipped, robbed] = [Math.max(skipped, robbed), skipped + amount];
  return String(Math.max(skipped, robbed));
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = robDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
