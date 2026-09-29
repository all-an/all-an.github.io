// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: run FizzBuzz from 1 up to the typed number.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Build the FizzBuzz sequence from 1 to n, capping n so the output stays short.
function fizzBuzz(value) {
  const n = Math.min(Number(value), 50);
  const words = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) words.push('FizzBuzz');
    else if (i % 3 === 0) words.push('Fizz');
    else if (i % 5 === 0) words.push('Buzz');
    else words.push(i);
  }
  return words.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = fizzBuzz(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
