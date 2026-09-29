// Runnable specs for the solve sessions, keyed by source slug. An algorithm
// without an entry still opens the editor, but Run has no test harness yet.
//
// Each spec provides:
//   fn          - the function (or class) name the learner must define
//   helpers     - optional extra names the learner must define (e.g. deserialize);
//                 when present, `reference` is an object holding fn and every helper
//   jsStarter   - starter code shown on the JavaScript page
//   javaStarter - starter code shown on the Java page
//   reference   - a correct JS implementation, used to compute the expected output
//   tests       - argument tuples to run the function against
// and, when the plain values are not enough, optional adapters (see
// runImplementation in solve.js): prepare, exec, finish and normalize.
//
// The reference is called exactly like the learner's code, so its function
// name and signature match the starter.

// Most entries in a linked list, tree or graph that the adapters will read back,
// so a learner's cycle cannot hang the page.
const STRUCTURE_READ_LIMIT = 10000;

// Node types provided to every learner's code, with the fields the exercises name.
class ListNode {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}

class TreeNode {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

class GraphNode {
  constructor(val) {
    this.val = val;
    this.neighbors = [];
  }
}

// ---- adapter helpers: build inputs from plain arrays, read results back ------

// Build a linked list from an array of values (null for an empty array).
function arrayToList(values) {
  let head = null;
  for (let i = values.length - 1; i >= 0; i--) head = new ListNode(values[i], head);
  return head;
}

// Read a linked list back into an array of values.
function listToArray(head) {
  const values = [];
  for (let node = head; node && values.length < STRUCTURE_READ_LIMIT; node = node.next) values.push(node.value);
  return values;
}

// Build a list whose tail links back to the node at index position (-1 = no cycle).
function listWithCycle(values, position) {
  const head = arrayToList(values);
  if (position >= 0 && head) {
    let target = head;
    for (let i = 0; i < position; i++) target = target.next;
    let tail = head;
    while (tail.next) tail = tail.next;
    tail.next = target;
  }
  return head;
}

// Build a binary tree from a level-order array, where null marks a missing child.
function arrayToTree(items) {
  const nodes = items.map(value => (value === null ? null : new TreeNode(value)));
  let next = 1; // index of the next unassigned child
  for (const node of nodes) {
    if (!node) continue;
    if (next < nodes.length) node.left = nodes[next++];
    if (next < nodes.length) node.right = nodes[next++];
  }
  return nodes[0] || null;
}

// Read a binary tree back into a level-order array (trailing nulls trimmed).
function treeToArray(root) {
  const items = [];
  const queue = [root];
  for (let i = 0; i < queue.length && items.length < STRUCTURE_READ_LIMIT; i++) {
    const node = queue[i];
    if (node) {
      items.push(node.value);
      queue.push(node.left, node.right);
    } else {
      items.push(null);
    }
  }
  while (items.length > 0 && items[items.length - 1] === null) items.pop();
  return items;
}

// Insert a key into a binary search tree (duplicates are ignored).
function bstInsert(node, key) {
  if (!node) return new TreeNode(key);
  if (key < node.value) node.left = bstInsert(node.left, key);
  else if (key > node.value) node.right = bstInsert(node.right, key);
  return node;
}

// Build a binary search tree by inserting the keys one after another.
function bstFromKeys(keys) {
  let root = null;
  for (const key of keys) root = bstInsert(root, key);
  return root;
}

// Values of a tree in inorder (left, node, right).
function treeInorder(root) {
  return root ? [...treeInorder(root.left), root.value, ...treeInorder(root.right)] : [];
}

// Turn rows of text into a grid of one-character strings.
function gridToChars(rows) {
  return rows.map(row => [...row]);
}

// Build a graph from 1-indexed adjacency lists; returns every node (node i has val i + 1).
function graphFromAdjacency(adjacency) {
  const nodes = adjacency.map((_, i) => new GraphNode(i + 1));
  adjacency.forEach((neighbors, i) => {
    nodes[i].neighbors = neighbors.map(val => nodes[val - 1]);
  });
  return nodes;
}

// Every node reachable from start.
function collectGraph(start) {
  if (!start) return [];
  const seen = new Set([start]);
  const stack = [start];
  while (stack.length > 0 && seen.size < STRUCTURE_READ_LIMIT) {
    for (const neighbor of stack.pop().neighbors) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return [...seen];
}

// Neighbour vals of every node reachable from start, ordered by node val.
function adjacencyOf(start) {
  return collectGraph(start)
    .sort((a, b) => a.val - b.val)
    .map(node => node.neighbors.map(neighbor => neighbor.val).sort((a, b) => a - b));
}

// ---- the specs ---------------------------------------------------------------

const CHALLENGES = {
  reverseastring: {
    fn: 'reverse',
    jsStarter: 'function reverse(s) {\n  // your code here\n}\n',
    javaStarter: 'static String reverse(String s) {\n    // your code here\n}\n',
    reference: (s) => [...s].reverse().join(''),
    tests: [['hello'], ['racecar'], ['OpenAI'], ['']],
  },
  palindromecheck: {
    fn: 'isPalindrome',
    jsStarter: '// Return true if the string reads the same forwards and backwards.\nfunction isPalindrome(s) {\n  // your code here\n}\n',
    javaStarter: '// Return true if the string reads the same forwards and backwards.\nstatic boolean isPalindrome(String s) {\n    // your code here\n}\n',
    reference: function isPalindrome(s) {
      return s === [...s].reverse().join('');
    },
    tests: [
      [ 'racecar' ],
      [ 'hello' ],
      [ 'noon' ],
      [ 'a' ],
      [ 'ab' ],
      [ '' ],
    ],
  },
  findmaxmininarray: {
    fn: 'findMinMax',
    jsStarter: '// Return [min, max] of a non-empty array.\nfunction findMinMax(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return [min, max] of a non-empty array.\nstatic int[] findMinMax(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — built-in: Math.max / Math.min with the spread operator.
      // (Very large arrays can overflow the call stack; use a loop for those.)
      function maxOf(numbers) {
        return Math.max(...numbers);
      }

      // Approach 2 — manual: one pass carrying the best values so far.
      function findMinMax(numbers) {
        if (numbers == null || numbers.length === 0) {
          throw new Error('Array cannot be empty');
        }
        let min = numbers[0];
        let max = numbers[0];
        for (const number of numbers) {
          if (number < min) min = number;
          if (number > max) max = number;
        }
        return [min, max];
      }
      return findMinMax;
    })(),
    tests: [
      [ [ 3, 7, 1, 9, 4 ] ],
      [ [ 5 ] ],
      [ [ -2, -8, -1 ] ],
      [ [ 4, 4, 4 ] ],
    ],
  },
  countcharacteroccurrences: {
    fn: 'countChar',
    jsStarter: '// Return how many times the character target appears in text.\nfunction countChar(text, target) {\n  // your code here\n}\n',
    javaStarter: '// Return how many times the character target appears in text.\nstatic int countChar(String text, char target) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — one character: scan and count the matches.
      function countChar(text, target) {
        let count = 0;
        for (const char of text) {
          if (char === target) count++;
        }
        return count;
      }

      // Approach 2 — every character: a Map from character to its count.
      function countAllChars(text) {
        const counts = new Map();
        for (const char of text) {
          counts.set(char, (counts.get(char) || 0) + 1); // default to 0 on first sight
        }
        return counts;
      }
      return countChar;
    })(),
    tests: [
      [ 'hello world', 'l' ],
      [ 'hello', 'z' ],
      [ '', 'a' ],
      [ 'aaaa', 'a' ],
    ],
  },
  fizzbuzz: {
    fn: 'fizzBuzz',
    jsStarter: '// Return the strings for 1..n: "Fizz" for multiples of 3, "Buzz" for 5, "FizzBuzz" for both, else the number as a string.\nfunction fizzBuzz(n) {\n  // your code here\n}\n',
    javaStarter: '// Return the strings for 1..n: "Fizz" for multiples of 3, "Buzz" for 5, "FizzBuzz" for both, else the number as a string.\nstatic List<String> fizzBuzz(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — check the combined case first, then each single case.
      function fizzBuzz(n) {
        const result = [];
        for (let i = 1; i <= n; i++) {
          if (i % 15 === 0) result.push('FizzBuzz');
          else if (i % 3 === 0) result.push('Fizz');
          else if (i % 5 === 0) result.push('Buzz');
          else result.push(String(i));
        }
        return result;
      }

      // Approach 2 — build the word by appending; no combined check needed.
      function fizzBuzzAppend(n) {
        const result = [];
        for (let i = 1; i <= n; i++) {
          let word = '';
          if (i % 3 === 0) word += 'Fizz';
          if (i % 5 === 0) word += 'Buzz';
          result.push(word || String(i));
        }
        return result;
      }
      return fizzBuzz;
    })(),
    tests: [
      [ 1 ],
      [ 5 ],
      [ 15 ],
      [ 0 ],
    ],
  },
  factorialiterative: {
    fn: 'factorial',
    jsStarter: '// Return n! using a loop (0! is 1).\nfunction factorial(n) {\n  // your code here\n}\n',
    javaStarter: '// Return n! using a loop (0! is 1).\nstatic long factorial(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // Iterative factorial with a Number; exact only up to 18!.
      function factorial(n) {
        if (n < 0) {
          throw new Error('n cannot be negative');
        }
        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return result;
      }

      // Arbitrary size: BigInt never loses precision.
      function factorialBig(n) {
        let result = 1n;
        for (let i = 2n; i <= BigInt(n); i++) {
          result *= i;
        }
        return result;
      }
      return factorial;
    })(),
    tests: [
      [ 0 ],
      [ 1 ],
      [ 5 ],
      [ 10 ],
    ],
  },
  fibonacciiterative: {
    fn: 'fibonacci',
    jsStarter: '// Return the n-th Fibonacci number using a loop (F(0) = 0, F(1) = 1).\nfunction fibonacci(n) {\n  // your code here\n}\n',
    javaStarter: '// Return the n-th Fibonacci number using a loop (F(0) = 0, F(1) = 1).\nstatic long fibonacci(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // Iterative Fibonacci: slide a two-number window along the sequence.
      function fibonacci(n) {
        if (n < 0) {
          throw new Error('n cannot be negative');
        }
        let previous = 0;
        let current = 1;
        for (let i = 0; i < n; i++) {
          [previous, current] = [current, previous + current];
        }
        return previous; // after n steps, previous holds F(n)
      }
      return fibonacci;
    })(),
    tests: [
      [ 0 ],
      [ 1 ],
      [ 2 ],
      [ 10 ],
      [ 30 ],
    ],
  },
  sumofarray: {
    fn: 'sum',
    jsStarter: '// Return the sum of the array (0 for an empty array).\nfunction sum(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return the sum of the array (0 for an empty array).\nstatic long sum(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — built-in: reduce folds the array into one value.
      function sumOf(numbers) {
        return numbers.reduce((total, number) => total + number, 0);
      }

      // Approach 2 — manual: accumulate in a loop.
      function sum(numbers) {
        let total = 0;
        for (const number of numbers) {
          total += number;
        }
        return total;
      }
      return sum;
    })(),
    tests: [
      [ [ 1, 2, 3, 4 ] ],
      [ [] ],
      [ [ -1, 1 ] ],
      [ [ 100 ] ],
    ],
  },
  primecheck: {
    fn: 'isPrime',
    jsStarter: '// Return true if n is prime.\nfunction isPrime(n) {\n  // your code here\n}\n',
    javaStarter: '// Return true if n is prime.\nstatic boolean isPrime(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // Trial division up to the square root, skipping even divisors.
      function isPrime(n) {
        if (!Number.isInteger(n) || n < 2) return false;
        if (n % 2 === 0) return n === 2; // 2 is the only even prime
        for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
          if (n % divisor === 0) {
            return false; // found a factor
          }
        }
        return true;
      }
      return isPrime;
    })(),
    tests: [
      [ 2 ],
      [ 1 ],
      [ 0 ],
      [ 97 ],
      [ 91 ],
      [ 7919 ],
    ],
  },
  removeduplicatesarray: {
    fn: 'removeDuplicates',
    jsStarter: '// Return a new array without duplicates, keeping the first occurrence of each value in order.\nfunction removeDuplicates(items) {\n  // your code here\n}\n',
    javaStarter: '// Return a new array without duplicates, keeping the first occurrence of each value in order.\nstatic List<Integer> removeDuplicates(int[] items) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — built-in: a Set drops duplicates but keeps insertion order.
      function removeDuplicates(items) {
        return [...new Set(items)];
      }

      // Approach 2 — sorted input: compare each element with the last one kept.
      function removeDuplicatesSorted(sorted) {
        if (sorted.length === 0) return 0;
        let write = 1; // next slot for a new unique value
        for (let read = 1; read < sorted.length; read++) {
          if (sorted[read] !== sorted[write - 1]) {
            sorted[write++] = sorted[read];
          }
        }
        return write; // length of the de-duplicated prefix
      }
      return removeDuplicates;
    })(),
    tests: [
      [ [ 1, 2, 2, 3, 1 ] ],
      [ [] ],
      [ [ 5, 5, 5 ] ],
      [ [ 3, 1, 2 ] ],
    ],
  },
  twosum: {
    fn: 'twoSum',
    jsStarter: '// Return the indices of the two numbers that add up to target (exactly one pair exists; either index order is fine).\nfunction twoSum(numbers, target) {\n  // your code here\n}\n',
    javaStarter: '// Return the indices of the two numbers that add up to target (exactly one pair exists; either index order is fine).\nstatic int[] twoSum(int[] numbers, int target) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — brute force: try every pair.
      function twoSumBruteForce(numbers, target) {
        for (let i = 0; i < numbers.length; i++) {
          for (let j = i + 1; j < numbers.length; j++) {
            if (numbers[i] + numbers[j] === target) return [i, j];
          }
        }
        throw new Error('No two sum solution');
      }

      // Approach 2 — hash map: remember each value's index, look up the complement.
      function twoSum(numbers, target) {
        const indexByValue = new Map();
        for (let i = 0; i < numbers.length; i++) {
          const complement = target - numbers[i];
          if (indexByValue.has(complement)) return [indexByValue.get(complement), i];
          indexByValue.set(numbers[i], i);
        }
        throw new Error('No two sum solution');
      }
      return twoSum;
    })(),
    normalize: result => [...result].sort((a, b) => a - b),
    tests: [
      [ [ 2, 7, 11, 15 ], 9 ],
      [ [ 3, 2, 4 ], 6 ],
      [ [ 3, 3 ], 6 ],
      [ [ -1, -2, -3, -4, -5 ], -8 ],
    ],
  },
  binarysearch: {
    fn: 'binarySearch',
    jsStarter: '// Return the index of target in the sorted array of distinct values, or -1 if absent.\nfunction binarySearch(sorted, target) {\n  // your code here\n}\n',
    javaStarter: '// Return the index of target in the sorted array of distinct values, or -1 if absent.\nstatic int binarySearch(int[] sorted, int target) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — iterative: shrink the window [low, high] until it is empty.
      function binarySearch(sorted, target) {
        let low = 0;
        let high = sorted.length - 1;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          if (sorted[mid] === target) return mid;
          if (sorted[mid] < target) low = mid + 1;  // target is in the right half
          else high = mid - 1;                      // target is in the left half
        }
        return -1;
      }

      // Approach 2 — recursive: the same halving, expressed as a self-call.
      function binarySearchRecursive(sorted, target, low = 0, high = sorted.length - 1) {
        if (low > high) return -1;
        const mid = Math.floor((low + high) / 2);
        if (sorted[mid] === target) return mid;
        return sorted[mid] < target
          ? binarySearchRecursive(sorted, target, mid + 1, high)
          : binarySearchRecursive(sorted, target, low, mid - 1);
      }
      return binarySearch;
    })(),
    tests: [
      [ [ 1, 3, 5, 7, 9, 11 ], 7 ],
      [ [ 1, 3, 5, 7, 9, 11 ], 1 ],
      [ [ 1, 3, 5, 7, 9, 11 ], 11 ],
      [ [ 1, 3, 5 ], 4 ],
      [ [], 1 ],
    ],
  },
  bubblesort: {
    fn: 'bubbleSort',
    jsStarter: '// Sort the array with bubble sort and return it.\nfunction bubbleSort(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Sort the array with bubble sort and return it.\nstatic int[] bubbleSort(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Bubble sort with an early exit when a pass makes no swaps.
      function bubbleSort(numbers) {
        for (let pass = 0; pass < numbers.length - 1; pass++) {
          let swapped = false;
          for (let i = 0; i < numbers.length - 1 - pass; i++) { // the tail is already sorted
            if (numbers[i] > numbers[i + 1]) {
              [numbers[i], numbers[i + 1]] = [numbers[i + 1], numbers[i]];
              swapped = true;
            }
          }
          if (!swapped) break; // no swaps: sorted
        }
        return numbers;
      }
      return bubbleSort;
    })(),
    tests: [
      [ [ 5, 2, 9, 1, 5, 6 ] ],
      [ [] ],
      [ [ 1, 2, 3 ] ],
      [ [ 3, 2, 1 ] ],
    ],
  },
  insertionsort: {
    fn: 'insertionSort',
    jsStarter: '// Sort the array with insertion sort and return it.\nfunction insertionSort(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Sort the array with insertion sort and return it.\nstatic int[] insertionSort(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Insertion sort: grow a sorted prefix, inserting one element at a time.
      function insertionSort(numbers) {
        for (let i = 1; i < numbers.length; i++) {
          const key = numbers[i];
          let j = i - 1;
          while (j >= 0 && numbers[j] > key) {
            numbers[j + 1] = numbers[j]; // shift the larger element right
            j--;
          }
          numbers[j + 1] = key; // drop the key into the gap
        }
        return numbers;
      }
      return insertionSort;
    })(),
    tests: [
      [ [ 5, 2, 9, 1, 5, 6 ] ],
      [ [] ],
      [ [ 1, 2, 3 ] ],
      [ [ 3, 2, 1 ] ],
    ],
  },
  mergetwosortedarrays: {
    fn: 'mergeSorted',
    jsStarter: '// Merge two sorted arrays into one sorted array.\nfunction mergeSorted(left, right) {\n  // your code here\n}\n',
    javaStarter: '// Merge two sorted arrays into one sorted array.\nstatic int[] mergeSorted(int[] left, int[] right) {\n    // your code here\n}\n',
    reference: (() => {
      // Merge two sorted arrays with one pointer per array.
      function mergeSorted(left, right) {
        const merged = [];
        let i = 0;
        let j = 0;
        while (i < left.length && j < right.length) {
          merged.push(left[i] <= right[j] ? left[i++] : right[j++]); // take the smaller
        }
        while (i < left.length) merged.push(left[i++]);   // leftovers from left
        while (j < right.length) merged.push(right[j++]); // leftovers from right
        return merged;
      }
      return mergeSorted;
    })(),
    tests: [
      [ [ 1, 3, 5 ], [ 2, 4, 6 ] ],
      [ [], [ 1 ] ],
      [ [ 1, 1 ], [ 1 ] ],
      [ [ 1, 2, 3 ], [ 4, 5 ] ],
    ],
  },
  missingnumber: {
    fn: 'missingNumber',
    jsStarter: '// The array holds n distinct numbers from 0..n; return the one that is missing.\nfunction missingNumber(numbers) {\n  // your code here\n}\n',
    javaStarter: '// The array holds n distinct numbers from 0..n; return the one that is missing.\nstatic int missingNumber(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — sum: expected total minus actual total.
      function missingNumberSum(numbers) {
        const n = numbers.length;
        const expected = n * (n + 1) / 2;
        const actual = numbers.reduce((total, number) => total + number, 0);
        return expected - actual;
      }

      // Approach 2 — XOR: matching values cancel out, leaving the missing one.
      function missingNumber(numbers) {
        let result = numbers.length; // start with n, since indices only reach n - 1
        for (let i = 0; i < numbers.length; i++) {
          result ^= i ^ numbers[i];
        }
        return result;
      }
      return missingNumber;
    })(),
    tests: [
      [ [ 3, 0, 1 ] ],
      [ [ 0, 1 ] ],
      [ [ 1 ] ],
      [
  [
    9, 6, 4, 2, 3,
    5, 7, 0, 1
  ]
],
    ],
  },
  reverselinkedlistiterative: {
    fn: 'reverseList',
    jsStarter: '// Reverse the singly linked list and return the new head. ListNode has fields value and next.\nfunction reverseList(head) {\n  // your code here\n}\n',
    javaStarter: '// Reverse the singly linked list and return the new head. ListNode has fields value and next.\nstatic ListNode reverseList(ListNode head) {\n    // your code here\n}\n',
    reference: (() => {
      class ListNode {
        constructor(value, next = null) {
          this.value = value;
          this.next = next;
        }
      }

      // Reverse in place by re-pointing every node at its predecessor.
      function reverseList(head) {
        let previous = null;
        let current = head;
        while (current) {
          const next = current.next; // save the rest before breaking the link
          current.next = previous;   // point backwards
          previous = current;        // advance both pointers
          current = next;
        }
        return previous; // the old tail is the new head
      }
      return reverseList;
    })(),
    prepare: ([values]) => [arrayToList(values)],
    finish: head => listToArray(head),
    tests: [
      [ [ 1, 2, 3, 4, 5 ] ],
      [ [ 1, 2 ] ],
      [ [] ],
      [ [ 7 ] ],
    ],
  },
  balancedparentheses: {
    fn: 'isBalanced',
    jsStarter: '// Return true if every (, [ and { is closed by the matching bracket in the right order.\nfunction isBalanced(text) {\n  // your code here\n}\n',
    javaStarter: '// Return true if every (, [ and { is closed by the matching bracket in the right order.\nstatic boolean isBalanced(String text) {\n    // your code here\n}\n',
    reference: (() => {
      // Stack of openers: each closer must match the most recent opener.
      function isBalanced(text) {
        const closerToOpener = { ')': '(', ']': '[', '}': '{' };
        const stack = [];
        for (const char of text) {
          if ('([{'.includes(char)) {
            stack.push(char);
          } else if (char in closerToOpener) {
            if (stack.pop() !== closerToOpener[char]) return false; // wrong or missing opener
          }
        }
        return stack.length === 0; // leftover openers mean unbalanced
      }
      return isBalanced;
    })(),
    tests: [
      [ '([]{})' ],
      [ '(]' ],
      [ '(()' ],
      [ ')(' ],
      [ '' ],
      [ '{[()]}' ],
    ],
  },
  selectionsort: {
    fn: 'selectionSort',
    jsStarter: '// Sort the array with selection sort and return it.\nfunction selectionSort(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Sort the array with selection sort and return it.\nstatic int[] selectionSort(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Selection sort: swap the minimum of the unsorted part into place.
      function selectionSort(numbers) {
        for (let i = 0; i < numbers.length - 1; i++) {
          let smallest = i;
          for (let j = i + 1; j < numbers.length; j++) {
            if (numbers[j] < numbers[smallest]) smallest = j;
          }
          [numbers[i], numbers[smallest]] = [numbers[smallest], numbers[i]];
        }
        return numbers;
      }
      return selectionSort;
    })(),
    tests: [
      [ [ 64, 25, 12, 22, 11 ] ],
      [ [] ],
      [ [ 2, 1 ] ],
      [ [ 1, 1, 1 ] ],
    ],
  },
  countvowels: {
    fn: 'countVowels',
    jsStarter: '// Return the number of vowels (a, e, i, o, u, either case) in the text.\nfunction countVowels(text) {\n  // your code here\n}\n',
    javaStarter: '// Return the number of vowels (a, e, i, o, u, either case) in the text.\nstatic int countVowels(String text) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — loop: test each character against the vowel string.
      function countVowels(text) {
        let count = 0;
        for (const char of text.toLowerCase()) {
          if ('aeiou'.includes(char)) count++;
        }
        return count;
      }

      // Approach 2 — regex: match every vowel and count the matches.
      function countVowelsRegex(text) {
        return (text.match(/[aeiou]/gi) || []).length; // match() returns null when there are none
      }
      return countVowels;
    })(),
    tests: [
      [ 'Hello World' ],
      [ '' ],
      [ 'rhythm' ],
      [ 'AEIOU' ],
    ],
  },
  anagramcheck: {
    fn: 'isAnagram',
    jsStarter: '// Return true if b is a rearrangement of a (ignore case).\nfunction isAnagram(a, b) {\n  // your code here\n}\n',
    javaStarter: '// Return true if b is a rearrangement of a (ignore case).\nstatic boolean isAnagram(String a, String b) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — sort both strings and compare them.
      function isAnagramSorted(a, b) {
        const normalize = text => [...text.toLowerCase()].sort().join('');
        return normalize(a) === normalize(b);
      }

      // Approach 2 — count letters: increment for the first string, decrement for the second.
      function isAnagram(a, b) {
        if (a.length !== b.length) return false;
        const counts = new Map();
        for (const char of a.toLowerCase()) counts.set(char, (counts.get(char) || 0) + 1);
        for (const char of b.toLowerCase()) {
          if (!counts.get(char)) return false; // letter is missing or over-used
          counts.set(char, counts.get(char) - 1);
        }
        return true;
      }
      return isAnagram;
    })(),
    tests: [
      [ 'listen', 'silent' ],
      [ 'hello', 'world' ],
      [ 'aab', 'abb' ],
      [ 'a', 'ab' ],
      [ 'Listen', 'Silent' ],
    ],
  },
  firstnonrepeatingcharacter: {
    fn: 'firstNonRepeating',
    jsStarter: '// Return the first character that appears only once, or null if there is none.\nfunction firstNonRepeating(text) {\n  // your code here\n}\n',
    javaStarter: '// Return the first character that appears only once, or null if there is none.\nstatic Character firstNonRepeating(String text) {\n    // your code here\n}\n',
    reference: (() => {
      // Two passes: count every character, then find the first with count 1.
      function firstNonRepeating(text) {
        const counts = new Map();
        for (const char of text) counts.set(char, (counts.get(char) || 0) + 1);
        for (const char of text) {
          if (counts.get(char) === 1) return char; // first in original order
        }
        return null; // every character repeats
      }
      return firstNonRepeating;
    })(),
    tests: [
      [ 'swiss' ],
      [ 'aabb' ],
      [ 'leetcode' ],
      [ '' ],
    ],
  },
  movezeroes: {
    fn: 'moveZeroes',
    jsStarter: '// Move every 0 to the end, keeping the order of the other elements; return the array.\nfunction moveZeroes(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Move every 0 to the end, keeping the order of the other elements; return the array.\nstatic int[] moveZeroes(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Two pointers: pack the non-zeroes to the front, then zero-fill the rest.
      function moveZeroes(numbers) {
        let write = 0; // next slot for a non-zero value
        for (let read = 0; read < numbers.length; read++) {
          if (numbers[read] !== 0) {
            numbers[write++] = numbers[read];
          }
        }
        while (write < numbers.length) {
          numbers[write++] = 0;
        }
        return numbers;
      }
      return moveZeroes;
    })(),
    tests: [
      [ [ 0, 1, 0, 3, 12 ] ],
      [ [ 0, 0 ] ],
      [ [] ],
      [ [ 1, 2 ] ],
    ],
  },
  rotatearraybyk: {
    fn: 'rotate',
    jsStarter: '// Rotate the array to the right by k steps (k may exceed the length) and return it.\nfunction rotate(numbers, k) {\n  // your code here\n}\n',
    javaStarter: '// Rotate the array to the right by k steps (k may exceed the length) and return it.\nstatic int[] rotate(int[] numbers, int k) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — extra array: element i lands at (i + k) % n.
      function rotateCopy(numbers, k) {
        const n = numbers.length;
        const rotated = new Array(n);
        for (let i = 0; i < n; i++) {
          rotated[(i + k) % n] = numbers[i];
        }
        return rotated;
      }

      // Approach 2 — in place: reverse everything, then reverse each part.
      function rotate(numbers, k) {
        const n = numbers.length;
        k %= n; // rotating by n changes nothing
        reverse(numbers, 0, n - 1);
        reverse(numbers, 0, k - 1);
        reverse(numbers, k, n - 1);
        return numbers;
      }

      function reverse(numbers, from, to) {
        while (from < to) {
          [numbers[from], numbers[to]] = [numbers[to], numbers[from]];
          from++;
          to--;
        }
      }
      return rotate;
    })(),
    tests: [
      [
  [
    1, 2, 3, 4,
    5, 6, 7
  ],
  3
],
      [ [ 1, 2 ], 5 ],
      [ [ 1, 2, 3 ], 0 ],
      [ [ 1 ], 4 ],
    ],
  },
  gcdeuclidean: {
    fn: 'gcd',
    jsStarter: '// Return the greatest common divisor of a and b.\nfunction gcd(a, b) {\n  // your code here\n}\n',
    javaStarter: '// Return the greatest common divisor of a and b.\nstatic int gcd(int a, int b) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — iterative Euclid: replace (a, b) with (b, a mod b).
      function gcd(a, b) {
        while (b !== 0) {
          [a, b] = [b, a % b];
        }
        return Math.abs(a);
      }

      // Approach 2 — recursive: the same rule as a self-call.
      function gcdRecursive(a, b) {
        return b === 0 ? Math.abs(a) : gcdRecursive(b, a % b);
      }
      return gcd;
    })(),
    tests: [
      [ 48, 18 ],
      [ 7, 0 ],
      [ 0, 5 ],
      [ 17, 5 ],
      [ 100, 75 ],
    ],
  },
  factorialrecursive: {
    fn: 'factorial',
    jsStarter: '// Return n! using recursion (0! is 1).\nfunction factorial(n) {\n  // your code here\n}\n',
    javaStarter: '// Return n! using recursion (0! is 1).\nstatic long factorial(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // Recursive factorial: n! = n * (n - 1)!
      function factorial(n) {
        if (n < 0) {
          throw new Error('n cannot be negative');
        }
        if (n <= 1) {
          return 1; // base case: 0! = 1! = 1
        }
        return n * factorial(n - 1);
      }
      return factorial;
    })(),
    tests: [
      [ 0 ],
      [ 1 ],
      [ 5 ],
      [ 10 ],
    ],
  },
  fibonaccirecursivememo: {
    fn: 'fibonacci',
    jsStarter: '// Return the n-th Fibonacci number using recursion with memoization (F(0) = 0, F(1) = 1).\nfunction fibonacci(n) {\n  // your code here\n}\n',
    javaStarter: '// Return the n-th Fibonacci number using recursion with memoization (F(0) = 0, F(1) = 1).\nstatic long fibonacci(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // Naive recursion: exponential, because it recomputes the same values.
      function fibNaive(n) {
        return n < 2 ? n : fibNaive(n - 1) + fibNaive(n - 2);
      }

      // Memoized recursion: each F(k) is computed once and cached.
      function fibonacci(n, cache = new Map()) {
        if (n < 2) return n; // base cases: F(0) = 0, F(1) = 1
        if (cache.has(n)) return cache.get(n);
        const result = fibonacci(n - 1, cache) + fibonacci(n - 2, cache);
        cache.set(n, result);
        return result;
      }
      return fibonacci;
    })(),
    tests: [
      [ 0 ],
      [ 1 ],
      [ 10 ],
      [ 40 ],
      [ 50 ],
    ],
  },
  mergesort: {
    fn: 'mergeSort',
    jsStarter: '// Sort the array with merge sort and return the sorted array.\nfunction mergeSort(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Sort the array with merge sort and return the sorted array.\nstatic int[] mergeSort(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Merge sort: split, sort each half, merge. Returns a new sorted array.
      function mergeSort(numbers) {
        if (numbers.length <= 1) return numbers; // base case: already sorted
        const middle = Math.floor(numbers.length / 2);
        const left = mergeSort(numbers.slice(0, middle));
        const right = mergeSort(numbers.slice(middle));
        return merge(left, right);
      }

      // Merge two sorted arrays into one sorted array.
      function merge(left, right) {
        const merged = [];
        let i = 0;
        let j = 0;
        while (i < left.length && j < right.length) {
          merged.push(left[i] <= right[j] ? left[i++] : right[j++]); // <= keeps it stable
        }
        return merged.concat(left.slice(i), right.slice(j));
      }
      return mergeSort;
    })(),
    tests: [
      [
  [
    38, 27, 43, 3,
     9, 82, 10
  ]
],
      [ [] ],
      [ [ 2, 1, 2 ] ],
      [ [ 5, 4, 3, 2, 1 ] ],
    ],
  },
  quicksort: {
    fn: 'quickSort',
    jsStarter: '// Sort the array with quick sort and return it.\nfunction quickSort(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Sort the array with quick sort and return it.\nstatic int[] quickSort(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Quick sort in place, using the Lomuto partition scheme.
      function quickSort(numbers, low = 0, high = numbers.length - 1) {
        if (low >= high) return numbers; // zero or one element: sorted
        const pivotIndex = partition(numbers, low, high);
        quickSort(numbers, low, pivotIndex - 1);
        quickSort(numbers, pivotIndex + 1, high);
        return numbers;
      }

      // Move everything smaller than the pivot (last element) to the left; return the pivot's final index.
      function partition(numbers, low, high) {
        const pivot = numbers[high];
        let boundary = low; // everything before boundary is < pivot
        for (let i = low; i < high; i++) {
          if (numbers[i] < pivot) {
            [numbers[i], numbers[boundary]] = [numbers[boundary], numbers[i]];
            boundary++;
          }
        }
        [numbers[boundary], numbers[high]] = [numbers[high], numbers[boundary]]; // pivot to its final place
        return boundary;
      }
      return quickSort;
    })(),
    tests: [
      [ [ 10, 7, 8, 9, 1, 5 ] ],
      [ [] ],
      [ [ 3, 3, 1, 3 ] ],
      [ [ 1, 2, 3, 4 ] ],
    ],
  },
  flattennestedarray: {
    fn: 'flatten',
    jsStarter: '// Flatten an array nested to any depth into a single flat array.\nfunction flatten(items) {\n  // your code here\n}\n',
    javaStarter: '// Flatten an array nested to any depth into a single flat array.\nstatic List<Integer> flatten(List<?> items) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — built-in: flat(Infinity) flattens to any depth.
      function flattenBuiltIn(items) {
        return items.flat(Infinity);
      }

      // Approach 2 — recursive: open up nested arrays, keep everything else.
      function flatten(items) {
        const flat = [];
        for (const item of items) {
          if (Array.isArray(item)) {
            flat.push(...flatten(item)); // recurse into the nested array
          } else {
            flat.push(item);
          }
        }
        return flat;
      }
      return flatten;
    })(),
    tests: [
      [
  [ 1, [ 2, [ 3, 4 ] ], 5 ]
],
      [ [] ],
      [ [ [ [] ] ] ],
      [
  [
    [ 1, 2 ],
    [ 3, [ 4, [ 5 ] ] ]
  ]
],
    ],
  },
  pairsumtarget: {
    fn: 'findPairs',
    jsStarter: '// Return every unique pair of values [a, b] (a <= b) that sums to target.\nfunction findPairs(numbers, target) {\n  // your code here\n}\n',
    javaStarter: '// Return every unique pair of values [a, b] (a <= b) that sums to target.\nstatic List<int[]> findPairs(int[] numbers, int target) {\n    // your code here\n}\n',
    reference: (() => {
      // Two pointers on a sorted copy: close in from both ends.
      function findPairs(numbers, target) {
        const sorted = [...numbers].sort((a, b) => a - b);
        const pairs = [];
        let left = 0;
        let right = sorted.length - 1;
        while (left < right) {
          const sum = sorted[left] + sorted[right];
          if (sum === target) {
            pairs.push([sorted[left], sorted[right]]);
            const leftValue = sorted[left];
            const rightValue = sorted[right];
            while (left < right && sorted[left] === leftValue) left++;    // skip repeated values
            while (left < right && sorted[right] === rightValue) right--;
          } else if (sum < target) {
            left++;  // need a bigger sum
          } else {
            right--; // need a smaller sum
          }
        }
        return pairs;
      }
      return findPairs;
    })(),
    normalize: result => result.map(pair => [...pair].sort((a, b) => a - b)).sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    tests: [
      [ [ 1, 5, 7, -1, 5 ], 6 ],
      [ [ 1, 2, 3, 4 ], 5 ],
      [ [ 3, 3, 3 ], 6 ],
      [ [ 1, 2 ], 9 ],
    ],
  },
  longestcommonprefix: {
    fn: 'longestCommonPrefix',
    jsStarter: '// Return the longest prefix shared by every word ("" if none).\nfunction longestCommonPrefix(words) {\n  // your code here\n}\n',
    javaStarter: '// Return the longest prefix shared by every word ("" if none).\nstatic String longestCommonPrefix(String[] words) {\n    // your code here\n}\n',
    reference: (() => {
      // Vertical scan: compare column by column against the first word.
      function longestCommonPrefix(words) {
        if (!words || words.length === 0) return '';
        for (let column = 0; column < words[0].length; column++) {
          const expected = words[0][column];
          for (const word of words) {
            if (column === word.length || word[column] !== expected) {
              return words[0].slice(0, column); // mismatch or word too short
            }
          }
        }
        return words[0]; // the first word is a prefix of all the others
      }
      return longestCommonPrefix;
    })(),
    tests: [
      [ [ 'flower', 'flow', 'flight' ] ],
      [ [ 'dog', 'car' ] ],
      [ [ 'a' ] ],
      [ [] ],
      [ [ 'ab', 'a' ] ],
    ],
  },
  romantointeger: {
    fn: 'romanToInt',
    jsStarter: '// Convert a Roman numeral (I V X L C D M) to an integer.\nfunction romanToInt(roman) {\n  // your code here\n}\n',
    javaStarter: '// Convert a Roman numeral (I V X L C D M) to an integer.\nstatic int romanToInt(String roman) {\n    // your code here\n}\n',
    reference: (() => {
      // Left to right: subtract a symbol that precedes a larger one, otherwise add it.
      function romanToInt(roman) {
        const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
        let total = 0;
        for (let i = 0; i < roman.length; i++) {
          const current = values[roman[i]];
          const next = values[roman[i + 1]]; // undefined at the end, so the comparison is false
          total += next > current ? -current : current;
        }
        return total;
      }
      return romanToInt;
    })(),
    tests: [
      [ 'III' ],
      [ 'LVIII' ],
      [ 'MCMXCIV' ],
      [ 'IX' ],
      [ 'IV' ],
    ],
  },
  validipaddress: {
    fn: 'isValidIPv4',
    jsStarter: '// Return true for a valid IPv4 address: four numbers 0-255 separated by dots, no leading zeroes.\nfunction isValidIPv4(address) {\n  // your code here\n}\n',
    javaStarter: '// Return true for a valid IPv4 address: four numbers 0-255 separated by dots, no leading zeroes.\nstatic boolean isValidIPv4(String address) {\n    // your code here\n}\n',
    reference: (() => {
      // Split on dots and validate each of the four parts.
      function isValidIPv4(address) {
        const parts = address.split('.');
        if (parts.length !== 4) return false;
        return parts.every(part =>
          /^\d{1,3}$/.test(part) &&            // 1-3 digits, nothing else
          (part === '0' || part[0] !== '0') &&  // no leading zeroes
          Number(part) <= 255
        );
      }
      return isValidIPv4;
    })(),
    tests: [
      [ '192.168.1.1' ],
      [ '0.0.0.0' ],
      [ '256.1.1.1' ],
      [ '1.1.1' ],
      [ '01.1.1.1' ],
      [ '1.1.1.1.' ],
      [ 'a.b.c.d' ],
    ],
  },
  pascalstriangle: {
    fn: 'pascalTriangle',
    jsStarter: "// Return the first rowCount rows of Pascal's triangle.\nfunction pascalTriangle(rowCount) {\n  // your code here\n}\n",
    javaStarter: "// Return the first rowCount rows of Pascal's triangle.\nstatic List<List<Integer>> pascalTriangle(int rowCount) {\n    // your code here\n}\n",
    reference: (() => {
      // Build each row from the previous one by summing adjacent pairs.
      function pascalTriangle(rowCount) {
        const rows = [];
        for (let r = 0; r < rowCount; r++) {
          const row = [1]; // every row starts with 1
          for (let c = 1; c < r; c++) {
            row.push(rows[r - 1][c - 1] + rows[r - 1][c]);
          }
          if (r > 0) row.push(1); // ...and ends with 1 (the first row is just [1])
          rows.push(row);
        }
        return rows;
      }
      return pascalTriangle;
    })(),
    tests: [
      [ 5 ],
      [ 0 ],
      [ 1 ],
      [ 3 ],
    ],
  },
  fastexponentiation: {
    fn: 'power',
    jsStarter: '// Return base raised to an integer exponent (which may be negative) in O(log n) multiplications.\nfunction power(base, exponent) {\n  // your code here\n}\n',
    javaStarter: '// Return base raised to an integer exponent (which may be negative) in O(log n) multiplications.\nstatic double power(double base, int exponent) {\n    // your code here\n}\n',
    reference: (() => {
      // Iterative exponentiation by squaring, one bit of the exponent at a time.
      function power(base, exponent) {
        let remaining = Math.abs(exponent);
        let square = exponent < 0 ? 1 / base : base;
        let result = 1;
        while (remaining > 0) {
          if (remaining % 2 === 1) result *= square; // odd: take one factor out
          square *= square;                          // square the base
          remaining = Math.floor(remaining / 2);     // halve the exponent
        }
        return result;
      }

      // Recursive version: x^n = (x^(n/2))^2, times x when n is odd.
      function powerRecursive(base, exponent) {
        if (exponent === 0) return 1;
        const half = powerRecursive(base, Math.trunc(exponent / 2));
        return exponent % 2 === 0 ? half * half : half * half * base;
      }
      return power;
    })(),
    tests: [
      [ 2, 10 ],
      [ 2, -2 ],
      [ 5, 0 ],
      [ 3, 5 ],
      [ 7, 1 ],
    ],
  },
  linkedlistcycle: {
    fn: 'hasCycle',
    jsStarter: '// Return true if the linked list contains a cycle. ListNode has fields value and next.\nfunction hasCycle(head) {\n  // your code here\n}\n',
    javaStarter: '// Return true if the linked list contains a cycle. ListNode has fields value and next.\nstatic boolean hasCycle(ListNode head) {\n    // your code here\n}\n',
    reference: (() => {
      class ListNode {
        constructor(value, next = null) {
          this.value = value;
          this.next = next;
        }
      }

      // Approach 1 — remember every visited node in a set (O(n) memory).
      function hasCycleWithSet(head) {
        const visited = new Set();
        for (let node = head; node; node = node.next) {
          if (visited.has(node)) return true;
          visited.add(node);
        }
        return false;
      }

      // Approach 2 — Floyd's tortoise and hare: O(1) memory.
      function hasCycle(head) {
        let slow = head;
        let fast = head;
        while (fast && fast.next) {
          slow = slow.next;       // one step
          fast = fast.next.next;  // two steps
          if (slow === fast) return true; // the hare lapped the tortoise
        }
        return false; // the hare reached the end
      }
      return hasCycle;
    })(),
    prepare: ([values, position]) => [listWithCycle(values, position)],
    tests: [
      [ [ 3, 2, 0, -4 ], 1 ],
      [ [ 1, 2 ], -1 ],
      [ [ 1 ], 0 ],
      [ [], -1 ],
      [ [ 1, 2, 3, 4, 5 ], 0 ],
    ],
  },
  middleoflinkedlist: {
    fn: 'middleNode',
    jsStarter: '// Return the middle node (the second middle for an even length), or null for an empty list. ListNode has fields value and next.\nfunction middleNode(head) {\n  // your code here\n}\n',
    javaStarter: '// Return the middle node (the second middle for an even length), or null for an empty list. ListNode has fields value and next.\nstatic ListNode middleNode(ListNode head) {\n    // your code here\n}\n',
    reference: (() => {
      class ListNode {
        constructor(value, next = null) {
          this.value = value;
          this.next = next;
        }
      }

      // Slow/fast pointers: when fast reaches the end, slow is in the middle.
      function middleNode(head) {
        let slow = head;
        let fast = head;
        while (fast && fast.next) {
          slow = slow.next;       // one step
          fast = fast.next.next;  // two steps
        }
        return slow;
      }
      return middleNode;
    })(),
    prepare: ([values]) => [arrayToList(values)],
    finish: node => (node ? node.value : null),
    tests: [
      [ [ 1, 2, 3, 4, 5 ] ],
      [ [ 1, 2, 3, 4 ] ],
      [ [ 7 ] ],
      [ [] ],
    ],
  },
  levelordertraversal: {
    fn: 'levelOrder',
    jsStarter: '// Return the node values level by level, left to right. TreeNode has fields value, left and right.\nfunction levelOrder(root) {\n  // your code here\n}\n',
    javaStarter: '// Return the node values level by level, left to right. TreeNode has fields value, left and right.\nstatic List<List<Integer>> levelOrder(TreeNode root) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      // BFS with a queue, processing one whole level per outer iteration.
      function levelOrder(root) {
        const levels = [];
        if (!root) return levels;
        const queue = [root];
        while (queue.length > 0) {
          const levelSize = queue.length; // nodes on the current level
          const level = [];
          for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            level.push(node.value);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
          }
          levels.push(level);
        }
        return levels;
      }
      return levelOrder;
    })(),
    prepare: ([items]) => [arrayToTree(items)],
    tests: [
      [
  [
    3,    9,    20,
    null, null, 15,
    7
  ]
],
      [ [ 1 ] ],
      [ [] ],
      [ [ 1, 2, 3, 4, 5 ] ],
    ],
  },
  treedfstraversals: {
    fn: 'traversals',
    jsStarter: '// Return [preorder, inorder, postorder], each an array of node values. TreeNode has fields value, left and right.\nfunction traversals(root) {\n  // your code here\n}\n',
    javaStarter: '// Return [preorder, inorder, postorder], each an array of node values. TreeNode has fields value, left and right.\nstatic List<List<Integer>> traversals(TreeNode root) {\n    // your code here\n}\n',
    reference: function traversals(root) {
      const preorder = [];
      const inorder = [];
      const postorder = [];
      const visit = node => {
        if (!node) return;
        preorder.push(node.value);
        visit(node.left);
        inorder.push(node.value);
        visit(node.right);
        postorder.push(node.value);
      };
      visit(root);
      return [preorder, inorder, postorder];
    },
    prepare: ([items]) => [arrayToTree(items)],
    tests: [
      [ [ 1, 2, 3, 4, 5 ] ],
      [ [ 1 ] ],
      [ [] ],
      [ [ 1, null, 2, 3 ] ],
    ],
  },
  bstoperations: {
    fn: 'deleteNode',
    jsStarter: '// Delete key from the binary search tree (if present) and return the new root. TreeNode has fields value, left and right.\nfunction deleteNode(root, key) {\n  // your code here\n}\n',
    javaStarter: '// Delete key from the binary search tree (if present) and return the new root. TreeNode has fields value, left and right.\nstatic TreeNode deleteNode(TreeNode root, int key) {\n    // your code here\n}\n',
    reference: function deleteNode(root, key) {
      if (!root) return null;
      if (key < root.value) {
        root.left = deleteNode(root.left, key);
      } else if (key > root.value) {
        root.right = deleteNode(root.right, key);
      } else {
        if (!root.left) return root.right;
        if (!root.right) return root.left;
        let successor = root.right;
        while (successor.left) successor = successor.left;
        root.value = successor.value;
        root.right = deleteNode(root.right, successor.value);
      }
      return root;
    },
    prepare: ([keys, key]) => [bstFromKeys(keys), key],
    finish: root => treeInorder(root),
    tests: [
      [
  [
    50, 30, 70, 20,
    40, 60, 80
  ],
  30
],
      [
  [
    50, 30, 70, 20,
    40, 60, 80
  ],
  50
],
      [
  [
    50, 30, 70, 20,
    40, 60, 80
  ],
  20
],
      [ [ 5, 3 ], 9 ],
      [ [ 5 ], 5 ],
    ],
  },
  validbst: {
    fn: 'isValidBST',
    jsStarter: '// Return true if the tree is a valid binary search tree (strictly smaller on the left, strictly larger on the right). TreeNode has fields value, left and right.\nfunction isValidBST(root) {\n  // your code here\n}\n',
    javaStarter: '// Return true if the tree is a valid binary search tree (strictly smaller on the left, strictly larger on the right). TreeNode has fields value, left and right.\nstatic boolean isValidBST(TreeNode root) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      // Pass the allowed (low, high) range down the tree.
      function isValidBST(node, low = -Infinity, high = Infinity) {
        if (!node) return true;
        if (node.value <= low || node.value >= high) return false; // outside the allowed range
        return isValidBST(node.left, low, node.value)      // left values must be < this node
            && isValidBST(node.right, node.value, high);   // right values must be > this node
      }
      return isValidBST;
    })(),
    prepare: ([items]) => [arrayToTree(items)],
    tests: [
      [ [ 2, 1, 3 ] ],
      [
  [
    5,    1,    4,
    null, null, 3,
    6
  ]
],
      [ [] ],
      [ [ 2, 2 ] ],
      [
  [
    5,    4,    6,
    null, null, 3,
    7
  ]
],
    ],
  },
  lowestcommonancestorbst: {
    fn: 'lowestCommonAncestor',
    jsStarter: '// Return the lowest common ancestor node of values p and q in the binary search tree. TreeNode has fields value, left and right.\nfunction lowestCommonAncestor(root, p, q) {\n  // your code here\n}\n',
    javaStarter: '// Return the lowest common ancestor node of values p and q in the binary search tree. TreeNode has fields value, left and right.\nstatic TreeNode lowestCommonAncestor(TreeNode root, int p, int q) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      // Walk down until p and q fall on different sides of the current node.
      function lowestCommonAncestor(root, p, q) {
        let node = root;
        while (node) {
          if (p < node.value && q < node.value) node = node.left;        // both in the left subtree
          else if (p > node.value && q > node.value) node = node.right;  // both in the right subtree
          else return node;                                               // the paths split here
        }
        return null;
      }
      return lowestCommonAncestor;
    })(),
    prepare: ([keys, p, q]) => [bstFromKeys(keys), p, q],
    finish: node => node.value,
    tests: [
      [
  [
    6, 2, 8, 0,
    4, 7, 9
  ],
  2,
  8
],
      [
  [
    6, 2, 8, 0,
    4, 7, 9
  ],
  2,
  4
],
      [
  [
    6, 2, 8, 0,
    4, 7, 9
  ],
  7,
  9
],
      [
  [
    6, 2, 8, 0,
    4, 7, 9
  ],
  0,
  4
],
    ],
  },
  diameterofbinarytree: {
    fn: 'diameterOfBinaryTree',
    jsStarter: '// Return the length, in edges, of the longest path between any two nodes. TreeNode has fields value, left and right.\nfunction diameterOfBinaryTree(root) {\n  // your code here\n}\n',
    javaStarter: '// Return the length, in edges, of the longest path between any two nodes. TreeNode has fields value, left and right.\nstatic int diameterOfBinaryTree(TreeNode root) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      // Compute the diameter with one post-order pass.
      function diameterOfBinaryTree(root) {
        let best = 0; // longest path found so far, in edges

        // Returns the node's height and updates 'best' with the longest path bending here.
        function height(node) {
          if (!node) return 0;
          const left = height(node.left);
          const right = height(node.right);
          best = Math.max(best, left + right);
          return 1 + Math.max(left, right);
        }

        height(root);
        return best;
      }
      return diameterOfBinaryTree;
    })(),
    prepare: ([items]) => [arrayToTree(items)],
    tests: [
      [ [ 1, 2, 3, 4, 5 ] ],
      [ [ 1 ] ],
      [ [] ],
      [ [ 1, 2 ] ],
      [ [ 1, 2, null, 3, null, 4 ] ],
    ],
  },
  maxdepthbinarytree: {
    fn: 'maxDepth',
    jsStarter: '// Return the number of nodes on the longest root-to-leaf path (0 for an empty tree). TreeNode has fields value, left and right.\nfunction maxDepth(root) {\n  // your code here\n}\n',
    javaStarter: '// Return the number of nodes on the longest root-to-leaf path (0 for an empty tree). TreeNode has fields value, left and right.\nstatic int maxDepth(TreeNode root) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      // Approach 1 — recursion: 1 + the deeper subtree.
      function maxDepth(root) {
        if (!root) return 0; // base case: an empty tree
        return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
      }

      // Approach 2 — BFS: count the levels.
      function maxDepthBfs(root) {
        if (!root) return 0;
        let level = [root];
        let depth = 0;
        while (level.length > 0) {
          depth++;
          level = level.flatMap(node => [node.left, node.right]).filter(Boolean); // the next level
        }
        return depth;
      }
      return maxDepth;
    })(),
    prepare: ([items]) => [arrayToTree(items)],
    tests: [
      [
  [
    3,    9,    20,
    null, null, 15,
    7
  ]
],
      [ [ 1 ] ],
      [ [] ],
      [ [ 1, 2, null, 3 ] ],
    ],
  },
  numberofislands: {
    fn: 'numIslands',
    jsStarter: '// Count the islands of "1" cells connected horizontally or vertically. grid is an array of arrays of "1" / "0" characters.\nfunction numIslands(grid) {\n  // your code here\n}\n',
    javaStarter: '// Count the islands of "1" cells connected horizontally or vertically. grid is an array of arrays of "1" / "0" characters.\nstatic int numIslands(char[][] grid) {\n    // your code here\n}\n',
    reference: (() => {
      // Count islands: every unvisited land cell starts a new flood fill.
      function numIslands(grid) {
        let islands = 0;
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === '1') {
              islands++;
              sink(grid, r, c); // erase the whole island so it is not counted again
            }
          }
        }
        return islands;
      }

      // DFS: turn this land cell and all connected land into water.
      function sink(grid, r, c) {
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[r].length || grid[r][c] !== '1') return;
        grid[r][c] = '0';
        sink(grid, r + 1, c);
        sink(grid, r - 1, c);
        sink(grid, r, c + 1);
        sink(grid, r, c - 1);
      }
      return numIslands;
    })(),
    prepare: ([rows]) => [gridToChars(rows)],
    tests: [
      [ [ '11000', '11000', '00100', '00011' ] ],
      [ [ '111', '010', '111' ] ],
      [ [ '000' ] ],
      [ [] ],
      [ [ '101', '010', '101' ] ],
    ],
  },
  clonegraph: {
    fn: 'cloneGraph',
    jsStarter: '// Return a deep copy of the connected graph reachable from node (null for null). Node has fields val and neighbors.\nfunction cloneGraph(node) {\n  // your code here\n}\n',
    javaStarter: '// Return a deep copy of the connected graph reachable from node (null for null). Node has fields val and neighbors.\nstatic Node cloneGraph(Node node) {\n    // your code here\n}\n',
    reference: (() => {
      class GraphNode {
        constructor(val) {
          this.val = val;
          this.neighbors = [];
        }
      }

      // DFS clone: the map links each original node to its copy and also serves as the visited set.
      function cloneGraph(node, copies = new Map()) {
        if (!node) return null;
        if (copies.has(node)) return copies.get(node); // already cloned: reuse
        const copy = new GraphNode(node.val);
        copies.set(node, copy); // register before recursing so cycles terminate
        for (const neighbor of node.neighbors) {
          copy.neighbors.push(cloneGraph(neighbor, copies));
        }
        return copy;
      }
      return cloneGraph;
    })(),
    prepare: ([adjacency]) => [graphFromAdjacency(adjacency)],
    exec: (cloneGraph, [nodes]) => {
      const copy = cloneGraph(nodes[0] || null);
      const originals = new Set(nodes);
      return { adjacency: adjacencyOf(copy), sharesNodes: collectGraph(copy).some(node => originals.has(node)) };
    },
    tests: [
      [ [ [ 2, 4 ], [ 1, 3 ], [ 2, 4 ], [ 1, 3 ] ] ],
      [ [ [] ] ],
      [ [] ],
      [ [ [ 2 ], [ 1 ] ] ],
    ],
  },
  productexceptself: {
    fn: 'productExceptSelf',
    jsStarter: '// Return an array where each element is the product of all the other elements — without division, in O(n).\nfunction productExceptSelf(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return an array where each element is the product of all the other elements — without division, in O(n).\nstatic int[] productExceptSelf(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Two sweeps: prefix products left to right, then suffix products right to left.
      function productExceptSelf(numbers) {
        const n = numbers.length;
        const result = new Array(n).fill(1);
        let left = 1;
        for (let i = 0; i < n; i++) {
          result[i] = left;   // product of everything before i
          left *= numbers[i];
        }
        let right = 1;
        for (let i = n - 1; i >= 0; i--) {
          result[i] *= right; // multiply by the product of everything after i
          right *= numbers[i];
        }
        return result;
      }
      return productExceptSelf;
    })(),
    tests: [
      [ [ 1, 2, 3, 4 ] ],
      [ [ 0, 2, 3 ] ],
      [ [ 0, 0 ] ],
      [ [ -1, 1, 0, -3, 3 ] ],
    ],
  },
  maximumsubarraykadane: {
    fn: 'maxSubArray',
    jsStarter: '// Return the largest sum of a contiguous non-empty subarray.\nfunction maxSubArray(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return the largest sum of a contiguous non-empty subarray.\nstatic int maxSubArray(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Kadane's algorithm: best sum of a subarray ending at each position.
      function maxSubArray(numbers) {
        let current = numbers[0]; // best sum ending at the current index
        let best = numbers[0];    // best sum seen anywhere
        for (let i = 1; i < numbers.length; i++) {
          current = Math.max(numbers[i], current + numbers[i]); // extend, or start over
          best = Math.max(best, current);
        }
        return best;
      }
      return maxSubArray;
    })(),
    tests: [
      [
  [
    -2, 1, -3, 4, -1,
     2, 1, -5, 4
  ]
],
      [ [ -3, -1, -2 ] ],
      [ [ 5 ] ],
      [ [ 1, 2, 3 ] ],
    ],
  },
  containerwithmostwater: {
    fn: 'maxArea',
    jsStarter: '// Return the most water two of the vertical lines can hold (width x the shorter height).\nfunction maxArea(heights) {\n  // your code here\n}\n',
    javaStarter: '// Return the most water two of the vertical lines can hold (width x the shorter height).\nstatic int maxArea(int[] heights) {\n    // your code here\n}\n',
    reference: (() => {
      // Two pointers: always discard the shorter line, since it limits the area.
      function maxArea(heights) {
        let left = 0;
        let right = heights.length - 1;
        let best = 0;
        while (left < right) {
          const width = right - left;
          const height = Math.min(heights[left], heights[right]); // water level = shorter line
          best = Math.max(best, width * height);
          if (heights[left] < heights[right]) left++; // move the limiting side
          else right--;
        }
        return best;
      }
      return maxArea;
    })(),
    tests: [
      [
  [
    1, 8, 6, 2, 5,
    4, 8, 3, 7
  ]
],
      [ [ 1, 1 ] ],
      [ [] ],
      [ [ 4, 3, 2, 1, 4 ] ],
    ],
  },
  threesum: {
    fn: 'threeSum',
    jsStarter: '// Return all unique triplets [a, b, c] that sum to 0.\nfunction threeSum(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return all unique triplets [a, b, c] that sum to 0.\nstatic List<List<Integer>> threeSum(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Sort, fix the first number, then two-pointer the remaining pair.
      function threeSum(numbers) {
        const sorted = [...numbers].sort((a, b) => a - b);
        const triplets = [];
        for (let i = 0; i < sorted.length - 2; i++) {
          if (i > 0 && sorted[i] === sorted[i - 1]) continue; // skip a repeated first number
          let left = i + 1;
          let right = sorted.length - 1;
          while (left < right) {
            const sum = sorted[i] + sorted[left] + sorted[right];
            if (sum < 0) {
              left++;  // need a larger sum
            } else if (sum > 0) {
              right--; // need a smaller sum
            } else {
              triplets.push([sorted[i], sorted[left], sorted[right]]);
              left++;
              right--;
              while (left < right && sorted[left] === sorted[left - 1]) left++; // skip repeats
            }
          }
        }
        return triplets;
      }
      return threeSum;
    })(),
    normalize: result => result.map(triplet => [...triplet].sort((a, b) => a - b)).sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    tests: [
      [ [ -1, 0, 1, 2, -1, -4 ] ],
      [ [ 0, 0, 0, 0 ] ],
      [ [ 1, 2 ] ],
      [ [] ],
      [ [ -2, 0, 1, 1, 2 ] ],
    ],
  },
  slidingwindowmaximum: {
    fn: 'maxSlidingWindow',
    jsStarter: '// Return the maximum of every window of size k as it slides left to right.\nfunction maxSlidingWindow(numbers, k) {\n  // your code here\n}\n',
    javaStarter: '// Return the maximum of every window of size k as it slides left to right.\nstatic int[] maxSlidingWindow(int[] numbers, int k) {\n    // your code here\n}\n',
    reference: (() => {
      // Monotonic deque of indices (values decreasing): the front is the window max.
      function maxSlidingWindow(numbers, k) {
        const deque = []; // indices; shift() from the front, pop() from the back
        const maximums = [];
        for (let i = 0; i < numbers.length; i++) {
          if (deque.length > 0 && deque[0] <= i - k) {
            deque.shift(); // the front index left the window
          }
          while (deque.length > 0 && numbers[deque[deque.length - 1]] <= numbers[i]) {
            deque.pop();   // smaller values can never be the maximum again
          }
          deque.push(i);
          if (i >= k - 1) {
            maximums.push(numbers[deque[0]]);
          }
        }
        return maximums;
      }
      return maxSlidingWindow;
    })(),
    tests: [
      [
  [
    1, 3, -1, -3,
    5, 3,  6,  7
  ],
  3
],
      [ [ 1 ], 1 ],
      [ [ 9, 8, 7 ], 2 ],
      [
  [
    4, 3, 5, 4,
    3, 3, 6, 7
  ],
  3
],
    ],
  },
  longestsubstringwithoutrepeating: {
    fn: 'lengthOfLongestSubstring',
    jsStarter: '// Return the length of the longest substring without repeating characters.\nfunction lengthOfLongestSubstring(text) {\n  // your code here\n}\n',
    javaStarter: '// Return the length of the longest substring without repeating characters.\nstatic int lengthOfLongestSubstring(String text) {\n    // your code here\n}\n',
    reference: (() => {
      // Sliding window with a map of each character's last index.
      function lengthOfLongestSubstring(text) {
        const lastSeen = new Map();
        let start = 0;
        let best = 0;
        for (let end = 0; end < text.length; end++) {
          const char = text[end];
          if (lastSeen.has(char) && lastSeen.get(char) >= start) {
            start = lastSeen.get(char) + 1; // move past the earlier duplicate
          }
          lastSeen.set(char, end);
          best = Math.max(best, end - start + 1);
        }
        return best;
      }
      return lengthOfLongestSubstring;
    })(),
    tests: [
      [ 'abcabcbb' ],
      [ 'bbbbb' ],
      [ 'pwwkew' ],
      [ 'abba' ],
      [ '' ],
    ],
  },
  groupanagrams: {
    fn: 'groupAnagrams',
    jsStarter: '// Group the words that are anagrams of each other (group and word order do not matter).\nfunction groupAnagrams(words) {\n  // your code here\n}\n',
    javaStarter: '// Group the words that are anagrams of each other (group and word order do not matter).\nstatic List<List<String>> groupAnagrams(String[] words) {\n    // your code here\n}\n',
    reference: (() => {
      // Group by signature: the word's letters in sorted order.
      function groupAnagrams(words) {
        const groups = new Map();
        for (const word of words) {
          const key = [...word].sort().join(''); // every anagram produces the same key
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(word);
        }
        return [...groups.values()];
      }
      return groupAnagrams;
    })(),
    normalize: groups => groups.map(group => [...group].sort()).sort((a, b) => (a[0] < b[0] ? -1 : 1)),
    tests: [
      [ [ 'eat', 'tea', 'tan', 'ate', 'nat', 'bat' ] ],
      [ [] ],
      [ [ ' ' ] ],
      [ [ 'a' ] ],
    ],
  },
  topkfrequentelements: {
    fn: 'topKFrequent',
    jsStarter: '// Return the k most frequent values (any order).\nfunction topKFrequent(numbers, k) {\n  // your code here\n}\n',
    javaStarter: '// Return the k most frequent values (any order).\nstatic int[] topKFrequent(int[] numbers, int k) {\n    // your code here\n}\n',
    reference: (() => {
      // Count, then bucket the values by frequency and read from the top.
      function topKFrequent(numbers, k) {
        const counts = new Map();
        for (const n of numbers) counts.set(n, (counts.get(n) || 0) + 1);

        // buckets[c] holds every value that occurs exactly c times (c is at most n).
        const buckets = Array.from({ length: numbers.length + 1 }, () => []);
        for (const [value, count] of counts) buckets[count].push(value);

        const result = [];
        for (let count = buckets.length - 1; count > 0 && result.length < k; count--) {
          result.push(...buckets[count]);
        }
        return result.slice(0, k);
      }
      return topKFrequent;
    })(),
    normalize: result => [...result].sort((a, b) => a - b),
    tests: [
      [ [ 1, 1, 1, 2, 2, 3 ], 2 ],
      [ [ 1 ], 1 ],
      [ [ 4, 4, 5, 5, 5, 6 ], 1 ],
      [
  [
    1, 1, 2, 2, 2,
    3, 3, 3, 3
  ],
  2
],
    ],
  },
  kthlargestelement: {
    fn: 'findKthLargest',
    jsStarter: '// Return the k-th largest element of the array (duplicates count).\nfunction findKthLargest(numbers, k) {\n  // your code here\n}\n',
    javaStarter: '// Return the k-th largest element of the array (duplicates count).\nstatic int findKthLargest(int[] numbers, int k) {\n    // your code here\n}\n',
    reference: (() => {
      // Quickselect: partition, then follow only the side holding index n - k.
      function findKthLargest(numbers, k) {
        const work = [...numbers];
        const target = work.length - k;
        let low = 0;
        let high = work.length - 1;
        while (low < high) {
          const randomIndex = low + Math.floor(Math.random() * (high - low + 1));
          [work[randomIndex], work[high]] = [work[high], work[randomIndex]]; // random pivot to the end
          const pivot = work[high];
          let boundary = low;
          for (let i = low; i < high; i++) {
            if (work[i] < pivot) {
              [work[i], work[boundary]] = [work[boundary], work[i]];
              boundary++;
            }
          }
          [work[boundary], work[high]] = [work[high], work[boundary]];
          if (boundary === target) return work[boundary];
          if (boundary < target) low = boundary + 1;
          else high = boundary - 1;
        }
        return work[target];
      }
      return findKthLargest;
    })(),
    tests: [
      [ [ 3, 2, 1, 5, 6, 4 ], 2 ],
      [
  [
    3, 2, 3, 1, 2,
    4, 5, 5, 6
  ],
  4
],
      [ [ 1 ], 1 ],
      [ [ 2, 1 ], 2 ],
    ],
  },
  mergeintervals: {
    fn: 'merge',
    jsStarter: '// Merge all overlapping [start, end] intervals (touching ones merge too) and return them sorted by start.\nfunction merge(intervals) {\n  // your code here\n}\n',
    javaStarter: '// Merge all overlapping [start, end] intervals (touching ones merge too) and return them sorted by start.\nstatic int[][] merge(int[][] intervals) {\n    // your code here\n}\n',
    reference: (() => {
      // Sort by start, then sweep, extending or appending.
      function merge(intervals) {
        const sorted = intervals.map(([start, end]) => [start, end]).sort((a, b) => a[0] - b[0]);
        const merged = [];
        for (const [start, end] of sorted) {
          const last = merged[merged.length - 1];
          if (last && start <= last[1]) {
            last[1] = Math.max(last[1], end); // overlap: extend the last interval
          } else {
            merged.push([start, end]);        // gap: start a new one
          }
        }
        return merged;
      }
      return merge;
    })(),
    tests: [
      [ [ [ 1, 3 ], [ 2, 6 ], [ 8, 10 ], [ 15, 18 ] ] ],
      [ [ [ 1, 4 ], [ 4, 5 ] ] ],
      [ [ [ 1, 10 ], [ 2, 3 ] ] ],
      [ [] ],
      [ [ [ 5, 6 ], [ 1, 2 ] ] ],
    ],
  },
  jumpgame: {
    fn: 'canJump',
    jsStarter: '// Each element is the maximum jump length from that index. Return true if the last index is reachable from index 0.\nfunction canJump(jumps) {\n  // your code here\n}\n',
    javaStarter: '// Each element is the maximum jump length from that index. Return true if the last index is reachable from index 0.\nstatic boolean canJump(int[] jumps) {\n    // your code here\n}\n',
    reference: (() => {
      // Greedy: track the farthest index reachable so far.
      function canJump(jumps) {
        let farthest = 0;
        for (let i = 0; i < jumps.length; i++) {
          if (i > farthest) return false;            // stuck: index i can never be reached
          farthest = Math.max(farthest, i + jumps[i]);
        }
        return true;
      }
      return canJump;
    })(),
    tests: [
      [ [ 2, 3, 1, 1, 4 ] ],
      [ [ 3, 2, 1, 0, 4 ] ],
      [ [ 0 ] ],
      [ [ 0, 1 ] ],
      [ [ 1, 1, 1 ] ],
    ],
  },
  coinchange: {
    fn: 'coinChange',
    jsStarter: '// Return the fewest coins that make up amount, or -1 if impossible.\nfunction coinChange(coins, amount) {\n  // your code here\n}\n',
    javaStarter: '// Return the fewest coins that make up amount, or -1 if impossible.\nstatic int coinChange(int[] coins, int amount) {\n    // your code here\n}\n',
    reference: (() => {
      // Bottom-up DP: best[a] = fewest coins that make amount a.
      function coinChange(coins, amount) {
        const best = new Array(amount + 1).fill(Infinity);
        best[0] = 0;
        for (let a = 1; a <= amount; a++) {
          for (const coin of coins) {
            if (coin <= a) {
              best[a] = Math.min(best[a], best[a - coin] + 1);
            }
          }
        }
        return best[amount] === Infinity ? -1 : best[amount];
      }
      return coinChange;
    })(),
    tests: [
      [ [ 1, 2, 5 ], 11 ],
      [ [ 2 ], 3 ],
      [ [ 1 ], 0 ],
      [ [ 1, 3, 4 ], 6 ],
      [ [ 186, 419, 83, 408 ], 6249 ],
    ],
  },
  climbingstairs: {
    fn: 'climbStairs',
    jsStarter: '// Return the number of distinct ways to climb n stairs taking 1 or 2 steps at a time.\nfunction climbStairs(n) {\n  // your code here\n}\n',
    javaStarter: '// Return the number of distinct ways to climb n stairs taking 1 or 2 steps at a time.\nstatic int climbStairs(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // DP with two rolling values: ways(n) = ways(n - 1) + ways(n - 2).
      function climbStairs(n) {
        let twoBack = 1; // ways to reach step 0
        let oneBack = 1; // ways to reach step 1
        for (let step = 2; step <= n; step++) {
          [twoBack, oneBack] = [oneBack, oneBack + twoBack];
        }
        return oneBack;
      }
      return climbStairs;
    })(),
    tests: [
      [ 1 ],
      [ 2 ],
      [ 3 ],
      [ 5 ],
      [ 45 ],
    ],
  },
  houserobber: {
    fn: 'rob',
    jsStarter: '// Return the most you can rob without robbing two adjacent houses.\nfunction rob(money) {\n  // your code here\n}\n',
    javaStarter: '// Return the most you can rob without robbing two adjacent houses.\nstatic int rob(int[] money) {\n    // your code here\n}\n',
    reference: (() => {
      // DP with two rolling values: skip this house, or rob it and take the best from two back.
      function rob(money) {
        let twoBack = 0; // best total up to two houses ago
        let oneBack = 0; // best total up to the previous house
        for (const amount of money) {
          const current = Math.max(oneBack, twoBack + amount);
          twoBack = oneBack;
          oneBack = current;
        }
        return oneBack;
      }
      return rob;
    })(),
    tests: [
      [ [ 2, 7, 9, 3, 1 ] ],
      [ [ 1, 2, 3, 1 ] ],
      [ [ 5 ] ],
      [ [] ],
      [ [ 2, 1, 1, 2 ] ],
    ],
  },
  uniquepaths: {
    fn: 'uniquePaths',
    jsStarter: '// Return the number of paths from the top-left to the bottom-right of a grid moving only right or down.\nfunction uniquePaths(rows, columns) {\n  // your code here\n}\n',
    javaStarter: '// Return the number of paths from the top-left to the bottom-right of a grid moving only right or down.\nstatic int uniquePaths(int rows, int columns) {\n    // your code here\n}\n',
    reference: (() => {
      // DP over one row: each cell = paths from above + paths from the left.
      function uniquePaths(rows, columns) {
        const paths = new Array(columns).fill(1); // the first row: one way to reach each cell
        for (let r = 1; r < rows; r++) {
          for (let c = 1; c < columns; c++) {
            paths[c] += paths[c - 1]; // paths[c] is "from above", paths[c - 1] "from the left"
          }
        }
        return paths[columns - 1];
      }
      return uniquePaths;
    })(),
    tests: [
      [ 3, 7 ],
      [ 3, 2 ],
      [ 1, 5 ],
      [ 7, 3 ],
      [ 10, 10 ],
    ],
  },
  knapsack01: {
    fn: 'knapsack',
    jsStarter: '// Return the maximum total value that fits in the capacity, using each item at most once.\nfunction knapsack(weights, values, capacity) {\n  // your code here\n}\n',
    javaStarter: '// Return the maximum total value that fits in the capacity, using each item at most once.\nstatic int knapsack(int[] weights, int[] values, int capacity) {\n    // your code here\n}\n',
    reference: (() => {
      // 1-D DP: best[w] = max value with capacity w. Loop w downward so each item is used once.
      function knapsack(weights, values, capacity) {
        const best = new Array(capacity + 1).fill(0);
        for (let item = 0; item < weights.length; item++) {
          for (let w = capacity; w >= weights[item]; w--) {
            best[w] = Math.max(best[w], best[w - weights[item]] + values[item]);
          }
        }
        return best[capacity];
      }
      return knapsack;
    })(),
    tests: [
      [ [ 1, 3, 4, 5 ], [ 1, 4, 5, 7 ], 7 ],
      [ [ 5 ], [ 10 ], 4 ],
      [ [ 2, 3 ], [ 3, 4 ], 5 ],
      [ [], [], 10 ],
    ],
  },
  longestcommonsubsequence: {
    fn: 'longestCommonSubsequence',
    jsStarter: '// Return the length of the longest common subsequence of a and b.\nfunction longestCommonSubsequence(a, b) {\n  // your code here\n}\n',
    javaStarter: '// Return the length of the longest common subsequence of a and b.\nstatic int longestCommonSubsequence(String a, String b) {\n    // your code here\n}\n',
    reference: (() => {
      // DP table of prefix answers: table[i][j] = LCS of a[0..i) and b[0..j).
      function longestCommonSubsequence(a, b) {
        const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
              table[i][j] = table[i - 1][j - 1] + 1; // match extends the diagonal
            } else {
              table[i][j] = Math.max(table[i - 1][j], table[i][j - 1]); // drop one character
            }
          }
        }
        return table[a.length][b.length];
      }
      return longestCommonSubsequence;
    })(),
    tests: [
      [ 'abcde', 'ace' ],
      [ 'abc', 'def' ],
      [ 'abc', 'abc' ],
      [ '', '' ],
      [ 'AGGTAB', 'GXTXAYB' ],
    ],
  },
  decodeways: {
    fn: 'numDecodings',
    jsStarter: '// Return the number of ways to decode the digit string where 1 = A ... 26 = Z.\nfunction numDecodings(digits) {\n  // your code here\n}\n',
    javaStarter: '// Return the number of ways to decode the digit string where 1 = A ... 26 = Z.\nstatic int numDecodings(String digits) {\n    // your code here\n}\n',
    reference: (() => {
      // DP with two rolling counts over the digits.
      function numDecodings(digits) {
        if (digits === '' || digits[0] === '0') return 0; // a leading zero cannot be decoded
        let twoBack = 1; // decodings of the empty prefix
        let oneBack = 1; // decodings of the first digit
        for (let i = 1; i < digits.length; i++) {
          let current = 0;
          if (digits[i] !== '0') current += oneBack;         // last digit alone (1-9)
          const pair = Number(digits.slice(i - 1, i + 1));
          if (pair >= 10 && pair <= 26) current += twoBack;  // last two digits together
          [twoBack, oneBack] = [oneBack, current];
        }
        return oneBack;
      }
      return numDecodings;
    })(),
    tests: [
      [ '12' ],
      [ '226' ],
      [ '06' ],
      [ '10' ],
      [ '0' ],
      [ '100' ],
      [ '11106' ],
    ],
  },
  courseschedule: {
    fn: 'canFinish',
    jsStarter: '// Each pair [course, prerequisite] means the prerequisite must be taken first. Return true if all courses can be finished.\nfunction canFinish(courseCount, prerequisites) {\n  // your code here\n}\n',
    javaStarter: '// Each pair [course, prerequisite] means the prerequisite must be taken first. Return true if all courses can be finished.\nstatic boolean canFinish(int courseCount, int[][] prerequisites) {\n    // your code here\n}\n',
    reference: (() => {
      // Kahn's algorithm: peel off courses whose prerequisites are all done.
      function canFinish(courseCount, prerequisites) {
        const dependents = Array.from({ length: courseCount }, () => []);
        const waitingOn = new Array(courseCount).fill(0); // in-degree: prerequisites not yet taken
        for (const [course, prerequisite] of prerequisites) {
          dependents[prerequisite].push(course); // edge: prerequisite -> course
          waitingOn[course]++;
        }
        const ready = [];
        for (let course = 0; course < courseCount; course++) {
          if (waitingOn[course] === 0) ready.push(course);
        }
        let taken = 0;
        while (ready.length > 0) {
          const course = ready.shift();
          taken++;
          for (const next of dependents[course]) {
            if (--waitingOn[next] === 0) ready.push(next); // all its prerequisites are done
          }
        }
        return taken === courseCount; // leftovers mean a cycle
      }
      return canFinish;
    })(),
    tests: [
      [ 2, [ [ 1, 0 ] ] ],
      [ 2, [ [ 1, 0 ], [ 0, 1 ] ] ],
      [ 4, [ [ 1, 0 ], [ 2, 0 ], [ 3, 1 ], [ 3, 2 ] ] ],
      [ 1, [] ],
      [ 3, [ [ 1, 0 ], [ 2, 1 ], [ 0, 2 ] ] ],
    ],
  },
  dijkstrashortestpath: {
    fn: 'dijkstra',
    jsStarter: '// graph[u] lists [v, weight] edges (weights >= 0). Return the shortest distance from source to every node (Infinity if unreachable).\nfunction dijkstra(graph, source) {\n  // your code here\n}\n',
    javaStarter: '// graph[u] lists [v, weight] edges (weights >= 0). Return the shortest distance from source to every node (Infinity if unreachable).\nstatic int[] dijkstra(List<List<int[]>> graph, int source) {\n    // your code here\n}\n',
    reference: (() => {
      // A minimal binary min-heap of [priority, node] pairs.
      class MinHeap {
        constructor() { this.items = []; }
        get size() { return this.items.length; }
        push(item) {
          this.items.push(item);
          let i = this.items.length - 1;
          while (i > 0) { // sift up
            const parent = (i - 1) >> 1;
            if (this.items[parent][0] <= this.items[i][0]) break;
            [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
            i = parent;
          }
        }
        pop() {
          const top = this.items[0];
          const last = this.items.pop();
          if (this.items.length > 0) {
            this.items[0] = last;
            let i = 0;
            for (;;) { // sift down
              const left = 2 * i + 1;
              const right = left + 1;
              let smallest = i;
              if (left < this.items.length && this.items[left][0] < this.items[smallest][0]) smallest = left;
              if (right < this.items.length && this.items[right][0] < this.items[smallest][0]) smallest = right;
              if (smallest === i) break;
              [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
              i = smallest;
            }
          }
          return top;
        }
      }

      // Dijkstra with a min-heap. graph[u] holds [v, weight] edges.
      function dijkstra(graph, source) {
        const distance = new Array(graph.length).fill(Infinity);
        distance[source] = 0;
        const heap = new MinHeap();
        heap.push([0, source]);
        while (heap.size > 0) {
          const [dist, node] = heap.pop();
          if (dist > distance[node]) continue; // stale entry: a shorter route was found later
          for (const [next, weight] of graph[node]) {
            const candidate = dist + weight;
            if (candidate < distance[next]) {   // relax the edge
              distance[next] = candidate;
              heap.push([candidate, next]);
            }
          }
        }
        return distance;
      }
      return dijkstra;
    })(),
    tests: [
      [
  [ [ [ 1, 4 ], [ 2, 1 ] ], [ [ 3, 1 ] ], [ [ 1, 2 ], [ 3, 5 ] ], [] ],
  0
],
      [
  [ [ [ 1, 7 ] ], [ [ 2, 1 ] ], [] ],
  0
],
      [ [ [], [] ], 0 ],
      [
  [ [ [ 1, 2 ], [ 2, 6 ] ], [ [ 2, 3 ] ], [] ],
  0
],
    ],
  },
  bellmanford: {
    fn: 'bellmanFord',
    jsStarter: '// edges are [from, to, weight] (weights may be negative). Return the shortest distance from source to every node, or null if a negative cycle is reachable.\nfunction bellmanFord(nodeCount, edges, source) {\n  // your code here\n}\n',
    javaStarter: '// edges are [from, to, weight] (weights may be negative). Return the shortest distance from source to every node, or null if a negative cycle is reachable.\nstatic long[] bellmanFord(int nodeCount, int[][] edges, int source) {\n    // your code here\n}\n',
    reference: (() => {
      // Bellman-Ford over an edge list [from, to, weight]. Returns null if a negative cycle is reachable.
      function bellmanFord(nodeCount, edges, source) {
        const distance = new Array(nodeCount).fill(Infinity);
        distance[source] = 0;
        for (let round = 1; round < nodeCount; round++) {
          let changed = false;
          for (const [from, to, weight] of edges) {
            if (distance[from] + weight < distance[to]) {
              distance[to] = distance[from] + weight;
              changed = true;
            }
          }
          if (!changed) break; // already stable
        }
        for (const [from, to, weight] of edges) { // one more round: any improvement means a negative cycle
          if (distance[from] + weight < distance[to]) return null;
        }
        return distance;
      }
      return bellmanFord;
    })(),
    tests: [
      [ 4, [ [ 0, 1, 4 ], [ 0, 2, 5 ], [ 1, 2, -3 ], [ 2, 3, 2 ] ], 0 ],
      [ 3, [ [ 0, 1, 1 ], [ 1, 2, -3 ], [ 2, 1, 1 ] ], 0 ],
      [ 2, [], 0 ],
      [ 3, [ [ 0, 1, 2 ], [ 1, 2, 2 ], [ 0, 2, 5 ] ], 0 ],
    ],
  },
  floydwarshall: {
    fn: 'floydWarshall',
    jsStarter: '// dist is an n x n matrix (0 on the diagonal, Infinity where there is no edge). Return the matrix of shortest distances between every pair.\nfunction floydWarshall(dist) {\n  // your code here\n}\n',
    javaStarter: '// dist is an n x n matrix (0 on the diagonal, Infinity where there is no edge). Return the matrix of shortest distances between every pair.\nstatic int[][] floydWarshall(int[][] dist) {\n    // your code here\n}\n',
    reference: (() => {
      // Floyd-Warshall: dist is an n x n matrix with 0 on the diagonal and Infinity where there is no edge.
      function floydWarshall(dist) {
        const n = dist.length;
        for (let via = 0; via < n; via++) {          // intermediate node (must be the outer loop)
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
              if (dist[i][via] + dist[via][j] < dist[i][j]) {
                dist[i][j] = dist[i][via] + dist[via][j];
              }
            }
          }
        }
        return dist;
      }
      return floydWarshall;
    })(),
    tests: [
      [ [ [ 0, 3, Infinity, 7 ], [ 8, 0, 2, Infinity ], [ 5, Infinity, 0, 1 ], [ 2, Infinity, Infinity, 0 ] ] ],
      [ [ [ 0, 1 ], [ Infinity, 0 ] ] ],
      [ [ [ 0 ] ] ],
      [ [ [ 0, 4, Infinity ], [ Infinity, 0, -2 ], [ 1, Infinity, 0 ] ] ],
    ],
  },
  primsmst: {
    fn: 'primMst',
    jsStarter: '// graph[u] lists [v, weight] edges of an undirected graph. Return the total weight of a minimum spanning tree, or -1 if the graph is not connected.\nfunction primMst(graph) {\n  // your code here\n}\n',
    javaStarter: '// graph[u] lists [v, weight] edges of an undirected graph. Return the total weight of a minimum spanning tree, or -1 if the graph is not connected.\nstatic int primMst(List<List<int[]>> graph) {\n    // your code here\n}\n',
    reference: (() => {
      // Prim's algorithm. graph[u] holds [v, weight] pairs; returns the MST total weight (-1 if disconnected).
      // A small array kept sorted stands in for a heap: fine for a demo, use a real heap for big graphs.
      function primMst(graph) {
        const n = graph.length;
        const inTree = new Array(n).fill(false);
        const edges = [[0, 0]]; // [weight, node], cheapest last
        let total = 0;
        let added = 0;
        while (edges.length > 0 && added < n) {
          const [weight, node] = edges.pop(); // the cheapest edge leaving the tree
          if (inTree[node]) continue;         // reached by a cheaper edge already
          inTree[node] = true;
          total += weight;
          added++;
          for (const [next, edgeWeight] of graph[node]) {
            if (!inTree[next]) {
              edges.push([edgeWeight, next]);
              edges.sort((a, b) => b[0] - a[0]);
            }
          }
        }
        return added === n ? total : -1;
      }
      return primMst;
    })(),
    tests: [
      [
  [ [ [ 1, 4 ], [ 2, 3 ] ], [ [ 0, 4 ], [ 2, 1 ], [ 3, 2 ] ], [ [ 0, 3 ], [ 1, 1 ], [ 3, 4 ] ], [ [ 1, 2 ], [ 2, 4 ] ] ]
],
      [ [ [], [] ] ],
      [ [ [] ] ],
      [
  [ [ [ 1, 1 ] ], [ [ 0, 1 ], [ 2, 2 ] ], [ [ 1, 2 ] ] ]
],
    ],
  },
  kruskalsmst: {
    fn: 'kruskalMst',
    jsStarter: '// edges are undirected [a, b, weight]. Return the total weight of a minimum spanning tree (of a connected graph) using Union-Find.\nfunction kruskalMst(nodeCount, edges) {\n  // your code here\n}\n',
    javaStarter: '// edges are undirected [a, b, weight]. Return the total weight of a minimum spanning tree (of a connected graph) using Union-Find.\nstatic int kruskalMst(int nodeCount, int[][] edges) {\n    // your code here\n}\n',
    reference: (() => {
      // Union-Find with path compression and union by size.
      class UnionFind {
        constructor(n) {
          this.parent = Array.from({ length: n }, (_, i) => i); // every node starts as its own component
          this.size = new Array(n).fill(1);
        }

        find(node) {
          if (this.parent[node] !== node) this.parent[node] = this.find(this.parent[node]); // path compression
          return this.parent[node];
        }

        // Merge two components; false if they were already connected.
        union(a, b) {
          let rootA = this.find(a);
          let rootB = this.find(b);
          if (rootA === rootB) return false;
          if (this.size[rootA] < this.size[rootB]) [rootA, rootB] = [rootB, rootA];
          this.parent[rootB] = rootA; // attach the smaller tree under the larger
          this.size[rootA] += this.size[rootB];
          return true;
        }
      }

      // Kruskal: edges are [a, b, weight]. Returns the MST total weight.
      function kruskalMst(nodeCount, edges) {
        const sorted = [...edges].sort((x, y) => x[2] - y[2]);
        const components = new UnionFind(nodeCount);
        let total = 0;
        for (const [a, b, weight] of sorted) {
          if (components.union(a, b)) total += weight; // joins two components: keep it
        }
        return total;
      }
      return kruskalMst;
    })(),
    tests: [
      [ 4, [ [ 0, 1, 4 ], [ 0, 2, 3 ], [ 1, 2, 1 ], [ 1, 3, 2 ], [ 2, 3, 4 ] ] ],
      [ 1, [] ],
      [ 3, [ [ 0, 1, 1 ], [ 1, 2, 2 ], [ 0, 2, 3 ] ] ],
      [ 2, [ [ 0, 1, 9 ] ] ],
    ],
  },
  trie: {
    fn: 'Trie',
    jsStarter: '// Implement a Trie with insert(word), search(word) and startsWith(prefix).\nclass Trie {\n  // your code here\n}\n',
    javaStarter: '// Implement a Trie with insert(word), search(word) and startsWith(prefix).\nclass Trie {\n    // your code here\n}\n',
    reference: (() => {
      // A trie node: children keyed by character, plus an end-of-word flag.
      class TrieNode {
        constructor() {
          this.children = new Map();
          this.isWord = false; // true if a stored word ends here
        }
      }

      class Trie {
        constructor() {
          this.root = new TrieNode();
        }

        // Walk the word, creating missing nodes, and mark the last one as a word end.
        insert(word) {
          let node = this.root;
          for (const char of word) {
            if (!node.children.has(char)) node.children.set(char, new TrieNode());
            node = node.children.get(char);
          }
          node.isWord = true;
        }

        // True only if the exact word was inserted.
        search(word) {
          const node = this.find(word);
          return node !== null && node.isWord;
        }

        // True if any inserted word begins with the prefix.
        startsWith(prefix) {
          return this.find(prefix) !== null;
        }

        // Follow the characters; null when the path does not exist.
        find(text) {
          let node = this.root;
          for (const char of text) {
            node = node.children.get(char);
            if (!node) return null;
          }
          return node;
        }
      }
      return Trie;
    })(),
    exec: (Trie, [operations]) => {
      const trie = new Trie();
      const results = [];
      for (const [method, argument] of operations) {
        const result = trie[method](argument);
        if (method !== 'insert') results.push(result);
      }
      return results;
    },
    tests: [
      [ [ [ 'insert', 'apple' ], [ 'search', 'apple' ], [ 'search', 'app' ], [ 'startsWith', 'app' ], [ 'insert', 'app' ], [ 'search', 'app' ] ] ],
      [ [ [ 'search', 'a' ], [ 'startsWith', '' ], [ 'insert', 'bat' ], [ 'startsWith', 'ba' ], [ 'search', 'ba' ] ] ],
    ],
  },
  lrucache: {
    fn: 'LruCache',
    jsStarter: '// Implement an LRU cache: get(key) returns the value or -1; put(key, value) evicts the least recently used entry when over capacity.\nclass LruCache {\n  constructor(capacity) {\n    // your code here\n  }\n}\n',
    javaStarter: '// Implement an LRU cache: get(key) returns the value or -1; put(key, value) evicts the least recently used entry when over capacity.\nclass LruCache {\n    LruCache(int capacity) {\n        // your code here\n    }\n}\n',
    reference: (() => {
      // Approach 1 — Map: its insertion order doubles as the recency order.
      class LruCache {
        constructor(capacity) {
          this.capacity = capacity;
          this.entries = new Map(); // oldest (least recently used) first
        }

        get(key) {
          if (!this.entries.has(key)) return -1;
          const value = this.entries.get(key);
          this.entries.delete(key);       // re-insert to mark it most recent
          this.entries.set(key, value);
          return value;
        }

        put(key, value) {
          this.entries.delete(key);       // drop the old position if the key exists
          this.entries.set(key, value);
          if (this.entries.size > this.capacity) {
            this.entries.delete(this.entries.keys().next().value); // evict the oldest key
          }
        }
      }

      // Approach 2 — by hand: a hash map plus a doubly linked list (least recent next to head).
      class LruCacheManual {
        constructor(capacity) {
          this.capacity = capacity;
          this.nodes = new Map();
          this.head = { key: null, value: null, prev: null, next: null }; // sentinel: least recent side
          this.tail = { key: null, value: null, prev: null, next: null }; // sentinel: most recent side
          this.head.next = this.tail;
          this.tail.prev = this.head;
        }

        get(key) {
          const node = this.nodes.get(key);
          if (!node) return -1;
          this.unlink(node);
          this.appendMostRecent(node); // reading counts as a use
          return node.value;
        }

        put(key, value) {
          const existing = this.nodes.get(key);
          if (existing) this.unlink(existing);
          const node = { key, value, prev: null, next: null };
          this.nodes.set(key, node);
          this.appendMostRecent(node);
          if (this.nodes.size > this.capacity) {
            const eldest = this.head.next; // the least recently used node
            this.unlink(eldest);
            this.nodes.delete(eldest.key);
          }
        }

        unlink(node) {
          node.prev.next = node.next;
          node.next.prev = node.prev;
        }

        appendMostRecent(node) {
          node.prev = this.tail.prev;
          node.next = this.tail;
          this.tail.prev.next = node;
          this.tail.prev = node;
        }
      }
      return LruCache;
    })(),
    exec: (LruCache, [capacity, operations]) => {
      const cache = new LruCache(capacity);
      const results = [];
      for (const [method, ...argumentsList] of operations) {
        const result = cache[method](...argumentsList);
        if (method === 'get') results.push(result);
      }
      return results;
    },
    tests: [
      [ 2, [ [ 'put', 1, 1 ], [ 'put', 2, 2 ], [ 'get', 1 ], [ 'put', 3, 3 ], [ 'get', 2 ], [ 'put', 4, 4 ], [ 'get', 1 ], [ 'get', 3 ], [ 'get', 4 ] ] ],
      [ 1, [ [ 'put', 1, 1 ], [ 'put', 2, 2 ], [ 'get', 1 ], [ 'get', 2 ] ] ],
      [ 2, [ [ 'put', 1, 1 ], [ 'put', 2, 2 ], [ 'put', 1, 10 ], [ 'put', 3, 3 ], [ 'get', 1 ], [ 'get', 2 ] ] ],
    ],
  },
  lfucache: {
    fn: 'LfuCache',
    jsStarter: '// Implement an LFU cache: get(key) returns the value or -1; put(key, value) evicts the least frequently used entry (least recently used on a tie) when over capacity.\nclass LfuCache {\n  constructor(capacity) {\n    // your code here\n  }\n}\n',
    javaStarter: '// Implement an LFU cache: get(key) returns the value or -1; put(key, value) evicts the least frequently used entry (least recently used on a tie) when over capacity.\nclass LfuCache {\n    LfuCache(int capacity) {\n        // your code here\n    }\n}\n',
    reference: (() => {
      class LfuCache {
        constructor(capacity) {
          this.capacity = capacity;
          this.minCount = 0;
          this.values = new Map();
          this.counts = new Map();
          this.keysByCount = new Map(); // count -> Set of keys, oldest first (Sets keep insertion order)
        }

        get(key) {
          if (!this.values.has(key)) return -1;
          this.touch(key);
          return this.values.get(key);
        }

        put(key, value) {
          if (this.capacity === 0) return;
          if (this.values.has(key)) {
            this.values.set(key, value);
            this.touch(key);
            return;
          }
          if (this.values.size === this.capacity) {
            const oldestSet = this.keysByCount.get(this.minCount);
            const evicted = oldestSet.values().next().value; // least used, then oldest
            oldestSet.delete(evicted);
            this.values.delete(evicted);
            this.counts.delete(evicted);
          }
          this.values.set(key, value);
          this.counts.set(key, 1);
          if (!this.keysByCount.has(1)) this.keysByCount.set(1, new Set());
          this.keysByCount.get(1).add(key);
          this.minCount = 1; // a brand-new key always has the lowest count
        }

        // Record one more use: move the key from its count's set to the next count's set.
        touch(key) {
          const count = this.counts.get(key);
          const currentSet = this.keysByCount.get(count);
          currentSet.delete(key);
          if (count === this.minCount && currentSet.size === 0) this.minCount++;
          this.counts.set(key, count + 1);
          if (!this.keysByCount.has(count + 1)) this.keysByCount.set(count + 1, new Set());
          this.keysByCount.get(count + 1).add(key);
        }
      }
      return LfuCache;
    })(),
    exec: (LfuCache, [capacity, operations]) => {
      const cache = new LfuCache(capacity);
      const results = [];
      for (const [method, ...argumentsList] of operations) {
        const result = cache[method](...argumentsList);
        if (method === 'get') results.push(result);
      }
      return results;
    },
    tests: [
      [ 2, [ [ 'put', 1, 1 ], [ 'put', 2, 2 ], [ 'get', 1 ], [ 'put', 3, 3 ], [ 'get', 2 ], [ 'get', 3 ], [ 'put', 4, 4 ], [ 'get', 1 ], [ 'get', 3 ], [ 'get', 4 ] ] ],
      [ 0, [ [ 'put', 0, 0 ], [ 'get', 0 ] ] ],
      [ 2, [ [ 'put', 1, 1 ], [ 'put', 2, 2 ], [ 'put', 3, 3 ], [ 'get', 1 ], [ 'get', 2 ], [ 'get', 3 ] ] ],
    ],
  },
  serializedeserializebinarytree: {
    fn: 'serialize',
    helpers: [ 'deserialize' ],
    jsStarter: '// serialize(root) turns a tree into a string; deserialize(text) rebuilds the same tree.\n// TreeNode has fields value, left and right (its constructor is TreeNode(value, left, right)).\nfunction serialize(root) {\n  // your code here\n}\n\nfunction deserialize(text) {\n  // your code here\n}\n',
    javaStarter: '// serialize(root) turns a tree into a string; deserialize(text) rebuilds the same tree.\nstatic String serialize(TreeNode root) {\n    // your code here\n}\n\nstatic TreeNode deserialize(String text) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      // Preorder with "#" for every missing child.
      function serialize(root) {
        if (!root) return '#';
        return root.value + ',' + serialize(root.left) + ',' + serialize(root.right);
      }

      // Consume the tokens in the same preorder to rebuild the tree.
      function deserialize(data) {
        const tokens = data.split(',');
        function build() {
          const token = tokens.shift();
          if (token === '#') return null;
          const node = new TreeNode(Number(token));
          node.left = build();  // the left subtree's tokens come first
          node.right = build();
          return node;
        }
        return build();
      }
      return { serialize, deserialize };
    })(),
    prepare: ([items]) => [arrayToTree(items)],
    exec: (serialize, [root], { deserialize }) => treeToArray(deserialize(serialize(root))),
    tests: [
      [
  [
    1,    2,    3,
    null, null, 4,
    5
  ]
],
      [ [] ],
      [ [ 1 ] ],
      [ [ 1, null, 2, 3 ] ],
    ],
  },
  reconstructtreefromtraversals: {
    fn: 'buildTree',
    jsStarter: '// Rebuild the binary tree (distinct values) from its preorder and inorder traversals. TreeNode has fields value, left and right.\nfunction buildTree(preorder, inorder) {\n  // your code here\n}\n',
    javaStarter: '// Rebuild the binary tree (distinct values) from its preorder and inorder traversals. TreeNode has fields value, left and right.\nstatic TreeNode buildTree(int[] preorder, int[] inorder) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      function buildTree(preorder, inorder) {
        const inorderIndex = new Map(inorder.map((value, i) => [value, i])); // value -> position, for O(1) lookups
        let preorderPosition = 0; // next root to consume from the preorder list

        // Build the subtree whose inorder values occupy [low, high].
        function build(low, high) {
          if (low > high) return null;
          const root = new TreeNode(preorder[preorderPosition++]); // preorder starts with the root
          const split = inorderIndex.get(root.value);
          root.left = build(low, split - 1);   // left of the root in inorder
          root.right = build(split + 1, high); // right of the root in inorder
          return root;
        }

        return build(0, inorder.length - 1);
      }
      return buildTree;
    })(),
    finish: root => treeToArray(root),
    tests: [
      [ [ 3, 9, 20, 15, 7 ], [ 9, 3, 15, 20, 7 ] ],
      [ [], [] ],
      [ [ 1 ], [ 1 ] ],
      [ [ 1, 2, 3 ], [ 3, 2, 1 ] ],
      [ [ 1, 2, 3 ], [ 2, 1, 3 ] ],
    ],
  },
  flattentreetolinkedlist: {
    fn: 'flatten',
    jsStarter: '// Flatten the tree in place into a preorder "linked list": every left is null and right points to the next node. TreeNode has fields value, left and right.\nfunction flatten(root) {\n  // your code here\n}\n',
    javaStarter: '// Flatten the tree in place into a preorder "linked list": every left is null and right points to the next node. TreeNode has fields value, left and right.\nstatic void flatten(TreeNode root) {\n    // your code here\n}\n',
    reference: (() => {
      class TreeNode {
        constructor(value, left = null, right = null) {
          this.value = value;
          this.left = left;
          this.right = right;
        }
      }

      // Iterative flatten: splice each left subtree between the node and its right child.
      function flatten(root) {
        let current = root;
        while (current) {
          if (current.left) {
            let rightmost = current.left;
            while (rightmost.right) rightmost = rightmost.right; // last node of the left subtree
            rightmost.right = current.right; // the old right subtree follows the left one
            current.right = current.left;    // move the left subtree to the right
            current.left = null;
          }
          current = current.right;
        }
      }
      return flatten;
    })(),
    prepare: ([items]) => [arrayToTree(items)],
    exec: (flatten, [root]) => {
      flatten(root);
      const values = [];
      let leftsCleared = true;
      for (let node = root; node && values.length < 1000; node = node.right) {
        values.push(node.value);
        if (node.left) leftsCleared = false;
      }
      return { values, leftsCleared };
    },
    tests: [
      [
  [
    1, 2,    5, 3,
    4, null, 6
  ]
],
      [ [] ],
      [ [ 1 ] ],
      [ [ 1, null, 2, 3 ] ],
    ],
  },
  binarysearchonanswer: {
    fn: 'shipWithinDays',
    jsStarter: '// Packages ship in order; return the smallest ship capacity that delivers them all within the given number of days.\nfunction shipWithinDays(weights, days) {\n  // your code here\n}\n',
    javaStarter: '// Packages ship in order; return the smallest ship capacity that delivers them all within the given number of days.\nstatic int shipWithinDays(int[] weights, int days) {\n    // your code here\n}\n',
    reference: (() => {
      // Binary search over the answer: the smallest capacity that ships everything within 'days'.
      function shipWithinDays(weights, days) {
        let low = Math.max(...weights);                            // smallest possible: the heaviest package
        let high = weights.reduce((total, w) => total + w, 0);     // largest needed: everything in one day
        while (low < high) {
          const middle = Math.floor((low + high) / 2);
          if (daysNeeded(weights, middle) <= days) high = middle;  // feasible: try smaller
          else low = middle + 1;                                   // too small: go bigger
        }
        return low;
      }

      // Feasibility check: how many days does a ship of this capacity need?
      function daysNeeded(weights, capacity) {
        let days = 1;
        let load = 0;
        for (const weight of weights) {
          if (load + weight > capacity) { // this package starts a new day
            days++;
            load = 0;
          }
          load += weight;
        }
        return days;
      }
      return shipWithinDays;
    })(),
    tests: [
      [
  [
    1, 2, 3, 4,  5,
    6, 7, 8, 9, 10
  ],
  5
],
      [ [ 3, 2, 2, 4, 1, 4 ], 3 ],
      [ [ 1, 2, 3, 1, 1 ], 4 ],
      [ [ 5 ], 1 ],
    ],
  },
  medianoftwosortedarrays: {
    fn: 'findMedianSortedArrays',
    jsStarter: '// Return the median of the two sorted arrays combined, in O(log(min(n, m))).\nfunction findMedianSortedArrays(a, b) {\n  // your code here\n}\n',
    javaStarter: '// Return the median of the two sorted arrays combined, in O(log(min(n, m))).\nstatic double findMedianSortedArrays(int[] a, int[] b) {\n    // your code here\n}\n',
    reference: (() => {
      // Binary search the cut in the shorter array so the two halves are balanced and ordered.
      function findMedianSortedArrays(a, b) {
        if (a.length > b.length) return findMedianSortedArrays(b, a); // search the shorter array
        const total = a.length + b.length;
        const half = Math.floor((total + 1) / 2); // size of the combined left half
        let low = 0;
        let high = a.length;
        while (low <= high) {
          const cutA = Math.floor((low + high) / 2);
          const cutB = half - cutA;
          const maxLeftA = cutA === 0 ? -Infinity : a[cutA - 1];
          const minRightA = cutA === a.length ? Infinity : a[cutA];
          const maxLeftB = cutB === 0 ? -Infinity : b[cutB - 1];
          const minRightB = cutB === b.length ? Infinity : b[cutB];
          if (maxLeftA <= minRightB && maxLeftB <= minRightA) { // a valid partition
            const maxLeft = Math.max(maxLeftA, maxLeftB);
            if (total % 2 === 1) return maxLeft;
            return (maxLeft + Math.min(minRightA, minRightB)) / 2;
          }
          if (maxLeftA > minRightB) high = cutA - 1; // cut in A is too far right
          else low = cutA + 1;                       // cut in A is too far left
        }
        throw new Error('Input arrays must be sorted');
      }
      return findMedianSortedArrays;
    })(),
    tests: [
      [ [ 1, 3 ], [ 2 ] ],
      [ [ 1, 2 ], [ 3, 4 ] ],
      [ [], [ 1 ] ],
      [ [ 0, 0 ], [ 0, 0 ] ],
      [ [ 1, 2, 3, 4, 5 ], [ 6, 7, 8 ] ],
      [ [ 5 ], [ 1, 2, 3, 4 ] ],
    ],
  },
  longestpalindromicsubstring: {
    fn: 'longestPalindrome',
    jsStarter: '// Return the longest palindromic substring.\nfunction longestPalindrome(text) {\n  // your code here\n}\n',
    javaStarter: '// Return the longest palindromic substring.\nstatic String longestPalindrome(String text) {\n    // your code here\n}\n',
    reference: (() => {
      // Expand around each centre (odd and even) and keep the longest palindrome found.
      function longestPalindrome(text) {
        let bestStart = 0;
        let bestLength = 0;
        for (let center = 0; center < text.length; center++) {
          const oddLength = expand(text, center, center);      // centre on a character
          const evenLength = expand(text, center, center + 1); // centre between two characters
          const length = Math.max(oddLength, evenLength);
          if (length > bestLength) {
            bestLength = length;
            bestStart = center - Math.floor((length - 1) / 2);
          }
        }
        return text.slice(bestStart, bestStart + bestLength);
      }

      // Grow outward while both sides match; return the palindrome's length.
      function expand(text, left, right) {
        while (left >= 0 && right < text.length && text[left] === text[right]) {
          left--;
          right++;
        }
        return right - left - 1;
      }
      return longestPalindrome;
    })(),
    tests: [
      [ 'cbbd' ],
      [ 'a' ],
      [ 'forgeeksskeegfor' ],
      [ 'racecarxyz' ],
      [ '' ],
    ],
  },
  countpalindromicsubstrings: {
    fn: 'countSubstrings',
    jsStarter: '// Return how many substrings are palindromes (equal substrings at different positions count separately).\nfunction countSubstrings(text) {\n  // your code here\n}\n',
    javaStarter: '// Return how many substrings are palindromes (equal substrings at different positions count separately).\nstatic int countSubstrings(String text) {\n    // your code here\n}\n',
    reference: (() => {
      // Count palindromes by expanding around every centre.
      function countSubstrings(text) {
        let count = 0;
        for (let center = 0; center < text.length; center++) {
          count += expandAndCount(text, center, center);      // odd-length palindromes
          count += expandAndCount(text, center, center + 1);  // even-length palindromes
        }
        return count;
      }

      // Every step outward that still matches is one more palindrome.
      function expandAndCount(text, left, right) {
        let found = 0;
        while (left >= 0 && right < text.length && text[left] === text[right]) {
          found++;
          left--;
          right++;
        }
        return found;
      }
      return countSubstrings;
    })(),
    tests: [
      [ 'abc' ],
      [ 'aaa' ],
      [ '' ],
      [ 'abba' ],
      [ 'racecar' ],
    ],
  },
  maximumproductsubarray: {
    fn: 'maxProduct',
    jsStarter: '// Return the largest product of a contiguous non-empty subarray.\nfunction maxProduct(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return the largest product of a contiguous non-empty subarray.\nstatic int maxProduct(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Track the largest and smallest product of a subarray ending at each index.
      function maxProduct(numbers) {
        let largest = numbers[0];  // best product ending here
        let smallest = numbers[0]; // worst (most negative) product ending here
        let best = numbers[0];
        for (let i = 1; i < numbers.length; i++) {
          const x = numbers[i];
          const fromLargest = largest * x;
          const fromSmallest = smallest * x; // a negative x turns this into a candidate for the maximum
          largest = Math.max(x, fromLargest, fromSmallest);
          smallest = Math.min(x, fromLargest, fromSmallest);
          best = Math.max(best, largest);
        }
        return best;
      }
      return maxProduct;
    })(),
    tests: [
      [ [ 2, 3, -2, 4 ] ],
      [ [ -2, 0, -1 ] ],
      [ [ -2, 3, -4 ] ],
      [ [ -2 ] ],
      [ [ 0, 2 ] ],
    ],
  },
  trappingrainwater: {
    fn: 'trap',
    jsStarter: '// Return how much rain water is trapped between bars of the given heights.\nfunction trap(heights) {\n  // your code here\n}\n',
    javaStarter: '// Return how much rain water is trapped between bars of the given heights.\nstatic int trap(int[] heights) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — prefix and suffix maximum arrays.
      function trapWithArrays(heights) {
        const n = heights.length;
        if (n === 0) return 0;
        const leftWall = new Array(n);  // tallest bar at or before i
        const rightWall = new Array(n); // tallest bar at or after i
        leftWall[0] = heights[0];
        for (let i = 1; i < n; i++) leftWall[i] = Math.max(leftWall[i - 1], heights[i]);
        rightWall[n - 1] = heights[n - 1];
        for (let i = n - 2; i >= 0; i--) rightWall[i] = Math.max(rightWall[i + 1], heights[i]);
        let water = 0;
        for (let i = 0; i < n; i++) {
          water += Math.min(leftWall[i], rightWall[i]) - heights[i];
        }
        return water;
      }

      // Approach 2 — two pointers, O(1) space.
      function trap(heights) {
        let left = 0;
        let right = heights.length - 1;
        let leftWall = 0;
        let rightWall = 0;
        let water = 0;
        while (left < right) {
          if (heights[left] < heights[right]) { // the left side is the bottleneck
            leftWall = Math.max(leftWall, heights[left]);
            water += leftWall - heights[left++];
          } else {                              // the right side is the bottleneck
            rightWall = Math.max(rightWall, heights[right]);
            water += rightWall - heights[right--];
          }
        }
        return water;
      }
      return trap;
    })(),
    tests: [
      [
  [
    0, 1, 0, 2, 1,
    0, 1, 3, 2, 1,
    2, 1
  ]
],
      [ [ 4, 2, 0, 3, 2, 5 ] ],
      [ [ 1, 2, 3 ] ],
      [ [] ],
    ],
  },
  largestrectanglehistogram: {
    fn: 'largestRectangleArea',
    jsStarter: '// Return the area of the largest rectangle in the histogram of unit-width bars.\nfunction largestRectangleArea(heights) {\n  // your code here\n}\n',
    javaStarter: '// Return the area of the largest rectangle in the histogram of unit-width bars.\nstatic int largestRectangleArea(int[] heights) {\n    // your code here\n}\n',
    reference: (() => {
      // Monotonic stack of indices with increasing heights.
      function largestRectangleArea(heights) {
        const stack = [];
        let best = 0;
        for (let i = 0; i <= heights.length; i++) {
          const current = i === heights.length ? 0 : heights[i]; // a final 0-height bar flushes the stack
          while (stack.length > 0 && heights[stack[stack.length - 1]] >= current) {
            const height = heights[stack.pop()];
            const left = stack.length > 0 ? stack[stack.length - 1] + 1 : 0; // first bar the rectangle can cover
            best = Math.max(best, height * (i - left));
          }
          stack.push(i);
        }
        return best;
      }
      return largestRectangleArea;
    })(),
    tests: [
      [ [ 2, 1, 5, 6, 2, 3 ] ],
      [ [ 2, 4 ] ],
      [ [ 1 ] ],
      [ [] ],
      [
  [
    6, 2, 5, 4,
    5, 1, 6
  ]
],
    ],
  },
  slidingwindowminimum: {
    fn: 'minSlidingWindow',
    jsStarter: '// Return the minimum of every window of size k as it slides left to right.\nfunction minSlidingWindow(numbers, k) {\n  // your code here\n}\n',
    javaStarter: '// Return the minimum of every window of size k as it slides left to right.\nstatic int[] minSlidingWindow(int[] numbers, int k) {\n    // your code here\n}\n',
    reference: (() => {
      // Monotonic deque of indices (values increasing): the front is the window minimum.
      function minSlidingWindow(numbers, k) {
        const deque = []; // indices; shift() from the front, pop() from the back
        const minimums = [];
        for (let i = 0; i < numbers.length; i++) {
          if (deque.length > 0 && deque[0] <= i - k) {
            deque.shift(); // the front index left the window
          }
          while (deque.length > 0 && numbers[deque[deque.length - 1]] >= numbers[i]) {
            deque.pop();   // larger values can never be the minimum again
          }
          deque.push(i);
          if (i >= k - 1) {
            minimums.push(numbers[deque[0]]);
          }
        }
        return minimums;
      }
      return minSlidingWindow;
    })(),
    tests: [
      [ [ 4, 2, 12, 3, 8, 1 ], 3 ],
      [ [ 5 ], 1 ],
      [ [ 3, 2, 1 ], 2 ],
      [
  [
    1, 3, -1, -3,
    5, 3,  6,  7
  ],
  3
],
    ],
  },
  allpermutations: {
    fn: 'permutations',
    jsStarter: '// Return every permutation of the distinct numbers (any order).\nfunction permutations(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return every permutation of the distinct numbers (any order).\nstatic List<List<Integer>> permutations(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Backtracking with a "used" flag per element.
      function permutations(numbers) {
        const results = [];
        const used = new Array(numbers.length).fill(false);
        const current = [];

        function backtrack() {
          if (current.length === numbers.length) {
            results.push([...current]); // record a copy of the finished permutation
            return;
          }
          for (let i = 0; i < numbers.length; i++) {
            if (used[i]) continue;
            used[i] = true;              // choose
            current.push(numbers[i]);
            backtrack();                 // explore
            current.pop();               // un-choose
            used[i] = false;
          }
        }

        backtrack();
        return results;
      }
      return permutations;
    })(),
    normalize: result => result.map(permutation => permutation.join(',')).sort(),
    tests: [
      [ [ 1, 2, 3 ] ],
      [ [ 1 ] ],
      [ [ 1, 2 ] ],
      [ [ 1, 2, 3, 4 ] ],
    ],
  },
  powerset: {
    fn: 'subsets',
    jsStarter: '// Return every subset of the distinct numbers, including the empty one (any order).\nfunction subsets(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return every subset of the distinct numbers, including the empty one (any order).\nstatic List<List<Integer>> subsets(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — bitmask: every number from 0 to 2^n - 1 picks one subset.
      function subsetsBitmask(numbers) {
        const n = numbers.length;
        const subsets = [];
        for (let mask = 0; mask < (1 << n); mask++) {
          subsets.push(numbers.filter((_, i) => mask & (1 << i))); // bit i set: include item i
        }
        return subsets;
      }

      // Approach 2 — backtracking: at each index, record the subset, then try adding each later element.
      function subsets(numbers) {
        const results = [];
        const current = [];

        function backtrack(start) {
          results.push([...current]); // every path is a valid subset
          for (let i = start; i < numbers.length; i++) {
            current.push(numbers[i]);  // choose
            backtrack(i + 1);          // explore with only later elements
            current.pop();             // un-choose
          }
        }

        backtrack(0);
        return results;
      }
      return subsets;
    })(),
    normalize: result => result.map(subset => [...subset].sort((a, b) => a - b).join(',')).sort(),
    tests: [
      [ [ 1, 2, 3 ] ],
      [ [] ],
      [ [ 0 ] ],
      [ [ 1, 2, 3, 4 ] ],
    ],
  },
  wordsearchgrid: {
    fn: 'exist',
    jsStarter: '// Return true if word can be traced through horizontally or vertically adjacent cells without reusing a cell.\nfunction exist(grid, word) {\n  // your code here\n}\n',
    javaStarter: '// Return true if word can be traced through horizontally or vertically adjacent cells without reusing a cell.\nstatic boolean exist(char[][] grid, String word) {\n    // your code here\n}\n',
    reference: (() => {
      // Try every cell as a start; DFS with backtracking.
      function exist(grid, word) {
        for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < grid[r].length; c++) {
            if (search(grid, word, r, c, 0)) return true;
          }
        }
        return false;
      }

      function search(grid, word, r, c, index) {
        if (index === word.length) return true; // every letter matched
        if (r < 0 || c < 0 || r >= grid.length || c >= grid[r].length || grid[r][c] !== word[index]) {
          return false;
        }
        const saved = grid[r][c];
        grid[r][c] = '#'; // mark visited so this path cannot reuse the cell
        const found = search(grid, word, r + 1, c, index + 1)
                   || search(grid, word, r - 1, c, index + 1)
                   || search(grid, word, r, c + 1, index + 1)
                   || search(grid, word, r, c - 1, index + 1);
        grid[r][c] = saved; // backtrack: free the cell for other paths
        return found;
      }
      return exist;
    })(),
    prepare: ([rows, word]) => [gridToChars(rows), word],
    tests: [
      [ [ 'ABCE', 'SFCS', 'ADEE' ], 'ABCCED' ],
      [ [ 'ABCE', 'SFCS', 'ADEE' ], 'SEE' ],
      [ [ 'ABCE', 'SFCS', 'ADEE' ], 'ABCB' ],
      [ [ 'A' ], 'AB' ],
      [ [ 'A' ], 'A' ],
    ],
  },
  nqueens: {
    fn: 'solveNQueens',
    jsStarter: '// Return the number of ways to place n queens on an n x n board so that none attack each other.\nfunction solveNQueens(n) {\n  // your code here\n}\n',
    javaStarter: '// Return the number of ways to place n queens on an n x n board so that none attack each other.\nstatic int solveNQueens(int n) {\n    // your code here\n}\n',
    reference: (() => {
      // Count the N-Queens solutions by placing one queen per row.
      function solveNQueens(n) {
        const columns = new Set();
        const diagonals = new Set();     // cells sharing row - column
        const antiDiagonals = new Set(); // cells sharing row + column
        let count = 0;

        function place(row) {
          if (row === n) {
            count++; // all queens placed: one solution
            return;
          }
          for (let column = 0; column < n; column++) {
            if (columns.has(column) || diagonals.has(row - column) || antiDiagonals.has(row + column)) continue;
            columns.add(column);                // place
            diagonals.add(row - column);
            antiDiagonals.add(row + column);
            place(row + 1);
            columns.delete(column);             // remove
            diagonals.delete(row - column);
            antiDiagonals.delete(row + column);
          }
        }

        place(0);
        return count;
      }
      return solveNQueens;
    })(),
    tests: [
      [ 1 ],
      [ 2 ],
      [ 3 ],
      [ 4 ],
      [ 6 ],
      [ 8 ],
    ],
  },
  sudokusolver: {
    fn: 'solveSudoku',
    jsStarter: '// Solve the 9x9 Sudoku in place (board is an array of arrays of characters, "." = empty) and return true if it is solvable.\nfunction solveSudoku(board) {\n  // your code here\n}\n',
    javaStarter: '// Solve the 9x9 Sudoku in place (board is an array of arrays of characters, "." = empty) and return true if it is solvable.\nstatic boolean solveSudoku(char[][] board) {\n    // your code here\n}\n',
    reference: (() => {
      // Backtracking solver: board holds digit characters '1'-'9', and '.' for empty cells. Solves in place.
      function solveSudoku(board) {
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (board[r][c] !== '.') continue;
            for (let digit = 1; digit <= 9; digit++) {
              const candidate = String(digit);
              if (isLegal(board, r, c, candidate)) {
                board[r][c] = candidate;               // try it
                if (solveSudoku(board)) return true;
                board[r][c] = '.';                     // backtrack
              }
            }
            return false; // no digit fits this cell: an earlier choice was wrong
          }
        }
        return true; // no empty cell left
      }

      // A digit is legal if it is absent from the cell's row, column and 3x3 box.
      function isLegal(board, r, c, digit) {
        for (let i = 0; i < 9; i++) {
          if (board[r][i] === digit || board[i][c] === digit) return false;
          const boxRow = 3 * Math.floor(r / 3) + Math.floor(i / 3);
          const boxColumn = 3 * Math.floor(c / 3) + (i % 3);
          if (board[boxRow][boxColumn] === digit) return false;
        }
        return true;
      }
      return solveSudoku;
    })(),
    prepare: ([rows]) => [gridToChars(rows)],
    exec: (solveSudoku, [board]) => {
      const solved = solveSudoku(board);
      return { solved, rows: board.map(row => row.join('')) };
    },
    tests: [
      [
  [
    '53..7....', '6..195...',
    '.98....6.', '8...6...3',
    '4..8.3..1', '7...2...6',
    '.6....28.', '...419..5',
    '....8..79'
  ]
],
      [
  [
    '..9748...', '7........',
    '.2.1.9...', '..7...24.',
    '.64.1.59.', '.98...3..',
    '...8.3.2.', '........6',
    '...2759..'
  ]
],
    ],
  },
  minimumwindowsubstring: {
    fn: 'minWindow',
    jsStarter: '// Return the shortest substring of s that contains every character of t (with multiplicity), or "".\nfunction minWindow(s, t) {\n  // your code here\n}\n',
    javaStarter: '// Return the shortest substring of s that contains every character of t (with multiplicity), or "".\nstatic String minWindow(String s, String t) {\n    // your code here\n}\n',
    reference: (() => {
      // Sliding window: expand right until valid, then shrink left while it stays valid.
      function minWindow(s, t) {
        const needed = new Map(); // remaining count needed per character (negative = surplus in the window)
        for (const char of t) needed.set(char, (needed.get(char) || 0) + 1);
        let missing = t.length;   // required characters not yet covered
        let left = 0;
        let bestStart = 0;
        let bestLength = Infinity;
        for (let right = 0; right < s.length; right++) {
          if (needed.has(s[right])) {
            if (needed.get(s[right]) > 0) missing--; // a still-needed character was covered
            needed.set(s[right], needed.get(s[right]) - 1);
          }
          while (missing === 0) {                    // the window is valid: try to shrink it
            if (right - left + 1 < bestLength) {
              bestLength = right - left + 1;
              bestStart = left;
            }
            if (needed.has(s[left])) {
              needed.set(s[left], needed.get(s[left]) + 1);
              if (needed.get(s[left]) > 0) missing++; // we dropped a needed character
            }
            left++;
          }
        }
        return bestLength === Infinity ? '' : s.slice(bestStart, bestStart + bestLength);
      }
      return minWindow;
    })(),
    tests: [
      [ 'ADOBECODEBANC', 'ABC' ],
      [ 'a', 'a' ],
      [ 'a', 'aa' ],
      [ 'aa', 'aa' ],
      [ 'abc', 'b' ],
    ],
  },
  aliendictionary: {
    fn: 'alienOrder',
    jsStarter: `// The words are sorted in an alien language's dictionary order. Return the letters in a valid order, or "" if the order is inconsistent.\nfunction alienOrder(words) {\n  // your code here\n}\n`,
    javaStarter: `// The words are sorted in an alien language's dictionary order. Return the letters in a valid order, or "" if the order is inconsistent.\nstatic String alienOrder(String[] words) {\n    // your code here\n}\n`,
    reference: (() => {
      // Build edges from adjacent words, then topologically sort the letters (Kahn's algorithm).
      function alienOrder(words) {
        const after = new Map();   // letter -> letters that must follow it
        const waiting = new Map(); // letter -> unmet predecessors
        for (const word of words) {
          for (const char of word) {
            if (!after.has(char)) after.set(char, new Set());
            if (!waiting.has(char)) waiting.set(char, 0);
          }
        }
        for (let i = 0; i + 1 < words.length; i++) {
          const [first, second] = [words[i], words[i + 1]];
          if (first.length > second.length && first.startsWith(second)) return ''; // "abc" before "ab"
          for (let j = 0; j < Math.min(first.length, second.length); j++) {
            if (first[j] !== second[j]) { // the first difference gives one rule: first[j] comes before second[j]
              if (!after.get(first[j]).has(second[j])) {
                after.get(first[j]).add(second[j]);
                waiting.set(second[j], waiting.get(second[j]) + 1);
              }
              break;
            }
          }
        }
        const ready = [...waiting].filter(([, count]) => count === 0).map(([char]) => char);
        let order = '';
        while (ready.length > 0) {
          const char = ready.shift();
          order += char;
          for (const next of after.get(char)) {
            waiting.set(next, waiting.get(next) - 1);
            if (waiting.get(next) === 0) ready.push(next);
          }
        }
        return order.length === after.size ? order : ''; // '' signals a cycle
      }
      return alienOrder;
    })(),
    tests: [
      [ [ 'wrt', 'wrf', 'er', 'ett', 'rftt' ] ],
      [ [ 'z', 'x', 'z' ] ],
      [ [ 'abc', 'ab' ] ],
      [ [ 'z', 'x' ] ],
      [ [ 'z', 'z' ] ],
    ],
  },
  wordladder: {
    fn: 'ladderLength',
    jsStarter: '// Return the number of words in the shortest sequence from beginWord to endWord changing one letter at a time through wordList (0 if none).\nfunction ladderLength(beginWord, endWord, wordList) {\n  // your code here\n}\n',
    javaStarter: '// Return the number of words in the shortest sequence from beginWord to endWord changing one letter at a time through wordList (0 if none).\nstatic int ladderLength(String beginWord, String endWord, List<String> wordList) {\n    // your code here\n}\n',
    reference: (() => {
      // BFS from beginWord; each level is one more transformation step.
      function ladderLength(beginWord, endWord, wordList) {
        const unvisited = new Set(wordList);
        if (!unvisited.has(endWord)) return 0;
        let level = [beginWord];
        let steps = 1;
        while (level.length > 0) {
          const nextLevel = [];
          for (const word of level) {
            if (word === endWord) return steps;
            for (let i = 0; i < word.length; i++) {
              for (let code = 97; code <= 122; code++) { // 'a'..'z'
                const candidate = word.slice(0, i) + String.fromCharCode(code) + word.slice(i + 1);
                if (unvisited.delete(candidate)) nextLevel.push(candidate); // delete = mark visited
              }
            }
          }
          level = nextLevel;
          steps++;
        }
        return 0; // no ladder exists
      }
      return ladderLength;
    })(),
    tests: [
      [ 'hit', 'cog', [ 'hot', 'dot', 'dog', 'lot', 'log', 'cog' ] ],
      [ 'hit', 'cog', [ 'hot', 'dot', 'dog', 'lot', 'log' ] ],
      [ 'a', 'c', [ 'a', 'b', 'c' ] ],
      [ 'hot', 'dog', [ 'hot', 'dog' ] ],
    ],
  },
  criticalconnections: {
    fn: 'criticalConnections',
    jsStarter: '// Return every bridge — a link whose removal disconnects the network (pair order does not matter).\nfunction criticalConnections(n, connections) {\n  // your code here\n}\n',
    javaStarter: '// Return every bridge — a link whose removal disconnects the network (pair order does not matter).\nstatic List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {\n    // your code here\n}\n',
    reference: (() => {
      // Tarjan's bridge-finding: one DFS computing discovery and low-link times.
      function criticalConnections(n, connections) {
        const graph = Array.from({ length: n }, () => []);
        for (const [a, b] of connections) {
          graph[a].push(b);
          graph[b].push(a);
        }
        const discovered = new Array(n).fill(-1);
        const lowest = new Array(n).fill(0);
        const bridges = [];
        let clock = 0;

        function visit(node, parent) {
          discovered[node] = lowest[node] = clock++;
          for (const next of graph[node]) {
            if (next === parent) continue; // do not walk straight back along the tree edge
            if (discovered[next] === -1) {
              visit(next, node);
              lowest[node] = Math.min(lowest[node], lowest[next]);
              if (lowest[next] > discovered[node]) bridges.push([node, next]); // no way around: a bridge
            } else {
              lowest[node] = Math.min(lowest[node], discovered[next]); // a back edge
            }
          }
        }

        for (let node = 0; node < n; node++) {
          if (discovered[node] === -1) visit(node, -1);
        }
        return bridges;
      }
      return criticalConnections;
    })(),
    normalize: result => result.map(pair => [...pair].sort((a, b) => a - b)).sort((a, b) => a[0] - b[0] || a[1] - b[1]),
    tests: [
      [ 4, [ [ 0, 1 ], [ 1, 2 ], [ 2, 0 ], [ 1, 3 ] ] ],
      [ 2, [ [ 0, 1 ] ] ],
      [ 3, [ [ 0, 1 ], [ 1, 2 ], [ 2, 0 ] ] ],
      [ 1, [] ],
      [ 5, [ [ 0, 1 ], [ 1, 2 ], [ 2, 3 ], [ 3, 4 ] ] ],
    ],
  },
  longestincreasingsubsequence: {
    fn: 'lengthOfLIS',
    jsStarter: '// Return the length of the longest strictly increasing subsequence.\nfunction lengthOfLIS(numbers) {\n  // your code here\n}\n',
    javaStarter: '// Return the length of the longest strictly increasing subsequence.\nstatic int lengthOfLIS(int[] numbers) {\n    // your code here\n}\n',
    reference: (() => {
      // Approach 1 — O(n^2) DP: best length of a subsequence ending at each index.
      function lisQuadratic(numbers) {
        const length = new Array(numbers.length).fill(1); // each number alone
        let best = 0;
        for (let i = 0; i < numbers.length; i++) {
          for (let j = 0; j < i; j++) {
            if (numbers[j] < numbers[i]) length[i] = Math.max(length[i], length[j] + 1);
          }
          best = Math.max(best, length[i]);
        }
        return best;
      }

      // Approach 2 — O(n log n): tails[k] = smallest last value of an increasing subsequence of length k + 1.
      function lengthOfLIS(numbers) {
        const tails = [];
        for (const number of numbers) {
          let low = 0;
          let high = tails.length;
          while (low < high) { // first position whose tail is >= number
            const middle = (low + high) >> 1;
            if (tails[middle] < number) low = middle + 1;
            else high = middle;
          }
          tails[low] = number; // replace, or extend when low === tails.length
        }
        return tails.length;
      }
      return lengthOfLIS;
    })(),
    tests: [
      [
  [
    10, 9,   2,  5,
     3, 7, 101, 18
  ]
],
      [ [ 0, 1, 0, 3, 2, 3 ] ],
      [ [ 7, 7, 7 ] ],
      [ [] ],
      [
  [
    1,  3, 6, 7, 9,
    4, 10, 5, 6
  ]
],
    ],
  },
  editdistance: {
    fn: 'minDistance',
    jsStarter: '// Return the minimum number of insertions, deletions and substitutions to turn a into b.\nfunction minDistance(a, b) {\n  // your code here\n}\n',
    javaStarter: '// Return the minimum number of insertions, deletions and substitutions to turn a into b.\nstatic int minDistance(String a, String b) {\n    // your code here\n}\n',
    reference: (() => {
      // DP table: table[i][j] = edit distance between a[0..i) and b[0..j).
      function minDistance(a, b) {
        const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
        for (let i = 0; i <= a.length; i++) table[i][0] = i; // delete all i characters
        for (let j = 0; j <= b.length; j++) table[0][j] = j; // insert all j characters
        for (let i = 1; i <= a.length; i++) {
          for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
              table[i][j] = table[i - 1][j - 1]; // characters match: no edit
            } else {
              table[i][j] = 1 + Math.min(
                table[i - 1][j - 1], // replace
                table[i - 1][j],     // delete
                table[i][j - 1]      // insert
              );
            }
          }
        }
        return table[a.length][b.length];
      }
      return minDistance;
    })(),
    tests: [
      [ 'horse', 'ros' ],
      [ 'intention', 'execution' ],
      [ 'abc', 'abc' ],
      [ 'abc', '' ],
      [ '', '' ],
    ],
  },
  burstballoons: {
    fn: 'maxCoins',
    jsStarter: '// Bursting balloon i earns left x balloons[i] x right (edges count as 1). Return the most coins from bursting them all.\nfunction maxCoins(balloons) {\n  // your code here\n}\n',
    javaStarter: '// Bursting balloon i earns left x balloons[i] x right (edges count as 1). Return the most coins from bursting them all.\nstatic int maxCoins(int[] balloons) {\n    // your code here\n}\n',
    reference: (() => {
      // Interval DP: best[l][r] = most coins from bursting everything strictly between l and r.
      function maxCoins(balloons) {
        const nums = [1, ...balloons, 1]; // virtual balloons worth 1 at both ends
        const n = nums.length;
        const best = Array.from({ length: n }, () => new Array(n).fill(0));
        for (let gap = 2; gap < n; gap++) {           // interval width, shortest first
          for (let left = 0; left + gap < n; left++) {
            const right = left + gap;
            for (let last = left + 1; last < right; last++) { // the balloon burst last
              const coins = best[left][last] + nums[left] * nums[last] * nums[right] + best[last][right];
              best[left][right] = Math.max(best[left][right], coins);
            }
          }
        }
        return best[0][n - 1];
      }
      return maxCoins;
    })(),
    tests: [
      [ [ 3, 1, 5, 8 ] ],
      [ [ 1, 5 ] ],
      [ [ 7 ] ],
      [ [] ],
    ],
  },
  regexmatching: {
    fn: 'isMatch',
    jsStarter: '// Match the whole text against a pattern where "." is any one character and "*" means zero or more of the previous element.\nfunction isMatch(text, pattern) {\n  // your code here\n}\n',
    javaStarter: '// Match the whole text against a pattern where "." is any one character and "*" means zero or more of the previous element.\nstatic boolean isMatch(String text, String pattern) {\n    // your code here\n}\n',
    reference: (() => {
      // DP over prefixes: table[i][j] = text[0..i) matches pattern[0..j).
      function isMatch(text, pattern) {
        const table = Array.from({ length: text.length + 1 }, () => new Array(pattern.length + 1).fill(false));
        table[0][0] = true; // empty matches empty
        for (let j = 2; j <= pattern.length; j++) {
          if (pattern[j - 1] === '*') table[0][j] = table[0][j - 2]; // "a*" can vanish
        }
        for (let i = 1; i <= text.length; i++) {
          for (let j = 1; j <= pattern.length; j++) {
            const p = pattern[j - 1];
            if (p === '*') {
              const before = pattern[j - 2];
              const beforeMatches = before === '.' || before === text[i - 1];
              table[i][j] = table[i][j - 2]                    // zero copies of the element
                         || (beforeMatches && table[i - 1][j]); // one more copy
            } else {
              table[i][j] = (p === '.' || p === text[i - 1]) && table[i - 1][j - 1];
            }
          }
        }
        return table[text.length][pattern.length];
      }
      return isMatch;
    })(),
    tests: [
      [ 'aab', 'c*a*b' ],
      [ 'aa', 'a' ],
      [ 'aa', 'a*' ],
      [ 'ab', '.*' ],
      [ 'mississippi', 'mis*is*p*.' ],
      [ '', 'a*' ],
      [ 'a', '' ],
    ],
  },
  wildcardmatching: {
    fn: 'isMatch',
    jsStarter: '// Match the whole text against a pattern where "?" is any one character and "*" is any sequence (including empty).\nfunction isMatch(text, pattern) {\n  // your code here\n}\n',
    javaStarter: '// Match the whole text against a pattern where "?" is any one character and "*" is any sequence (including empty).\nstatic boolean isMatch(String text, String pattern) {\n    // your code here\n}\n',
    reference: (() => {
      // Greedy two pointers with backtracking to the most recent star.
      function isMatch(text, pattern) {
        let t = 0;
        let p = 0;
        let starAt = -1;  // position of the latest '*' in the pattern
        let resumeAt = 0; // text position where that star started matching
        while (t < text.length) {
          if (p < pattern.length && (pattern[p] === '?' || pattern[p] === text[t])) {
            t++;
            p++;
          } else if (p < pattern.length && pattern[p] === '*') {
            starAt = p++;   // the star matches nothing, for now
            resumeAt = t;
          } else if (starAt !== -1) {
            p = starAt + 1; // let the star swallow one more character
            t = ++resumeAt;
          } else {
            return false;   // mismatch with no star to fall back on
          }
        }
        while (p < pattern.length && pattern[p] === '*') p++; // trailing stars match empty
        return p === pattern.length;
      }
      return isMatch;
    })(),
    tests: [
      [ 'adceb', '*a*b' ],
      [ 'aa', 'a' ],
      [ 'aa', '*' ],
      [ 'cb', '?a' ],
      [ 'acdcb', 'a*c?b' ],
      [ '', '***' ],
      [ 'abc', 'a?c' ],
    ],
  },
  maxflowfordfulkerson: {
    fn: 'maxFlow',
    jsStarter: '// capacity[u][v] is the capacity of edge u -> v. Return the maximum flow from source to sink (the matrix may be modified).\nfunction maxFlow(capacity, source, sink) {\n  // your code here\n}\n',
    javaStarter: '// capacity[u][v] is the capacity of edge u -> v. Return the maximum flow from source to sink (the matrix may be modified).\nstatic int maxFlow(int[][] capacity, int source, int sink) {\n    // your code here\n}\n',
    reference: (() => {
      // Edmonds-Karp on an adjacency matrix of residual capacities. The matrix is modified in place.
      function maxFlow(residual, source, sink) {
        const n = residual.length;
        let flow = 0;
        for (;;) {
          const parent = new Array(n).fill(-1); // BFS tree: how each node was reached
          parent[source] = source;
          const queue = [source];
          while (queue.length > 0 && parent[sink] === -1) {
            const node = queue.shift();
            for (let next = 0; next < n; next++) {
              if (parent[next] === -1 && residual[node][next] > 0) { // spare capacity
                parent[next] = node;
                queue.push(next);
              }
            }
          }
          if (parent[sink] === -1) return flow; // no augmenting path left

          let bottleneck = Infinity; // the smallest spare capacity on the path
          for (let node = sink; node !== source; node = parent[node]) {
            bottleneck = Math.min(bottleneck, residual[parent[node]][node]);
          }
          for (let node = sink; node !== source; node = parent[node]) {
            residual[parent[node]][node] -= bottleneck; // use up forward capacity
            residual[node][parent[node]] += bottleneck; // allow the flow to be undone later
          }
          flow += bottleneck;
        }
      }
      return maxFlow;
    })(),
    tests: [
      [ [ [ 0, 16, 13, 0, 0, 0 ], [ 0, 0, 10, 12, 0, 0 ], [ 0, 4, 0, 0, 14, 0 ], [ 0, 0, 9, 0, 0, 20 ], [ 0, 0, 0, 7, 0, 4 ], [ 0, 0, 0, 0, 0, 0 ] ], 0, 5 ],
      [ [ [ 0, 5 ], [ 0, 0 ] ], 0, 1 ],
      [ [ [ 0, 0 ], [ 0, 0 ] ], 0, 1 ],
      [ [ [ 0, 3, 2, 0 ], [ 0, 0, 1, 2 ], [ 0, 0, 0, 3 ], [ 0, 0, 0, 0 ] ], 0, 3 ],
    ],
  },
};
