// Roots & radicals — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      0,
      16
    ],
    "y": [
      0,
      5
    ],
    "inputs": [
      {
        "name": "n",
        "label": "root degree n",
        "value": 2,
        "min": 2,
        "max": 5
      }
    ],
    "curves": [
      {
        "label": "y = x^(1/n)",
        "expr": "pow(x, 1/n)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "nthRoot",
      "title": "The nth root",
      "prompt": "Return the principal nth root of non-negative number x.",
      "starter": "function nthRoot(x, n) {\n  // your code here\n}\n",
      "solution": "function nthRoot(x, n) {\n  return x ** (1 / n);\n}\n",
      "tests": [
        {
          "args": [
            27,
            3
          ],
          "expected": 3,
          "tol": 1e-9
        },
        {
          "args": [
            16,
            4
          ],
          "expected": 2,
          "tol": 1e-9
        }
      ]
    },
    {
      "fn": "isPerfectSquare",
      "title": "Perfect square check",
      "prompt": "Return true if non-negative integer n is a perfect square.",
      "starter": "function isPerfectSquare(n) {\n  // your code here\n}\n",
      "solution": "function isPerfectSquare(n) {\n  return n >= 0 && Number.isInteger(Math.sqrt(n));\n}\n",
      "tests": [
        {
          "args": [
            49
          ],
          "expected": true
        },
        {
          "args": [
            50
          ],
          "expected": false
        },
        {
          "args": [
            0
          ],
          "expected": true
        }
      ]
    },
    {
      "fn": "simplifySqrt",
      "title": "Simplify √n = a√b",
      "prompt": "For positive integer n, factor out the largest square so n = a²·b and return [a, b]. simplifySqrt(72) → [6, 2].",
      "starter": "function simplifySqrt(n) {\n  // your code here\n}\n",
      "solution": "function simplifySqrt(n) {\n  let a = 1;\n  for (let k = 2; k * k <= n; k++) {\n    while (n % (k * k) === 0) { a *= k; n /= k * k; }\n  }\n  return [a, n];\n}\n",
      "tests": [
        {
          "args": [
            72
          ],
          "expected": [
            6,
            2
          ]
        },
        {
          "args": [
            25
          ],
          "expected": [
            5,
            1
          ]
        },
        {
          "args": [
            15
          ],
          "expected": [
            1,
            15
          ]
        }
      ]
    }
  ]
};

initTopic(TOPIC);
