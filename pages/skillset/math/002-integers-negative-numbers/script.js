// Integers & negative numbers — demo and exercises. The shared runtime
// (../topic.js) builds the page from this object.

const TOPIC = {
  // Two sliders on a number line, with their sum marked and the sign rules
  // applied underneath.
  demo: {
    type: 'numberline',
    range: [-20, 20],
    inputs: [
      { name: 'a', label: 'a', value: -4, min: -10, max: 10 },
      { name: 'b', label: 'b', value: 7, min: -10, max: 10 },
    ],
    points: [
      { label: 'a', expr: 'a' },
      { label: 'b', expr: 'b' },
      { label: 'a + b', expr: 'a + b' },
    ],
    outputs: [
      { label: 'a + b', expr: 'a + b' },
      { label: 'a − b  (= a + (−b))', expr: 'a - b' },
      { label: 'a × b', expr: 'a * b' },
      { label: '|a|  and  |b|', expr: '[abs(a), abs(b)]' },
      { label: 'distance between a and b', expr: 'abs(a - b)' },
      { label: 'which is further left?', expr: 'a < b ? "a" : (a > b ? "b" : "same point")' },
    ],
  },

  exercises: [
    {
      fn: 'absoluteValue',
      title: 'Absolute value',
      prompt: 'Return the absolute value of the integer n — its distance from zero. Do it without Math.abs: absoluteValue(-5) → 5.',
      starter: 'function absoluteValue(n) {\n  // your code here\n}\n',
      solution: 'function absoluteValue(n) {\n  return n < 0 ? -n : n;\n}\n',
      tests: [
        { args: [-5], expected: 5 },
        { args: [7], expected: 7 },
        { args: [0], expected: 0 },
        { args: [-100], expected: 100 },
      ],
    },
    {
      fn: 'distance',
      title: 'Distance on the number line',
      prompt: 'Return how many steps apart the integers a and b are on the number line. distance(-2, 5) → 7.',
      starter: 'function distance(a, b) {\n  // your code here\n}\n',
      solution: '// |a − b|, written out with a conditional\nfunction distance(a, b) {\n  const difference = a - b;\n  return difference < 0 ? -difference : difference;\n}\n',
      tests: [
        { args: [3, 7], expected: 4 },
        { args: [-2, 5], expected: 7 },
        { args: [-4, -9], expected: 5 },
        { args: [6, 6], expected: 0 },
      ],
    },
    {
      fn: 'signOf',
      title: 'The sign of a number',
      prompt: 'Return -1 if n is negative, 1 if it is positive and 0 if it is zero. signOf(-8) → -1.',
      starter: 'function signOf(n) {\n  // your code here\n}\n',
      solution: 'function signOf(n) {\n  if (n < 0) return -1;\n  if (n > 0) return 1;\n  return 0;\n}\n',
      tests: [
        { args: [-8], expected: -1 },
        { args: [12], expected: 1 },
        { args: [0], expected: 0 },
        { args: [-1], expected: -1 },
      ],
    },
    {
      fn: 'lowestPoint',
      title: 'Lowest balance',
      prompt: 'An account starts with the balance start. Each number in the changes array is a deposit (positive) or withdrawal (negative), applied in order. Return the lowest balance it ever reaches, counting the starting balance. lowestPoint(10, [-4, -9]) → -3.',
      starter: 'function lowestPoint(start, changes) {\n  // your code here\n}\n',
      solution: 'function lowestPoint(start, changes) {\n  let balance = start;\n  let lowest = start;\n  for (const change of changes) {\n    balance += change;\n    if (balance < lowest) lowest = balance;\n  }\n  return lowest;\n}\n',
      tests: [
        { args: [10, [-4, -9]], expected: -3 },
        { args: [0, [5, -8, 3]], expected: -3 },
        { args: [20, [5, 5]], expected: 20 },
        { args: [-2, []], expected: -2 },
      ],
    },
    {
      fn: 'signOfProduct',
      title: 'Sign of a product',
      prompt: 'Without multiplying, return the sign (-1, 0 or 1) of the product of all the integers in the array. Hint: a zero makes it 0; otherwise each negative flips the sign. signOfProduct([2, -3, 4]) → -1.',
      starter: 'function signOfProduct(numbers) {\n  // your code here\n}\n',
      solution: 'function signOfProduct(numbers) {\n  let sign = 1;\n  for (const n of numbers) {\n    if (n === 0) return 0;\n    if (n < 0) sign = -sign;\n  }\n  return sign;\n}\n',
      tests: [
        { args: [[2, -3, 4]], expected: -1 },
        { args: [[-1, -2]], expected: 1 },
        { args: [[5, 0, -2]], expected: 0 },
        { args: [[-3]], expected: -1 },
        { args: [[]], expected: 1 },
      ],
    },
  ],
};

initTopic(TOPIC);
