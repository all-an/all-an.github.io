// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: solve a 0/1 knapsack.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Fill a 1-D table where best[w] is the top value achievable with capacity w, scanning capacity downward per item.
function knapsackDemo(value) {
  const [list, capacityText] = value.split(';');
  const items = list.split(',').filter(part => part.trim() !== '').map(part => part.split(':').map(Number));
  const capacity = Number(capacityText);
  if (capacityText === undefined || items.some(pair => pair.length !== 2 || pair.some(Number.isNaN)) || !Number.isInteger(capacity) || capacity < 0) throw new Error('bad input');
  const best = new Array(capacity + 1).fill(0);
  for (const [weight, worth] of items) {
    for (let w = capacity; w >= weight; w--) best[w] = Math.max(best[w], best[w - weight] + worth);
  }
  return String(best[capacity]);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = knapsackDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
