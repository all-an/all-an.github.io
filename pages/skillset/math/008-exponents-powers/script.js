// Exponents & powers — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "sequence",
    "from": 0,
    "count": 10,
    "inputs": [
      {
        "name": "a",
        "label": "base a",
        "value": 2,
        "min": 1,
        "max": 6
      }
    ],
    "expr": "pow(a, n)",
    "note": "Powers a⁰, a¹, a², …, a⁹ grow exponentially."
  },
  "exercises": [
    {
      "fn": "power",
      "title": "Integer power",
      "prompt": "Compute base ** exp for non-negative integer exp using a loop.",
      "starter": "function power(base, exp) {\n  // your code here\n}\n",
      "solution": "function power(base, exp) {\n  let r = 1;\n  for (let i = 0; i < exp; i++) r *= base;\n  return r;\n}\n",
      "tests": [
        {
          "args": [
            2,
            10
          ],
          "expected": 1024
        },
        {
          "args": [
            5,
            0
          ],
          "expected": 1
        },
        {
          "args": [
            3,
            4
          ],
          "expected": 81
        }
      ]
    },
    {
      "fn": "combineExponents",
      "title": "Product and power laws",
      "prompt": "Given exponents m and n for (a^m * a^n)^k, return the resulting single exponent on a.",
      "starter": "function combineExponents(m, n, k) {\n  // your code here\n}\n",
      "solution": "function combineExponents(m, n, k) {\n  return (m + n) * k;\n}\n",
      "tests": [
        {
          "args": [
            2,
            3,
            4
          ],
          "expected": 20
        },
        {
          "args": [
            5,
            -2,
            3
          ],
          "expected": 9
        }
      ]
    },
    {
      "fn": "isPowerOfTwo",
      "title": "Power of two check",
      "prompt": "Return true if positive integer n is a power of 2 (1, 2, 4, 8, ...).",
      "starter": "function isPowerOfTwo(n) {\n  // your code here\n}\n",
      "solution": "function isPowerOfTwo(n) {\n  return n > 0 && (n & (n - 1)) === 0;\n}\n",
      "tests": [
        {
          "args": [
            1
          ],
          "expected": true
        },
        {
          "args": [
            16
          ],
          "expected": true
        },
        {
          "args": [
            12
          ],
          "expected": false
        }
      ]
    }
  ]
};

initTopic(TOPIC);
