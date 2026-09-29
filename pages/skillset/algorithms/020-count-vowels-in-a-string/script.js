// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: count the vowels in the typed text.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Lower-case the text and count the characters that belong to the vowel set.
function countVowels(value) {
  let count = 0;
  for (const char of value.toLowerCase()) {
    if ('aeiou'.includes(char)) count++;
  }
  return String(count);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = countVowels(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
