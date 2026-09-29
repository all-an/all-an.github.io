// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: check whether all courses can be finished, and show one valid order.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Run Kahn's algorithm: repeatedly take courses with no remaining prerequisites.
function courseOrder(value) {
  const [countText, pairsText] = value.split(';');
  const count = Number(countText);
  const pairs = (pairsText || '').split(',').filter(part => part.trim() !== '').map(part => part.split('-').map(Number));
  if (!Number.isInteger(count) || count < 0 || pairs.some(pair => pair.length !== 2 || pair.some(n => !Number.isInteger(n) || n < 0 || n >= count))) throw new Error('bad input');
  const dependents = Array.from({ length: count }, () => []);
  const waitingOn = new Array(count).fill(0);
  for (const [course, prerequisite] of pairs) {
    dependents[prerequisite].push(course);
    waitingOn[course]++;
  }
  const ready = [];
  waitingOn.forEach((waiting, course) => { if (waiting === 0) ready.push(course); });
  const order = [];
  while (ready.length) {
    const course = ready.shift();
    order.push(course);
    for (const next of dependents[course]) {
      if (--waitingOn[next] === 0) ready.push(next);
    }
  }
  return order.length === count ? order.join(' → ') : '✗ cycle — impossible';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = courseOrder(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
