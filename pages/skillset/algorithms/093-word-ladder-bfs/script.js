// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the shortest word ladder.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Breadth-first search: change each letter of the current word to every alternative and keep the dictionary words.
function wordLadderDemo(value) {
  const [begin, end, dictionaryText] = value.split(';').map(part => part.trim());
  if (dictionaryText === undefined) throw new Error('need three parts');
  const dictionary = new Set(dictionaryText.split(',').map(word => word.trim()));
  if (!dictionary.has(end)) return '0  (end word not in dictionary)';
  let queue = [begin];
  let steps = 1;
  while (queue.length) {
    const nextLevel = [];
    for (const word of queue) {
      if (word === end) return String(steps);
      for (let i = 0; i < word.length; i++) {
        for (let code = 97; code <= 122; code++) {
          const candidate = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
          if (dictionary.delete(candidate)) nextLevel.push(candidate);
        }
      }
    }
    queue = nextLevel;
    steps++;
  }
  return '0  (no ladder)';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = wordLadderDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
