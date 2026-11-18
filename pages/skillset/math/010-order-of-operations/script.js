// Order of operations — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "a",
        "label": "a",
        "value": 2,
        "min": -10,
        "max": 10
      },
      {
        "name": "b",
        "label": "b",
        "value": 3,
        "min": -10,
        "max": 10
      },
      {
        "name": "c",
        "label": "c",
        "value": 4,
        "min": -10,
        "max": 10
      }
    ],
    "outputs": [
      {
        "label": "a + b × c",
        "expr": "a + b * c"
      },
      {
        "label": "(a + b) × c",
        "expr": "(a + b) * c"
      },
      {
        "label": "a + b × c²",
        "expr": "a + b * c * c"
      },
      {
        "label": "(a + b × c)²",
        "expr": "pow(a + b * c, 2)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "evalPrecedence",
      "title": "Precedence vs parentheses",
      "prompt": "Given a, b, c, return [a + b * c, (a + b) * c].",
      "starter": "function evalPrecedence(a, b, c) {\n  // your code here\n}\n",
      "solution": "function evalPrecedence(a, b, c) {\n  return [a + b * c, (a + b) * c];\n}\n",
      "tests": [
        {
          "args": [
            2,
            3,
            4
          ],
          "expected": [
            14,
            20
          ]
        },
        {
          "args": [
            10,
            -2,
            5
          ],
          "expected": [
            0,
            40
          ]
        }
      ]
    },
    {
      "fn": "evalPolyTerm",
      "title": "Exponent before multiply",
      "prompt": "Compute a + b * (c ** 2) following standard precedence.",
      "starter": "function evalPolyTerm(a, b, c) {\n  // your code here\n}\n",
      "solution": "function evalPolyTerm(a, b, c) {\n  return a + b * (c ** 2);\n}\n",
      "tests": [
        {
          "args": [
            2,
            3,
            4
          ],
          "expected": 50
        },
        {
          "args": [
            1,
            2,
            3
          ],
          "expected": 19
        }
      ]
    },
    {
      "fn": "leftToRightDiv",
      "title": "Left-to-right division",
      "prompt": "Evaluate a / b * c left-to-right vs a / (b * c) and return both as [a / b * c, a / (b * c)].",
      "starter": "function leftToRightDiv(a, b, c) {\n  // your code here\n}\n",
      "solution": "function leftToRightDiv(a, b, c) {\n  return [(a / b) * c, a / (b * c)];\n}\n",
      "tests": [
        {
          "args": [
            24,
            4,
            2
          ],
          "expected": [
            12,
            3
          ]
        },
        {
          "args": [
            100,
            10,
            5
          ],
          "expected": [
            50,
            2
          ]
        }
      ]
    }
  ]
};

initTopic(TOPIC);
