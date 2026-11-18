// Equivalence relations — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "n",
        "label": "input n",
        "value": 6,
        "min": 0,
        "max": 20
      },
      {
        "name": "m",
        "label": "modulus m",
        "value": 4,
        "min": 1,
        "max": 10
      }
    ],
    "outputs": [
      {
        "label": "equivalence class [n] mod m",
        "expr": "mod(n, m)"
      },
      {
        "label": "power set size 2ⁿ",
        "expr": "pow(2, min(n, 20))"
      },
      {
        "label": "bijection image 2n + 1",
        "expr": "2 * n + 1"
      }
    ]
  },
  "exercises": [
    {
      "fn": "binomialCoeff",
      "title": "Combinatorial coefficient C(n, k)",
      "prompt": "Return the number of k-element subsets of an n-element set, C(n, k).",
      "starter": "function binomialCoeff(n, k) {\n  // your code here\n}\n",
      "solution": "function binomialCoeff(n, k) {\n  if (k < 0 || k > n) return 0;\n  let r = 1;\n  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;\n  return Math.round(r);\n}\n",
      "tests": [
        {
          "args": [
            5,
            2
          ],
          "expected": 10
        },
        {
          "args": [
            6,
            3
          ],
          "expected": 20
        },
        {
          "args": [
            7,
            0
          ],
          "expected": 1
        }
      ]
    },
    {
      "fn": "fibonacciNth",
      "title": "Recurrence relation F(n)",
      "prompt": "Return the nth Fibonacci number where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2).",
      "starter": "function fibonacciNth(n) {\n  // your code here\n}\n",
      "solution": "function fibonacciNth(n) {\n  let a = 0, b = 1;\n  for (let i = 0; i < n; i++) [a, b] = [b, a + b];\n  return a;\n}\n",
      "tests": [
        {
          "args": [
            0
          ],
          "expected": 0
        },
        {
          "args": [
            1
          ],
          "expected": 1
        },
        {
          "args": [
            7
          ],
          "expected": 13
        },
        {
          "args": [
            10
          ],
          "expected": 55
        }
      ]
    },
    {
      "fn": "newtonSqrt",
      "title": "Iterative fixed-point / root solver",
      "prompt": "Return the square root of S > 0 using Newton iterations x_{k+1} = 0.5 * (x_k + S / x_k).",
      "starter": "function newtonSqrt(S) {\n  // your code here\n}\n",
      "solution": "function newtonSqrt(S) {\n  let x = S;\n  for (let i = 0; i < 20; i++) x = 0.5 * (x + S / x);\n  return x;\n}\n",
      "tests": [
        {
          "args": [
            9
          ],
          "expected": 3,
          "tol": 1e-9
        },
        {
          "args": [
            2
          ],
          "expected": 1.4142135623730951,
          "tol": 1e-9
        }
      ]
    }
  ]
};

initTopic(TOPIC);
