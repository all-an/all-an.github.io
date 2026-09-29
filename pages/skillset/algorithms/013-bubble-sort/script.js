// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: sort a comma-separated list with bubble sort and count the swaps.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Bubble sort a copy of the list, counting how many swaps were needed.
function bubbleSortDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  let swaps = 0;
  for (let pass = 0; pass < numbers.length - 1; pass++) {
    for (let i = 0; i < numbers.length - 1 - pass; i++) {
      if (numbers[i] > numbers[i + 1]) {
        [numbers[i], numbers[i + 1]] = [numbers[i + 1], numbers[i]];
        swaps++;
      }
    }
  }
  return numbers.join(', ') + (numbers.length ? '   (' + swaps + ' swaps)' : '');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = bubbleSortDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
