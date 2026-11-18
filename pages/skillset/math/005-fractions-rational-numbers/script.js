// Fractions & rational numbers — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "a",
        "label": "numerator a",
        "value": 6,
        "min": -20,
        "max": 20
      },
      {
        "name": "b",
        "label": "denominator b",
        "value": 8,
        "min": 1,
        "max": 20
      },
      {
        "name": "c",
        "label": "numerator c",
        "value": 1,
        "min": -20,
        "max": 20
      },
      {
        "name": "d",
        "label": "denominator d",
        "value": 4,
        "min": 1,
        "max": 20
      }
    ],
    "outputs": [
      {
        "label": "a/b reduced",
        "expr": "[a / gcd(a, b), b / gcd(a, b)]"
      },
      {
        "label": "decimal value of a/b",
        "expr": "a / b"
      },
      {
        "label": "a/b + c/d (decimal)",
        "expr": "a / b + c / d"
      },
      {
        "label": "(a/b) × (c/d) (decimal)",
        "expr": "(a * c) / (b * d)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "reduceFraction",
      "title": "Reduce to lowest terms",
      "prompt": "Given positive integers num and den, return [num/g, den/g] where g = gcd(num, den).",
      "starter": "function reduceFraction(num, den) {\n  // your code here\n}\n",
      "solution": "function reduceFraction(num, den) {\n  let a = num, b = den;\n  while (b) [a, b] = [b, a % b];\n  return [num / a, den / a];\n}\n",
      "tests": [
        {
          "args": [
            6,
            8
          ],
          "expected": [
            3,
            4
          ]
        },
        {
          "args": [
            15,
            5
          ],
          "expected": [
            3,
            1
          ]
        },
        {
          "args": [
            7,
            13
          ],
          "expected": [
            7,
            13
          ]
        }
      ]
    },
    {
      "fn": "addFractions",
      "title": "Add two fractions",
      "prompt": "Given [a, b] and [c, d], return their sum [p, q] reduced to lowest terms.",
      "starter": "function addFractions(f1, f2) {\n  // your code here\n}\n",
      "solution": "function addFractions(f1, f2) {\n  const num = f1[0] * f2[1] + f2[0] * f1[1];\n  const den = f1[1] * f2[1];\n  let a = Math.abs(num), b = den;\n  while (b) [a, b] = [b, a % b];\n  return [num / a, den / a];\n}\n",
      "tests": [
        {
          "args": [
            [
              1,
              4
            ],
            [
              1,
              4
            ]
          ],
          "expected": [
            1,
            2
          ]
        },
        {
          "args": [
            [
              1,
              3
            ],
            [
              1,
              6
            ]
          ],
          "expected": [
            1,
            2
          ]
        }
      ]
    },
    {
      "fn": "areEquivalent",
      "title": "Equivalent fractions",
      "prompt": "Return true if a/b and c/d represent the exact same rational number.",
      "starter": "function areEquivalent(a, b, c, d) {\n  // your code here\n}\n",
      "solution": "function areEquivalent(a, b, c, d) {\n  return a * d === b * c;\n}\n",
      "tests": [
        {
          "args": [
            2,
            3,
            6,
            9
          ],
          "expected": true
        },
        {
          "args": [
            3,
            5,
            4,
            7
          ],
          "expected": false
        }
      ]
    }
  ]
};

initTopic(TOPIC);
