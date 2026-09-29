// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: sort a comma-separated list with quick sort.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Sort in place: partition around a pivot (Lomuto scheme), then recurse on both sides.
function quickSortDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  const sort = (low, high) => {
    if (low >= high) return;
    const pivot = numbers[high];
    let boundary = low;
    for (let i = low; i < high; i++) {
      if (numbers[i] < pivot) {
        [numbers[i], numbers[boundary]] = [numbers[boundary], numbers[i]];
        boundary++;
      }
    }
    [numbers[boundary], numbers[high]] = [numbers[high], numbers[boundary]];
    sort(low, boundary - 1);
    sort(boundary + 1, high);
  };
  sort(0, numbers.length - 1);
  return numbers.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = quickSortDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
