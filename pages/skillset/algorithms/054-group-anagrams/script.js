// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: group words that are anagrams of each other.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Use each word's sorted letters as a key and collect words under the same key.
function groupAnagramsDemo(value) {
  const words = value.split(',').map(word => word.trim()).filter(word => word !== '');
  const groups = new Map();
  for (const word of words) {
    const key = [...word].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()].map(group => '[' + group.join(', ') + ']').join(' ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = groupAnagramsDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
