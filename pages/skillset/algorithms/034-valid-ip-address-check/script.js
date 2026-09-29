// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: check whether the typed text is a valid IPv4 address.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Split on dots and check every part is a number in range with no leading zero.
function isValidIPv4(value) {
  const parts = value.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => /^\d{1,3}$/.test(part) && (part === '0' || part[0] !== '0') && Number(part) <= 255);
}

// Show a check or cross with a short label, coloured green for yes / red for no.
// An empty box stays blank rather than claiming a verdict on no input.
function updateDemo() {
  const value = demoInput.value;
  const hasText = value.length > 0;
  const ok = hasText && isValidIPv4(value);
  demoOutput.textContent = !hasText ? '' : (ok ? '✓ valid IPv4' : '✗ not valid');
  demoOutput.classList.toggle('yes', ok);
  demoOutput.classList.toggle('no', hasText && !ok);
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
