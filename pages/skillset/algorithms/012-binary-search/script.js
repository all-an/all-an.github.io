// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: binary-search a sorted list and show the probes it makes.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Run binary search, recording every index that gets probed.
function binarySearchTrace(value) {
  const [list, targetText] = value.split(';');
  const numbers = list.split(',').map(Number);
  const target = Number(targetText);
  if (targetText === undefined || numbers.some(Number.isNaN) || Number.isNaN(target)) throw new Error('bad input');
  const probes = [];
  let low = 0;
  let high = numbers.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    probes.push(mid);
    if (numbers[mid] === target) return 'found at index ' + mid + '   (probed ' + probes.join(', ') + ')';
    if (numbers[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return 'not found: -1   (probed ' + probes.join(', ') + ')';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = binarySearchTrace(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
