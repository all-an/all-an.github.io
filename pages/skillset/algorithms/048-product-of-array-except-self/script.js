// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compute the product of all other elements for each position.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Fill each slot with the product of everything to its left, then multiply in everything to its right.
function productExceptSelfDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  const result = new Array(numbers.length).fill(1);
  let left = 1;
  for (let i = 0; i < numbers.length; i++) {
    result[i] = left;
    left *= numbers[i];
  }
  let right = 1;
  for (let i = numbers.length - 1; i >= 0; i--) {
    result[i] *= right;
    right *= numbers[i];
  }
  return result.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = productExceptSelfDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
