// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: sort a comma-separated list with merge sort.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Recursively split the list, sort each half and merge the halves back together.
function mergeSortDemo(value) {
  const numbers = value.split(',').filter(part => part.trim() !== '').map(Number);
  if (numbers.some(Number.isNaN)) throw new Error('not numbers');
  const sort = list => {
    if (list.length <= 1) return list;
    const middle = Math.floor(list.length / 2);
    const left = sort(list.slice(0, middle));
    const right = sort(list.slice(middle));
    const merged = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      merged.push(left[i] <= right[j] ? left[i++] : right[j++]);
    }
    return merged.concat(left.slice(i), right.slice(j));
  };
  return sort(numbers).join(', ');
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = mergeSortDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
