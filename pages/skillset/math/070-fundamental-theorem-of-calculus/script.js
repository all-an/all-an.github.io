// Fundamental theorem of calculus — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      -4,
      4
    ],
    "y": [
      -6,
      6
    ],
    "inputs": [
      {
        "name": "k",
        "label": "parameter k",
        "value": 1,
        "min": 0.5,
        "max": 3,
        "step": 0.5
      }
    ],
    "curves": [
      {
        "label": "f(x) = sin(k·x) + 0.2·x²",
        "expr": "sin(k * x) + 0.2 * x * x"
      },
      {
        "label": "f'(x) = k·cos(k·x) + 0.4·x",
        "expr": "k * cos(k * x) + 0.4 * x"
      }
    ]
  },
  "exercises": [
    {
      "fn": "powerRuleDerivative",
      "title": "Derivative of c·xⁿ at x",
      "prompt": "Using d/dx(c·x^n) = c·n·x^(n-1), evaluate the derivative at x (for n >= 1).",
      "starter": "function powerRuleDerivative(c, n, x) {\n  // your code here\n}\n",
      "solution": "function powerRuleDerivative(c, n, x) {\n  return c * n * (x ** (n - 1));\n}\n",
      "tests": [
        {
          "args": [
            3,
            2,
            4
          ],
          "expected": 24
        },
        {
          "args": [
            1,
            3,
            2
          ],
          "expected": 12
        },
        {
          "args": [
            5,
            1,
            10
          ],
          "expected": 5
        }
      ]
    },
    {
      "fn": "definiteIntegralPoly",
      "title": "Definite integral ∫_a^b x² dx",
      "prompt": "By the Fundamental Theorem of Calculus, return (b^3 - a^3) / 3.",
      "starter": "function definiteIntegralPoly(a, b) {\n  // your code here\n}\n",
      "solution": "function definiteIntegralPoly(a, b) {\n  return (b ** 3 - a ** 3) / 3;\n}\n",
      "tests": [
        {
          "args": [
            0,
            3
          ],
          "expected": 9
        },
        {
          "args": [
            1,
            4
          ],
          "expected": 21
        }
      ]
    },
    {
      "fn": "taylorExpApprox",
      "title": "Maclaurin polynomial for eˣ",
      "prompt": "Approximate e^x by summing x^k / k! for k = 0 up to degree n.",
      "starter": "function taylorExpApprox(x, n) {\n  // your code here\n}\n",
      "solution": "function taylorExpApprox(x, n) {\n  let sum = 1, term = 1;\n  for (let k = 1; k <= n; k++) { term *= x / k; sum += term; }\n  return sum;\n}\n",
      "tests": [
        {
          "args": [
            0,
            5
          ],
          "expected": 1
        },
        {
          "args": [
            1,
            10
          ],
          "expected": 2.718281828459045,
          "tol": 0.000001
        }
      ]
    }
  ]
};

initTopic(TOPIC);
