// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: merge two sorted lists into one.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Parse both lists, then merge them with one pointer per list.
function mergeSorted(value) {
  const [left, right] = value.split(';').map(part => part.split(',').filter(x => x.trim() !== '').map(Number));
  if (!right || left.some(Number.isNaN) || right.some(Number.isNaN)) throw new Error('bad input');
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    merged.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return merged.concat(left.slice(i), right.slice(j)).join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = mergeSorted(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
