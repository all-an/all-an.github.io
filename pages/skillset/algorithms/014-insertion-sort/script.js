// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: sort a comma-separated list with insertion sort.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Insertion-sort a copy of the list: shift larger values right and drop each element into its gap.
function insertionSortDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  for (let i = 1; i < numbers.length; i++) {
    const current = numbers[i];
    let j = i - 1;
    while (j >= 0 && numbers[j] > current) {
      numbers[j + 1] = numbers[j];
      j--;
    }
    numbers[j + 1] = current;
  }
  return numbers.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = insertionSortDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
