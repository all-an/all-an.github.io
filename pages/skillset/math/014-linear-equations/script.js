// Linear equations — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      -10,
      10
    ],
    "y": [
      -10,
      10
    ],
    "inputs": [
      {
        "name": "m",
        "label": "slope m",
        "value": 1.5,
        "min": -4,
        "max": 4,
        "step": 0.5
      },
      {
        "name": "b",
        "label": "intercept b",
        "value": -3,
        "min": -8,
        "max": 8
      }
    ],
    "curves": [
      {
        "label": "y = m·x + b",
        "expr": "m * x + b"
      }
    ]
  },
  "exercises": [
    {
      "fn": "solveLinear",
      "title": "Solve a·x + b = c",
      "prompt": "Return the solution x to a*x + b = c (assume a !== 0).",
      "starter": "function solveLinear(a, b, c) {\n  // your code here\n}\n",
      "solution": "function solveLinear(a, b, c) {\n  return (c - b) / a;\n}\n",
      "tests": [
        {
          "args": [
            2,
            4,
            10
          ],
          "expected": 3
        },
        {
          "args": [
            5,
            -15,
            0
          ],
          "expected": 3
        }
      ]
    },
    {
      "fn": "slopeBetween",
      "title": "Slope through two points",
      "prompt": "Return the slope m = (y2 - y1) / (x2 - x1) between (x1, y1) and (x2, y2).",
      "starter": "function slopeBetween(x1, y1, x2, y2) {\n  // your code here\n}\n",
      "solution": "function slopeBetween(x1, y1, x2, y2) {\n  return (y2 - y1) / (x2 - x1);\n}\n",
      "tests": [
        {
          "args": [
            0,
            0,
            4,
            8
          ],
          "expected": 2
        },
        {
          "args": [
            1,
            5,
            3,
            1
          ],
          "expected": -2
        }
      ]
    },
    {
      "fn": "xIntercept",
      "title": "Find the x-intercept",
      "prompt": "Return the x-intercept of y = m*x + b (where y = 0, m !== 0).",
      "starter": "function xIntercept(m, b) {\n  // your code here\n}\n",
      "solution": "function xIntercept(m, b) {\n  return -b / m;\n}\n",
      "tests": [
        {
          "args": [
            2,
            -6
          ],
          "expected": 3
        },
        {
          "args": [
            -4,
            8
          ],
          "expected": 2
        }
      ]
    }
  ]
};

initTopic(TOPIC);
