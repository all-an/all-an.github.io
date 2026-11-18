// Quadratic equations — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      -6,
      6
    ],
    "y": [
      -8,
      12
    ],
    "inputs": [
      {
        "name": "a",
        "label": "a",
        "value": 1,
        "min": -3,
        "max": 3,
        "step": 0.5
      },
      {
        "name": "b",
        "label": "b",
        "value": -1,
        "min": -6,
        "max": 6
      },
      {
        "name": "c",
        "label": "c",
        "value": -2,
        "min": -6,
        "max": 6
      }
    ],
    "curves": [
      {
        "label": "y = a·x² + b·x + c",
        "expr": "a * x * x + b * x + c"
      }
    ]
  },
  "exercises": [
    {
      "fn": "discriminant",
      "title": "Quadratic discriminant",
      "prompt": "Return Δ = b² - 4ac for ax² + bx + c = 0.",
      "starter": "function discriminant(a, b, c) {\n  // your code here\n}\n",
      "solution": "function discriminant(a, b, c) {\n  return b * b - 4 * a * c;\n}\n",
      "tests": [
        {
          "args": [
            1,
            -3,
            2
          ],
          "expected": 1
        },
        {
          "args": [
            1,
            2,
            1
          ],
          "expected": 0
        },
        {
          "args": [
            1,
            0,
            1
          ],
          "expected": -4
        }
      ]
    },
    {
      "fn": "quadraticRoots",
      "title": "Real roots of a quadratic",
      "prompt": "Return the real roots of ax² + bx + c = 0 in ascending order (or [] if Δ < 0, [r] if Δ === 0).",
      "starter": "function quadraticRoots(a, b, c) {\n  // your code here\n}\n",
      "solution": "function quadraticRoots(a, b, c) {\n  const d = b * b - 4 * a * c;\n  if (d < 0) return [];\n  if (d === 0) return [-b / (2 * a)];\n  const s = Math.sqrt(d);\n  const r1 = (-b - s) / (2 * a), r2 = (-b + s) / (2 * a);\n  return r1 < r2 ? [r1, r2] : [r2, r1];\n}\n",
      "tests": [
        {
          "args": [
            1,
            -3,
            2
          ],
          "expected": [
            1,
            2
          ]
        },
        {
          "args": [
            1,
            -4,
            4
          ],
          "expected": [
            2
          ]
        },
        {
          "args": [
            1,
            0,
            5
          ],
          "expected": []
        }
      ]
    },
    {
      "fn": "vertexX",
      "title": "Axis of symmetry",
      "prompt": "Return the x-coordinate of the vertex of y = ax² + bx + c: -b / (2a).",
      "starter": "function vertexX(a, b) {\n  // your code here\n}\n",
      "solution": "function vertexX(a, b) {\n  return -b / (2 * a);\n}\n",
      "tests": [
        {
          "args": [
            1,
            -6
          ],
          "expected": 3
        },
        {
          "args": [
            2,
            8
          ],
          "expected": -2
        }
      ]
    }
  ]
};

initTopic(TOPIC);
