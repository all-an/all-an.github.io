// Polynomials — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      -3,
      3
    ],
    "y": [
      -6,
      6
    ],
    "inputs": [
      {
        "name": "a3",
        "label": "a₃ (x³)",
        "value": 1,
        "min": -2,
        "max": 2,
        "step": 0.5
      },
      {
        "name": "a1",
        "label": "a₁ (x)",
        "value": -3,
        "min": -5,
        "max": 5
      },
      {
        "name": "a0",
        "label": "a₀",
        "value": 0,
        "min": -4,
        "max": 4
      }
    ],
    "curves": [
      {
        "label": "P(x) = a₃x³ + a₁x + a₀",
        "expr": "a3 * x * x * x + a1 * x + a0"
      }
    ]
  },
  "exercises": [
    {
      "fn": "evalPolyHorner",
      "title": "Evaluate polynomial (Horner's method)",
      "prompt": "Given coeffs [a0, a1, ..., an] for a0 + a1*x + ... + an*x^n, return P(x).",
      "starter": "function evalPolyHorner(coeffs, x) {\n  // your code here\n}\n",
      "solution": "function evalPolyHorner(coeffs, x) {\n  let acc = 0;\n  for (let i = coeffs.length - 1; i >= 0; i--) acc = acc * x + coeffs[i];\n  return acc;\n}\n",
      "tests": [
        {
          "args": [
            [
              1,
              2,
              3
            ],
            2
          ],
          "expected": 17
        },
        {
          "args": [
            [
              -4,
              0,
              1
            ],
            2
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "polyDegree",
      "title": "Degree of a polynomial",
      "prompt": "Given coeffs [a0, a1, ..., an], return the highest index i with coeffs[i] !== 0 (or 0 if all zero).",
      "starter": "function polyDegree(coeffs) {\n  // your code here\n}\n",
      "solution": "function polyDegree(coeffs) {\n  for (let i = coeffs.length - 1; i > 0; i--) if (coeffs[i] !== 0) return i;\n  return 0;\n}\n",
      "tests": [
        {
          "args": [
            [
              1,
              2,
              5,
              0
            ]
          ],
          "expected": 2
        },
        {
          "args": [
            [
              7
            ]
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "addPolynomials",
      "title": "Add two polynomials",
      "prompt": "Add two coefficient arrays [a0, a1] and [b0, b1] of equal length.",
      "starter": "function addPolynomials(p, q) {\n  // your code here\n}\n",
      "solution": "function addPolynomials(p, q) {\n  return p.map((c, i) => c + (q[i] || 0));\n}\n",
      "tests": [
        {
          "args": [
            [
              1,
              2,
              3
            ],
            [
              4,
              -2,
              1
            ]
          ],
          "expected": [
            5,
            0,
            4
          ]
        }
      ]
    }
  ]
};

initTopic(TOPIC);
