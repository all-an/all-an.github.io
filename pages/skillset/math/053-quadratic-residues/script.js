// Quadratic residues — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "a",
        "label": "integer a",
        "value": 17,
        "min": 1,
        "max": 100
      },
      {
        "name": "m",
        "label": "modulus m",
        "value": 12,
        "min": 2,
        "max": 50
      }
    ],
    "outputs": [
      {
        "label": "a mod m",
        "expr": "mod(a, m)"
      },
      {
        "label": "gcd(a, m)",
        "expr": "gcd(a, m)"
      },
      {
        "label": "a² mod m",
        "expr": "mod(a * a, m)"
      },
      {
        "label": "is a prime?",
        "expr": "isPrime(a)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "modPow",
      "title": "Modular exponentiation (base^exp mod m)",
      "prompt": "Compute (base ** exp) % m efficiently for non-negative integer exp and modulus m > 1.",
      "starter": "function modPow(base, exp, m) {\n  // your code here\n}\n",
      "solution": "function modPow(base, exp, m) {\n  let res = 1 % m, b = ((base % m) + m) % m;\n  while (exp > 0) {\n    if (exp % 2 === 1) res = (res * b) % m;\n    b = (b * b) % m;\n    exp = Math.floor(exp / 2);\n  }\n  return res;\n}\n",
      "tests": [
        {
          "args": [
            2,
            10,
            1000
          ],
          "expected": 24
        },
        {
          "args": [
            3,
            6,
            7
          ],
          "expected": 1
        },
        {
          "args": [
            5,
            0,
            13
          ],
          "expected": 1
        }
      ]
    },
    {
      "fn": "eulerTotient",
      "title": "Euler's totient function φ(n)",
      "prompt": "Return the count of integers k in 1..n that are coprime to n (gcd(k, n) === 1).",
      "starter": "function eulerTotient(n) {\n  // your code here\n}\n",
      "solution": "function eulerTotient(n) {\n  let res = n;\n  for (let p = 2; p * p <= n; p++) {\n    if (n % p === 0) {\n      while (n % p === 0) n /= p;\n      res -= res / p;\n    }\n  }\n  if (n > 1) res -= res / n;\n  return res;\n}\n",
      "tests": [
        {
          "args": [
            9
          ],
          "expected": 6
        },
        {
          "args": [
            10
          ],
          "expected": 4
        },
        {
          "args": [
            13
          ],
          "expected": 12
        }
      ]
    },
    {
      "fn": "isPrimeNumber",
      "title": "Primality test by trial division",
      "prompt": "Return true if integer n >= 2 is prime, false otherwise.",
      "starter": "function isPrimeNumber(n) {\n  // your code here\n}\n",
      "solution": "function isPrimeNumber(n) {\n  if (n < 2 || !Number.isInteger(n)) return false;\n  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;\n  return true;\n}\n",
      "tests": [
        {
          "args": [
            2
          ],
          "expected": true
        },
        {
          "args": [
            97
          ],
          "expected": true
        },
        {
          "args": [
            91
          ],
          "expected": false
        },
        {
          "args": [
            1
          ],
          "expected": false
        }
      ]
    }
  ]
};

initTopic(TOPIC);
