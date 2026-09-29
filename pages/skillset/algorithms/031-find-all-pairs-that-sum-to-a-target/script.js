// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: list all pairs that sum to a target (using two pointers on the sorted list).
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Sort the list, then close in from both ends with two pointers, collecting each matching pair.
function findPairs(value) {
  const [list, targetText] = value.split(';');
  const numbers = list.split(',').map(Number).sort((a, b) => a - b);
  const target = Number(targetText);
  if (targetText === undefined || numbers.some(Number.isNaN) || Number.isNaN(target)) throw new Error('bad input');
  const pairs = [];
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) {
      pairs.push('(' + numbers[left] + ', ' + numbers[right] + ')');
      left++;
      right--;
    } else if (sum < target) {
      left++;
    } else {
      right--;
    }
  }
  return pairs.length ? pairs.join(' ') : 'no pairs';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = findPairs(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
