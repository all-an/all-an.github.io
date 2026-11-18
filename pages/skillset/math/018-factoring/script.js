// Factoring — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "p",
        "label": "root factor p",
        "value": 3,
        "min": -10,
        "max": 10
      },
      {
        "name": "q",
        "label": "root factor q",
        "value": -5,
        "min": -10,
        "max": 10
      }
    ],
    "outputs": [
      {
        "label": "b = p + q (linear coeff)",
        "expr": "p + q"
      },
      {
        "label": "c = p × q (constant term)",
        "expr": "p * q"
      },
      {
        "label": "discriminant (p − q)²",
        "expr": "(p - q) * (p - q)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "diffOfSquares",
      "title": "Difference of squares a² − b²",
      "prompt": "Return [a - b, a + b, (a - b) * (a + b)] for numbers a and b.",
      "starter": "function diffOfSquares(a, b) {\n  // your code here\n}\n",
      "solution": "function diffOfSquares(a, b) {\n  return [a - b, a + b, (a - b) * (a + b)];\n}\n",
      "tests": [
        {
          "args": [
            7,
            3
          ],
          "expected": [
            4,
            10,
            40
          ]
        },
        {
          "args": [
            10,
            9
          ],
          "expected": [
            1,
            19,
            19
          ]
        }
      ]
    },
    {
      "fn": "factorMonic",
      "title": "Factor x² + bx + c = (x + p)(x + q)",
      "prompt": "Given integers b and c, return [p, q] with p <= q such that p + q = b and p * q = c.",
      "starter": "function factorMonic(b, c) {\n  // your code here\n}\n",
      "solution": "function factorMonic(b, c) {\n  const s = Math.round(Math.sqrt(b * b - 4 * c));\n  const p = (b - s) / 2, q = (b + s) / 2;\n  return [p, q];\n}\n",
      "tests": [
        {
          "args": [
            5,
            6
          ],
          "expected": [
            2,
            3
          ]
        },
        {
          "args": [
            -1,
            -6
          ],
          "expected": [
            -3,
            2
          ]
        }
      ]
    },
    {
      "fn": "commonMonomial",
      "title": "Factor out GCD of coefficients",
      "prompt": "Given non-zero positive coefficients [a, b], return [g, a/g, b/g] where g = gcd(a, b).",
      "starter": "function commonMonomial(a, b) {\n  // your code here\n}\n",
      "solution": "function commonMonomial(a, b) {\n  let x = a, y = b;\n  while (y) [x, y] = [y, x % y];\n  return [x, a / x, b / x];\n}\n",
      "tests": [
        {
          "args": [
            12,
            18
          ],
          "expected": [
            6,
            2,
            3
          ]
        },
        {
          "args": [
            15,
            25
          ],
          "expected": [
            5,
            3,
            5
          ]
        }
      ]
    }
  ]
};

initTopic(TOPIC);
