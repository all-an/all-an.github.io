// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find two numbers in a list that add up to a target.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Split the input into the list and the target, then run the one-pass hash-map search.
function twoSum(value) {
  const [list, targetText] = value.split(';');
  const numbers = list.split(',').map(Number);
  const target = Number(targetText);
  if (targetText === undefined || numbers.some(Number.isNaN) || Number.isNaN(target)) throw new Error('bad input');
  const indexByValue = new Map();
  for (let i = 0; i < numbers.length; i++) {
    const complement = target - numbers[i];
    if (indexByValue.has(complement)) return '[' + indexByValue.get(complement) + ', ' + i + ']';
    indexByValue.set(numbers[i], i);
  }
  return 'no pair found';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = twoSum(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
