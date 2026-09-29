// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the longest substring without repeating characters.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Slide a window over the text; when a character repeats, move the window start just past its previous occurrence.
function longestUnique(value) {
  const lastSeen = new Map();
  let start = 0;
  let bestStart = 0;
  let bestLength = 0;
  for (let end = 0; end < value.length; end++) {
    const char = value[end];
    if (lastSeen.has(char) && lastSeen.get(char) >= start) start = lastSeen.get(char) + 1;
    lastSeen.set(char, end);
    if (end - start + 1 > bestLength) {
      bestLength = end - start + 1;
      bestStart = start;
    }
  }
  return bestLength ? '"' + value.slice(bestStart, bestStart + bestLength) + '"  (length ' + bestLength + ')' : '';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = longestUnique(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
