// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the minimum ship capacity that delivers all packages within D days.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Binary-search the capacity, testing each candidate by simulating the loading day by day.
function shipCapacityDemo(value) {
  const [list, daysText] = value.split(';');
  const weights = list.split(',').filter(part => part.trim() !== '').map(Number);
  const days = Number(daysText);
  if (daysText === undefined || weights.length === 0 || weights.some(w => !(w > 0)) || !Number.isInteger(days) || days < 1) throw new Error('bad input');
  const daysNeeded = capacity => {
    let needed = 1;
    let load = 0;
    for (const weight of weights) {
      if (load + weight > capacity) {
        needed++;
        load = 0;
      }
      load += weight;
    }
    return needed;
  };
  let low = Math.max(...weights);
  let high = weights.reduce((total, w) => total + w, 0);
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (daysNeeded(middle) <= days) high = middle;
    else low = middle + 1;
  }
  return String(low);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = shipCapacityDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
