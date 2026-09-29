// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count the ways to decode a digit string.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Roll two counts forward: a digit alone (1-9) and a valid two-digit pair (10-26) each extend earlier decodings.
function decodeWaysDemo(value) {
  if (!/^\d*$/.test(value)) throw new Error('digits only');
  if (value === '') return '';
  let twoBack = 1;
  let oneBack = value[0] === '0' ? 0 : 1;
  for (let i = 1; i < value.length; i++) {
    let current = 0;
    if (value[i] !== '0') current += oneBack;
    const pair = Number(value.slice(i - 1, i + 1));
    if (pair >= 10 && pair <= 26) current += twoBack;
    [twoBack, oneBack] = [oneBack, current];
  }
  return String(oneBack);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = decodeWaysDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
