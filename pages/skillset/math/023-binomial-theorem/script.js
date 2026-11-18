// Binomial theorem — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      -5,
      5
    ],
    "y": [
      -5,
      15
    ],
    "inputs": [
      {
        "name": "a",
        "label": "parameter a",
        "value": 1,
        "min": -3,
        "max": 3,
        "step": 0.5
      },
      {
        "name": "b",
        "label": "parameter b",
        "value": 1,
        "min": -4,
        "max": 4
      }
    ],
    "curves": [
      {
        "label": "Binomial theorem curve",
        "expr": "a * x * x + b * x"
      }
    ]
  },
  "exercises": [
    {
      "fn": "evaluateQuadratic",
      "title": "Evaluate quadratic expression (Binomial theorem)",
      "prompt": "Given coefficients a, b, c and input x, return a*x*x + b*x + c.",
      "starter": "function evaluateQuadratic(a, b, c, x) {\n  // your code here\n}\n",
      "solution": "function evaluateQuadratic(a, b, c, x) {\n  return a * x * x + b * x + c;\n}\n",
      "tests": [
        {
          "args": [
            1,
            -3,
            2,
            4
          ],
          "expected": 6
        },
        {
          "args": [
            2,
            0,
            -8,
            2
          ],
          "expected": 0
        },
        {
          "args": [
            1,
            5,
            6,
            -2
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "arithmeticTerm",
      "title": "nth term of an arithmetic sequence",
      "prompt": "Given first term a1, common difference d, and 1-based index n, return a1 + (n - 1) * d.",
      "starter": "function arithmeticTerm(a1, d, n) {\n  // your code here\n}\n",
      "solution": "function arithmeticTerm(a1, d, n) {\n  return a1 + (n - 1) * d;\n}\n",
      "tests": [
        {
          "args": [
            3,
            5,
            1
          ],
          "expected": 3
        },
        {
          "args": [
            3,
            5,
            4
          ],
          "expected": 18
        },
        {
          "args": [
            10,
            -2,
            6
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "geometricSum",
      "title": "Partial sum of a geometric series",
      "prompt": "Return the sum of the first n terms of a + a*r + a*r^2 + ... + a*r^(n-1).",
      "starter": "function geometricSum(a, r, n) {\n  // your code here\n}\n",
      "solution": "function geometricSum(a, r, n) {\n  let sum = 0, term = a;\n  for (let i = 0; i < n; i++) { sum += term; term *= r; }\n  return sum;\n}\n",
      "tests": [
        {
          "args": [
            1,
            2,
            4
          ],
          "expected": 15
        },
        {
          "args": [
            3,
            3,
            3
          ],
          "expected": 39
        },
        {
          "args": [
            5,
            1,
            4
          ],
          "expected": 20
        }
      ]
    }
  ]
};

initTopic(TOPIC);
