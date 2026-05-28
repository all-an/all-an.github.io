// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: reverse whatever the visitor types.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Reverse by code point (the spread operator) so emoji and accented characters
// survive intact, then show the result.
function updateDemo() {
  demoOutput.textContent = [...demoInput.value].reverse().join('');
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // reverse the initial example text on load
