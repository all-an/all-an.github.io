// Systems of linear equations — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      -8,
      8
    ],
    "y": [
      -8,
      8
    ],
    "inputs": [
      {
        "name": "m1",
        "label": "m₁",
        "value": 1,
        "min": -3,
        "max": 3,
        "step": 0.5
      },
      {
        "name": "b1",
        "label": "b₁",
        "value": 1,
        "min": -5,
        "max": 5
      },
      {
        "name": "m2",
        "label": "m₂",
        "value": -1,
        "min": -3,
        "max": 3,
        "step": 0.5
      },
      {
        "name": "b2",
        "label": "b₂",
        "value": 3,
        "min": -5,
        "max": 5
      }
    ],
    "curves": [
      {
        "label": "y = m₁x + b₁",
        "expr": "m1 * x + b1"
      },
      {
        "label": "y = m₂x + b₂",
        "expr": "m2 * x + b2"
      }
    ]
  },
  "exercises": [
    {
      "fn": "solve2x2",
      "title": "Cramer's rule for 2×2 system",
      "prompt": "Solve a1*x + b1*y = c1 and a2*x + b2*y = c2 and return [x, y] (assume unique solution).",
      "starter": "function solve2x2(a1, b1, c1, a2, b2, c2) {\n  // your code here\n}\n",
      "solution": "function solve2x2(a1, b1, c1, a2, b2, c2) {\n  const d = a1 * b2 - a2 * b1;\n  return [(c1 * b2 - c2 * b1) / d, (a1 * c2 - a2 * c1) / d];\n}\n",
      "tests": [
        {
          "args": [
            1,
            1,
            5,
            1,
            -1,
            1
          ],
          "expected": [
            3,
            2
          ]
        },
        {
          "args": [
            2,
            3,
            12,
            1,
            -1,
            1
          ],
          "expected": [
            3,
            2
          ]
        }
      ]
    },
    {
      "fn": "determinant2x2",
      "title": "2×2 system determinant",
      "prompt": "Return the determinant a1*b2 - a2*b1.",
      "starter": "function determinant2x2(a1, b1, a2, b2) {\n  // your code here\n}\n",
      "solution": "function determinant2x2(a1, b1, a2, b2) {\n  return a1 * b2 - a2 * b1;\n}\n",
      "tests": [
        {
          "args": [
            2,
            3,
            1,
            4
          ],
          "expected": 5
        },
        {
          "args": [
            2,
            4,
            1,
            2
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "hasUniqueSolution",
      "title": "Unique intersection check",
      "prompt": "Return true if the 2×2 system with coefficients (a1, b1) and (a2, b2) has a unique solution.",
      "starter": "function hasUniqueSolution(a1, b1, a2, b2) {\n  // your code here\n}\n",
      "solution": "function hasUniqueSolution(a1, b1, a2, b2) {\n  return a1 * b2 - a2 * b1 !== 0;\n}\n",
      "tests": [
        {
          "args": [
            1,
            2,
            3,
            4
          ],
          "expected": true
        },
        {
          "args": [
            1,
            2,
            2,
            4
          ],
          "expected": false
        }
      ]
    }
  ]
};

initTopic(TOPIC);
