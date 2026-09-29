// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: check whether two words are anagrams of each other.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Split the input into two words and compare their letter counts.
function areAnagrams(value) {
  const [first, second] = value.split(',').map(word => word.trim().toLowerCase());
  if (second === undefined || first.length !== second.length) return false;
  const counts = new Map();
  for (const char of first) counts.set(char, (counts.get(char) || 0) + 1);
  for (const char of second) {
    if (!counts.get(char)) return false;
    counts.set(char, counts.get(char) - 1);
  }
  return true;
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && areAnagrams(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ anagrams' : '✗ not anagrams');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
