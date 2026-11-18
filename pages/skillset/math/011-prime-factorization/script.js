// Prime factorization — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "sequence",
    "from": 2,
    "count": 30,
    "inputs": [],
    "expr": "n",
    "hot": "isPrime(n)",
    "note": "Highlighted chips are prime numbers—the multiplicative building blocks of ℕ."
  },
  "exercises": [
    {
      "fn": "primeFactors",
      "title": "Prime factor list",
      "prompt": "Return the prime factors of n >= 2 in ascending order with multiplicity. primeFactors(60) → [2, 2, 3, 5].",
      "starter": "function primeFactors(n) {\n  // your code here\n}\n",
      "solution": "function primeFactors(n) {\n  const out = [];\n  for (let d = 2; d * d <= n; d++) {\n    while (n % d === 0) { out.push(d); n /= d; }\n  }\n  if (n > 1) out.push(n);\n  return out;\n}\n",
      "tests": [
        {
          "args": [
            60
          ],
          "expected": [
            2,
            2,
            3,
            5
          ]
        },
        {
          "args": [
            17
          ],
          "expected": [
            17
          ]
        },
        {
          "args": [
            32
          ],
          "expected": [
            2,
            2,
            2,
            2,
            2
          ]
        }
      ]
    },
    {
      "fn": "distinctPrimeCount",
      "title": "Number of distinct prime factors ω(n)",
      "prompt": "Return how many distinct prime numbers divide n >= 2.",
      "starter": "function distinctPrimeCount(n) {\n  // your code here\n}\n",
      "solution": "function distinctPrimeCount(n) {\n  let c = 0;\n  for (let d = 2; d * d <= n; d++) {\n    if (n % d === 0) { c++; while (n % d === 0) n /= d; }\n  }\n  if (n > 1) c++;\n  return c;\n}\n",
      "tests": [
        {
          "args": [
            60
          ],
          "expected": 3
        },
        {
          "args": [
            64
          ],
          "expected": 1
        },
        {
          "args": [
            210
          ],
          "expected": 4
        }
      ]
    },
    {
      "fn": "divisorCount",
      "title": "Total number of divisors τ(n)",
      "prompt": "Using τ(n) = ∏(aᵢ + 1), return the number of positive divisors of n >= 1.",
      "starter": "function divisorCount(n) {\n  // your code here\n}\n",
      "solution": "function divisorCount(n) {\n  let total = 1;\n  for (let d = 2; d * d <= n; d++) {\n    let e = 0;\n    while (n % d === 0) { e++; n /= d; }\n    total *= (e + 1);\n  }\n  if (n > 1) total *= 2;\n  return total;\n}\n",
      "tests": [
        {
          "args": [
            12
          ],
          "expected": 6
        },
        {
          "args": [
            36
          ],
          "expected": 9
        },
        {
          "args": [
            7
          ],
          "expected": 2
        }
      ]
    }
  ]
};

initTopic(TOPIC);
