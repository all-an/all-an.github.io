// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the minimum window containing all required characters.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Grow the window until it covers every needed character, then shrink it from the left as far as it stays valid.
function minWindowDemo(value) {
  const [text, requiredText] = value.split(';').map(part => part.trim());
  if (requiredText === undefined) throw new Error('need two strings');
  const needed = new Map();
  for (const char of requiredText) needed.set(char, (needed.get(char) || 0) + 1);
  let missing = requiredText.length;
  let left = 0;
  let bestStart = 0;
  let bestLength = Infinity;
  for (let right = 0; right < text.length; right++) {
    if (needed.has(text[right])) {
      if (needed.get(text[right]) > 0) missing--;
      needed.set(text[right], needed.get(text[right]) - 1);
    }
    while (missing === 0) {
      if (right - left + 1 < bestLength) {
        bestLength = right - left + 1;
        bestStart = left;
      }
      if (needed.has(text[left])) {
        needed.set(text[left], needed.get(text[left]) + 1);
        if (needed.get(text[left]) > 0) missing++;
      }
      left++;
    }
  }
  return bestLength === Infinity ? (requiredText ? '""  (no window)' : '') : '"' + text.substr(bestStart, bestLength) + '"';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = minWindowDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
