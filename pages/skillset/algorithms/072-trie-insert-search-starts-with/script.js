// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: insert words into a trie and query it.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Insert the words, then check the query as a whole word and as a prefix.
function trieDemo(value) {
  const [list, query] = value.split(';');
  const root = { children: new Map(), isWord: false };
  for (const word of list.split(',').map(w => w.trim()).filter(w => w !== '')) {
    let node = root;
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, { children: new Map(), isWord: false });
      node = node.children.get(char);
    }
    node.isWord = true;
  }
  const target = (query || '').trim();
  let node = root;
  for (const char of target) {
    node = node && node.children.get(char);
  }
  return 'search: ' + (node && node.isWord ? 'yes' : 'no') + ',  startsWith: ' + (node ? 'yes' : 'no');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = trieDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
