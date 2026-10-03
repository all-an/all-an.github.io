// Natural numbers & counting — demo and exercises. The shared runtime
// (../topic.js) builds the page from this object.

const TOPIC = {
  // The "successor machine": a counter that only ever moves by taking the
  // successor (n → n + 1), one dot per unit, so you can see the number.
  demo: { type: 'counter', label: 'current number', stepLabel: 'successor (+1)' },

  // Each exercise: the function to write, the prompt, starter code, a worked
  // solution, and test cases graded by deep equality.
  exercises: [
    {
      fn: 'successor',
      title: 'The successor',
      prompt: 'Return the natural number that comes right after n — its successor.',
      starter: 'function successor(n) {\n  // your code here\n}\n',
      solution: 'function successor(n) {\n  return n + 1;\n}\n',
      tests: [
        { args: [0], expected: 1 },
        { args: [1], expected: 2 },
        { args: [41], expected: 42 },
      ],
    },
    {
      fn: 'countTo',
      title: 'Count to n',
      prompt: 'Return an array of the natural numbers from 1 up to and including n. countTo(3) → [1, 2, 3].',
      starter: 'function countTo(n) {\n  // your code here\n}\n',
      solution: 'function countTo(n) {\n  const numbers = [];\n  for (let i = 1; i <= n; i++) {\n    numbers.push(i);\n  }\n  return numbers;\n}\n',
      tests: [
        { args: [1], expected: [1] },
        { args: [3], expected: [1, 2, 3] },
        { args: [5], expected: [1, 2, 3, 4, 5] },
      ],
    },
    {
      fn: 'sumTo',
      title: 'Sum of the first n',
      prompt: 'Return the sum of the natural numbers from 1 to n. sumTo(4) → 1 + 2 + 3 + 4 = 10.',
      starter: 'function sumTo(n) {\n  // your code here\n}\n',
      solution: '// The loop is fine; Gauss\'s closed form n(n+1)/2 is the elegant way.\nfunction sumTo(n) {\n  return n * (n + 1) / 2;\n}\n',
      tests: [
        { args: [1], expected: 1 },
        { args: [4], expected: 10 },
        { args: [100], expected: 5050 },
      ],
    },
    {
      fn: 'isNatural',
      title: 'Is it a natural number?',
      prompt: 'Return true if x is a natural number (a whole number 0, 1, 2, …) and false otherwise — reject negatives and non-integers like 2.5.',
      starter: 'function isNatural(x) {\n  // your code here\n}\n',
      solution: 'function isNatural(x) {\n  return Number.isInteger(x) && x >= 0;\n}\n',
      tests: [
        { args: [0], expected: true },
        { args: [7], expected: true },
        { args: [-3], expected: false },
        { args: [2.5], expected: false },
      ],
    },
    {
      fn: 'placeValue',
      title: 'Place value',
      prompt: 'Given a non-negative whole number and a place (0 = units, 1 = tens, 2 = hundreds, …), return the value contributed by the digit in that place. placeValue(374, 1) → 70.',
      starter: 'function placeValue(number, place) {\n  // your code here\n}\n',
      solution: 'function placeValue(number, place) {\n  const digit = Math.floor(number / 10 ** place) % 10;\n  return digit * 10 ** place;\n}\n',
      tests: [
        { args: [374, 0], expected: 4 },
        { args: [374, 1], expected: 70 },
        { args: [374, 2], expected: 300 },
        { args: [5, 1], expected: 0 },
      ],
    },
  ],
};

initTopic(TOPIC);
