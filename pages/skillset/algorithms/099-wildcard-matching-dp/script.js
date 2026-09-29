// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: match a string against a wildcard pattern.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Greedy two-pointer match, remembering the last star so it can absorb more characters after a mismatch.
function wildcardMatchDemo(value) {
  const [text, pattern] = value.split(';').map(part => part.trim());
  if (pattern === undefined) return false;
  let t = 0;
  let p = 0;
  let starAt = -1;
  let resumeAt = 0;
  while (t < text.length) {
    if (p < pattern.length && (pattern[p] === '?' || pattern[p] === text[t])) {
      t++;
      p++;
    } else if (p < pattern.length && pattern[p] === '*') {
      starAt = p++;
      resumeAt = t;
    } else if (starAt !== -1) {
      p = starAt + 1;
      t = ++resumeAt;
    } else {
      return false;
    }
  }
  while (p < pattern.length && pattern[p] === '*') p++;
  return p === pattern.length;
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && wildcardMatchDemo(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ matches' : '✗ no match');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
