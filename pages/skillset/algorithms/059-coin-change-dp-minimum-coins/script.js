// Paint the Java and JavaScript code blocks with highlight.js.
hljs.highlightAll();

// Live "try it" demo: find the minimum number of coins for an amount.
const demoInput = document.getElementById('demoInput');
const demoOutput = document.getElementById('demoOutput');

// Fill a table where best[a] is the fewest coins for amount a, building up from 0.
function coinChangeDemo(value) {
  const [list, amountText] = value.split(';');
  const coins = list.split(',').filter(part => part.trim() !== '').map(Number);
  const amount = Number(amountText);
  if (amountText === undefined || coins.some(Number.isNaN) || !Number.isInteger(amount) || amount < 0 || amount > 10000) throw new Error('bad input');
  const best = new Array(amount + 1).fill(Infinity);
  best[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) best[a] = Math.min(best[a], best[a - coin] + 1);
    }
  }
  return best[amount] === Infinity ? '-1  (impossible)' : String(best[amount]);
}

// Recompute the result on every keystroke; input the demo cannot parse is
// reported instead of throwing.
function updateDemo() {
  try {
    demoOutput.textContent = coinChangeDemo(demoInput.value);
  } catch (error) {
    demoOutput.textContent = 'Invalid input';
  }
}

demoInput.addEventListener('input', updateDemo);
updateDemo(); // evaluate the initial example on load
