// Adds a line-number gutter to every multi-line code block on this page.
// Runs after c-highlight.js (loaded first in index.html) so it numbers the
// already-highlighted markup rather than plain text. No external library —
// it just splits each block into a numbers column and a code column and
// lays them out side by side via line-numbers.css's flex rules.

// Wraps one <pre><code> block's content in a numbers gutter + code column.
// Single-line blocks are skipped — a lone "1" gutter next to one command
// adds noise without helping anyone find their place.
function addLineNumbers(pre) {
  const code = pre.querySelector('code');
  if (!code) return;

  const lineCount = code.textContent.split('\n').length;
  if (lineCount < 2) return;

  const numbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  const gutter = document.createElement('span');
  gutter.className = 'line-numbers';
  gutter.setAttribute('aria-hidden', 'true');
  gutter.textContent = numbers;

  const codeLines = document.createElement('span');
  codeLines.className = 'code-lines';
  codeLines.innerHTML = code.innerHTML;

  code.innerHTML = '';
  code.append(gutter, codeLines);
  pre.classList.add('has-line-numbers');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.step pre').forEach(addLineNumbers);
});
