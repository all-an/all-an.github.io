// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: compare how many calls plain and memoized recursion make.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Run the naive and the memoized recursion side by side, counting every call each makes.
function compareFibonacci(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 30) throw new Error('out of range');
  let naiveCalls = 0;
  const naive = k => {
    naiveCalls++;
    return k < 2 ? k : naive(k - 1) + naive(k - 2);
  };
  let memoCalls = 0;
  const memo = new Map();
  const memoized = k => {
    memoCalls++;
    if (k < 2) return k;
    if (!memo.has(k)) memo.set(k, memoized(k - 1) + memoized(k - 2));
    return memo.get(k);
  };
  return 'F(' + n + ') = ' + naive(n) + '   naive: ' + naiveCalls + ' calls, memoized: ' + (memoized(n), memoCalls) + ' calls';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = compareFibonacci(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
