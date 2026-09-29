// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the k-th largest element with quickselect.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Partition around a pivot repeatedly, narrowing to the side that must contain the target position.
function kthLargestDemo(value) {
  const [list, kText] = value.split(';');
  const numbers = list.split(',').filter(part => part.trim() !== '').map(Number);
  const k = Number(kText);
  if (kText === undefined || numbers.some(Number.isNaN) || !Number.isInteger(k) || k < 1 || k > numbers.length) throw new Error('bad input');
  const target = numbers.length - k;
  let low = 0;
  let high = numbers.length - 1;
  while (low < high) {
    const pivot = numbers[high];
    let boundary = low;
    for (let i = low; i < high; i++) {
      if (numbers[i] < pivot) {
        [numbers[i], numbers[boundary]] = [numbers[boundary], numbers[i]];
        boundary++;
      }
    }
    [numbers[boundary], numbers[high]] = [numbers[high], numbers[boundary]];
    if (boundary === target) return String(numbers[boundary]);
    if (boundary < target) low = boundary + 1;
    else high = boundary - 1;
  }
  return String(numbers[target]);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = kthLargestDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
