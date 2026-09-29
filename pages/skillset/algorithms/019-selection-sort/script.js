// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: sort a comma-separated list with selection sort.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Selection-sort a copy of the list: swap the smallest remaining value into each slot in turn.
function selectionSortDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  for (let i = 0; i < numbers.length - 1; i++) {
    let smallest = i;
    for (let j = i + 1; j < numbers.length; j++) {
      if (numbers[j] < numbers[smallest]) smallest = j;
    }
    [numbers[i], numbers[smallest]] = [numbers[smallest], numbers[i]];
  }
  return numbers.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = selectionSortDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
