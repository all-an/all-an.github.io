// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find all unique triplets that sum to zero.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Sort, fix one number, and close in on the other two with two pointers, skipping duplicates.
function threeSumDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number).sort((a, b) => a - b);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  const triplets = [];
  for (let i = 0; i < numbers.length - 2; i++) {
    if (i > 0 && numbers[i] === numbers[i - 1]) continue;
    let left = i + 1;
    let right = numbers.length - 1;
    while (left < right) {
      const sum = numbers[i] + numbers[left] + numbers[right];
      if (sum < 0) left++;
      else if (sum > 0) right--;
      else {
        triplets.push('[' + [numbers[i], numbers[left], numbers[right]].join(', ') + ']');
        left++;
        right--;
        while (left < right && numbers[left] === numbers[left - 1]) left++;
      }
    }
  }
  return triplets.length ? triplets.join(' ') : 'none';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = threeSumDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
