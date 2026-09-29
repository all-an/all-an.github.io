// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: match a string against a pattern with "." and "*".
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Bottom-up DP over prefixes of the text and the pattern.
function regexMatchDemo(value) {
  const [text, pattern] = value.split(';').map(part => part.trim());
  if (pattern === undefined || /^\*|\*\*/.test(pattern)) return false;
  const table = Array.from({ length: text.length + 1 }, () => new Array(pattern.length + 1).fill(false));
  table[0][0] = true;
  for (let j = 2; j <= pattern.length; j++) {
    if (pattern[j - 1] === '*') table[0][j] = table[0][j - 2];
  }
  for (let i = 1; i <= text.length; i++) {
    for (let j = 1; j <= pattern.length; j++) {
      if (pattern[j - 1] === '*') {
        const precedesMatch = pattern[j - 2] === '.' || pattern[j - 2] === text[i - 1];
        table[i][j] = table[i][j - 2] || (precedesMatch && table[i - 1][j]);
      } else {
        table[i][j] = (pattern[j - 1] === '.' || pattern[j - 1] === text[i - 1]) && table[i - 1][j - 1];
      }
    }
  }
  return table[text.length][pattern.length];
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && regexMatchDemo(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ matches' : '✗ no match');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
