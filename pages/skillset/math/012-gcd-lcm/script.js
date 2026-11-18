// GCD & LCM — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "a",
        "label": "a",
        "value": 18,
        "min": 1,
        "max": 100
      },
      {
        "name": "b",
        "label": "b",
        "value": 24,
        "min": 1,
        "max": 100
      }
    ],
    "outputs": [
      {
        "label": "gcd(a, b)",
        "expr": "gcd(a, b)"
      },
      {
        "label": "lcm(a, b)",
        "expr": "lcm(a, b)"
      },
      {
        "label": "gcd × lcm",
        "expr": "gcd(a, b) * lcm(a, b)"
      },
      {
        "label": "a × b",
        "expr": "a * b"
      },
      {
        "label": "coprime? (gcd = 1)",
        "expr": "gcd(a, b) === 1"
      }
    ]
  },
  "exercises": [
    {
      "fn": "gcd",
      "title": "Greatest common divisor",
      "prompt": "Compute gcd(a, b) for non-negative integers a and b using Euclid's algorithm.",
      "starter": "function gcd(a, b) {\n  // your code here\n}\n",
      "solution": "function gcd(a, b) {\n  while (b !== 0) [a, b] = [b, a % b];\n  return a;\n}\n",
      "tests": [
        {
          "args": [
            18,
            24
          ],
          "expected": 6
        },
        {
          "args": [
            35,
            64
          ],
          "expected": 1
        },
        {
          "args": [
            42,
            0
          ],
          "expected": 42
        }
      ]
    },
    {
      "fn": "lcm",
      "title": "Least common multiple",
      "prompt": "Compute lcm(a, b) for positive integers a and b.",
      "starter": "function lcm(a, b) {\n  // your code here\n}\n",
      "solution": "function lcm(a, b) {\n  let x = a, y = b;\n  while (y) [x, y] = [y, x % y];\n  return (a / x) * b;\n}\n",
      "tests": [
        {
          "args": [
            18,
            24
          ],
          "expected": 72
        },
        {
          "args": [
            7,
            5
          ],
          "expected": 35
        },
        {
          "args": [
            12,
            12
          ],
          "expected": 12
        }
      ]
    },
    {
      "fn": "areCoprime",
      "title": "Relatively prime check",
      "prompt": "Return true if positive integers a and b share no common factor greater than 1.",
      "starter": "function areCoprime(a, b) {\n  // your code here\n}\n",
      "solution": "function areCoprime(a, b) {\n  while (b) [a, b] = [b, a % b];\n  return a === 1;\n}\n",
      "tests": [
        {
          "args": [
            14,
            15
          ],
          "expected": true
        },
        {
          "args": [
            14,
            21
          ],
          "expected": false
        }
      ]
    }
  ]
};

initTopic(TOPIC);
