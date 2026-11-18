// Multiplication & division — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "dots",
    "inputs": [
      {
        "name": "rows",
        "label": "rows (a)",
        "value": 4,
        "min": 1,
        "max": 12
      },
      {
        "name": "cols",
        "label": "columns (b)",
        "value": 6,
        "min": 1,
        "max": 15
      }
    ],
    "count": "rows * cols",
    "perRow": "cols",
    "outputs": [
      {
        "label": "product (a × b)",
        "expr": "rows * cols"
      },
      {
        "label": "quotient floor(b / a)",
        "expr": "floor(cols / rows)"
      },
      {
        "label": "remainder (b mod a)",
        "expr": "cols % rows"
      }
    ]
  },
  "exercises": [
    {
      "fn": "divMod",
      "title": "Quotient and remainder",
      "prompt": "Return [Math.floor(a / d), a % d] for non-negative integer a and divisor d > 0.",
      "starter": "function divMod(a, d) {\n  // your code here\n}\n",
      "solution": "function divMod(a, d) {\n  return [Math.floor(a / d), a % d];\n}\n",
      "tests": [
        {
          "args": [
            17,
            5
          ],
          "expected": [
            3,
            2
          ]
        },
        {
          "args": [
            20,
            4
          ],
          "expected": [
            5,
            0
          ]
        }
      ]
    },
    {
      "fn": "multiplyLoop",
      "title": "Repeated addition",
      "prompt": "Multiply non-negative integers a and b using a loop and addition.",
      "starter": "function multiplyLoop(a, b) {\n  // your code here\n}\n",
      "solution": "function multiplyLoop(a, b) {\n  let s = 0;\n  for (let i = 0; i < b; i++) s += a;\n  return s;\n}\n",
      "tests": [
        {
          "args": [
            6,
            7
          ],
          "expected": 42
        },
        {
          "args": [
            9,
            0
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "isDivisible",
      "title": "Exact divisibility",
      "prompt": "Return true if a is divisible by d with remainder 0.",
      "starter": "function isDivisible(a, d) {\n  // your code here\n}\n",
      "solution": "function isDivisible(a, d) {\n  return d !== 0 && a % d === 0;\n}\n",
      "tests": [
        {
          "args": [
            24,
            6
          ],
          "expected": true
        },
        {
          "args": [
            25,
            6
          ],
          "expected": false
        }
      ]
    }
  ]
};

initTopic(TOPIC);
