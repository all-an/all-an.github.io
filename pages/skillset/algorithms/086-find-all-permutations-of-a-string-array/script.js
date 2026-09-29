// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: list all permutations of the typed characters.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Backtrack: choose an unused character, recurse, then un-choose it.
function permutationsDemo(value) {
  const chars = [...value];
  if (chars.length > 6) throw new Error('too long');
  const results = [];
  const used = new Array(chars.length).fill(false);
  const current = [];
  const backtrack = () => {
    if (current.length === chars.length) {
      results.push(current.join(''));
      return;
    }
    for (let i = 0; i < chars.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(chars[i]);
      backtrack();
      current.pop();
      used[i] = false;
    }
  };
  if (chars.length) backtrack();
  return results.join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = permutationsDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
