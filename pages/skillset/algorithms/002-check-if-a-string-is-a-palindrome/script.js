// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: report whether whatever the visitor types is a palindrome.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Two-pointer check: walk in from both ends, comparing by code point so emoji
// and accented characters are treated as single units.
function isPalindrome(value) {
  const chars = [...value];
  let left = 0;
  let right = chars.length - 1;
  while (left < right) {
    if (chars[left] !== chars[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming the empty string is a palindrome.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && isPalindrome(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ palindrome' : '✗ not a palindrome');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example text on load
