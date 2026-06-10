// JavaScript
// Runnable version of the "Currying / partial application" concept snippet.
// Run with Node:  ./run.sh      (or: node curry.js)

// A curried function takes its arguments one at a time. Calling add(a) returns a
// function that is still waiting for b — the closure captures a until b arrives.
const add = (a) => (b) => a + b;

// Partial application: fix the first argument now and reuse the result later.
// add(10) is already a complete one-argument function — "add ten".
const add10 = add(10);

console.log(add10(5));   // 15
console.log(add10(1));   // 11
console.log(add(3)(4));  // 7  — or supply both arguments in one chain

// Curry any ordinary two-argument function on demand: wrap it so it takes its
// arguments one at a time instead of all at once.
const curry2 = (f) => (x) => (y) => f(x, y);

const multiply = (x, y) => x * y;
const triple = curry2(multiply)(3);  // fix x = 3, leave y open
console.log(triple(5));  // 15
