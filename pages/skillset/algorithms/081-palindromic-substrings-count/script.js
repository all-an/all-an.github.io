// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count the palindromic substrings.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Expand around each of the 2n − 1 centres; every successful expansion is one more palindrome.
function countPalindromesDemo(value) {
  let count = 0;
  for (let center = 0; center < 2 * value.length - 1; center++) {
    let left = center >> 1;
    let right = left + (center & 1);
    while (left >= 0 && right < value.length && value[left] === value[right]) {
      count++;
      left--;
      right++;
    }
  }
  return String(count);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = countPalindromesDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
