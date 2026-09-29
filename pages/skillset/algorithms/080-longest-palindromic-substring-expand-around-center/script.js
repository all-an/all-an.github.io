// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the longest palindromic substring.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Treat every character and every gap as a centre and expand outward while the sides match.
function longestPalindromeDemo(value) {
  let bestStart = 0;
  let bestLength = 0;
  for (let center = 0; center < 2 * value.length - 1; center++) {
    let left = center >> 1;
    let right = left + (center & 1);
    while (left >= 0 && right < value.length && value[left] === value[right]) {
      left--;
      right++;
    }
    if (right - left - 1 > bestLength) {
      bestLength = right - left - 1;
      bestStart = left + 1;
    }
  }
  return bestLength ? '"' + value.substr(bestStart, bestLength) + '"' : '';
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = longestPalindromeDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
