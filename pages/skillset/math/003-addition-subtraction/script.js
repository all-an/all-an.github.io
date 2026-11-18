// Addition & subtraction — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "numberline",
    "range": [
      -20,
      20
    ],
    "inputs": [
      {
        "name": "a",
        "label": "a",
        "value": 6,
        "min": -10,
        "max": 10
      },
      {
        "name": "b",
        "label": "b",
        "value": 4,
        "min": -10,
        "max": 10
      }
    ],
    "points": [
      {
        "label": "a",
        "expr": "a"
      },
      {
        "label": "a + b",
        "expr": "a + b"
      },
      {
        "label": "a − b",
        "expr": "a - b"
      }
    ],
    "outputs": [
      {
        "label": "sum (a + b)",
        "expr": "a + b"
      },
      {
        "label": "difference (a − b)",
        "expr": "a - b"
      },
      {
        "label": "inverse check ((a − b) + b)",
        "expr": "(a - b) + b"
      }
    ]
  },
  "exercises": [
    {
      "fn": "sumAndDiff",
      "title": "Sum and difference",
      "prompt": "Return [a + b, a - b] for numbers a and b.",
      "starter": "function sumAndDiff(a, b) {\n  // your code here\n}\n",
      "solution": "function sumAndDiff(a, b) {\n  return [a + b, a - b];\n}\n",
      "tests": [
        {
          "args": [
            10,
            4
          ],
          "expected": [
            14,
            6
          ]
        },
        {
          "args": [
            3,
            9
          ],
          "expected": [
            12,
            -6
          ]
        }
      ]
    },
    {
      "fn": "missingAddend",
      "title": "Missing addend",
      "prompt": "Return x such that a + x = target.",
      "starter": "function missingAddend(a, target) {\n  // your code here\n}\n",
      "solution": "function missingAddend(a, target) {\n  return target - a;\n}\n",
      "tests": [
        {
          "args": [
            7,
            20
          ],
          "expected": 13
        },
        {
          "args": [
            15,
            10
          ],
          "expected": -5
        }
      ]
    },
    {
      "fn": "countCarries",
      "title": "Count base-10 carries",
      "prompt": "Return how many base-10 column additions produce a carry when adding non-negative integers a and b.",
      "starter": "function countCarries(a, b) {\n  // your code here\n}\n",
      "solution": "function countCarries(a, b) {\n  let carry = 0, c = 0;\n  while (a > 0 || b > 0) {\n    carry = ((a % 10) + (b % 10) + carry) >= 10 ? 1 : 0;\n    c += carry;\n    a = Math.floor(a / 10); b = Math.floor(b / 10);\n  }\n  return c;\n}\n",
      "tests": [
        {
          "args": [
            456,
            789
          ],
          "expected": 3
        },
        {
          "args": [
            123,
            456
          ],
          "expected": 0
        },
        {
          "args": [
            999,
            1
          ],
          "expected": 3
        }
      ]
    }
  ]
};

initTopic(TOPIC);
