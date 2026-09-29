// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: test whether the typed number is prime.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Trial division: reject small cases, then test odd divisors up to the square root.
function isPrime(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) return false;
  }
  return true;
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && isPrime(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ prime' : '✗ not prime');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
