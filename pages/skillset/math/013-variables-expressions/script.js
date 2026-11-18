// Variables & expressions — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "a",
        "label": "coefficient a",
        "value": 3,
        "min": -10,
        "max": 10
      },
      {
        "name": "x",
        "label": "variable x",
        "value": 4,
        "min": -10,
        "max": 10
      },
      {
        "name": "b",
        "label": "constant b",
        "value": -5,
        "min": -20,
        "max": 20
      }
    ],
    "outputs": [
      {
        "label": "a·x + b",
        "expr": "a * x + b"
      },
      {
        "label": "a·x² + b",
        "expr": "a * x * x + b"
      }
    ]
  },
  "exercises": [
    {
      "fn": "evalLinear",
      "title": "Evaluate a linear expression",
      "prompt": "Evaluate a * x + b for given numbers a, x, and b.",
      "starter": "function evalLinear(a, x, b) {\n  // your code here\n}\n",
      "solution": "function evalLinear(a, x, b) {\n  return a * x + b;\n}\n",
      "tests": [
        {
          "args": [
            3,
            4,
            -5
          ],
          "expected": 7
        },
        {
          "args": [
            -2,
            6,
            10
          ],
          "expected": -2
        }
      ]
    },
    {
      "fn": "combineLikeTerms",
      "title": "Combine like terms",
      "prompt": "Given coefficients [a1, b1] for a1*x + b1 and [a2, b2] for a2*x + b2, return [a1 + a2, b1 + b2].",
      "starter": "function combineLikeTerms(t1, t2) {\n  // your code here\n}\n",
      "solution": "function combineLikeTerms(t1, t2) {\n  return [t1[0] + t2[0], t1[1] + t2[1]];\n}\n",
      "tests": [
        {
          "args": [
            [
              3,
              2
            ],
            [
              5,
              -7
            ]
          ],
          "expected": [
            8,
            -5
          ]
        },
        {
          "args": [
            [
              -4,
              1
            ],
            [
              4,
              9
            ]
          ],
          "expected": [
            0,
            10
          ]
        }
      ]
    },
    {
      "fn": "substituteXY",
      "title": "Two-variable substitution",
      "prompt": "Evaluate x*x + 2*x*y + y*y at given x and y.",
      "starter": "function substituteXY(x, y) {\n  // your code here\n}\n",
      "solution": "function substituteXY(x, y) {\n  return (x + y) * (x + y);\n}\n",
      "tests": [
        {
          "args": [
            3,
            2
          ],
          "expected": 25
        },
        {
          "args": [
            5,
            -5
          ],
          "expected": 0
        }
      ]
    }
  ]
};

initTopic(TOPIC);
