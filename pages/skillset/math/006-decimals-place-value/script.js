// Decimals & place value — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "x",
        "label": "number x",
        "value": 3.14159,
        "step": 0.001
      },
      {
        "name": "places",
        "label": "decimal places k",
        "value": 2,
        "min": 0,
        "max": 5
      }
    ],
    "outputs": [
      {
        "label": "rounded to k places",
        "expr": "round(x * pow(10, places)) / pow(10, places)"
      },
      {
        "label": "integer part",
        "expr": "trunc(x)"
      },
      {
        "label": "fractional part",
        "expr": "x - trunc(x)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "roundToPlaces",
      "title": "Round to k decimal places",
      "prompt": "Round x to k decimal places (e.g. roundToPlaces(3.14159, 2) → 3.14).",
      "starter": "function roundToPlaces(x, k) {\n  // your code here\n}\n",
      "solution": "function roundToPlaces(x, k) {\n  const p = 10 ** k;\n  return Math.round(x * p) / p;\n}\n",
      "tests": [
        {
          "args": [
            3.14159,
            2
          ],
          "expected": 3.14
        },
        {
          "args": [
            2.5,
            0
          ],
          "expected": 3
        },
        {
          "args": [
            1.005,
            2
          ],
          "expected": 1
        }
      ]
    },
    {
      "fn": "isTerminatingDecimal",
      "title": "Terminating decimal test",
      "prompt": "Given positive integers num and den, return true if num/den has a terminating base-10 decimal expansion.",
      "starter": "function isTerminatingDecimal(num, den) {\n  // your code here\n}\n",
      "solution": "function isTerminatingDecimal(num, den) {\n  let a = num, b = den;\n  while (b) [a, b] = [b, a % b];\n  let q = den / a;\n  while (q % 2 === 0) q /= 2;\n  while (q % 5 === 0) q /= 5;\n  return q === 1;\n}\n",
      "tests": [
        {
          "args": [
            1,
            8
          ],
          "expected": true
        },
        {
          "args": [
            1,
            3
          ],
          "expected": false
        },
        {
          "args": [
            3,
            6
          ],
          "expected": true
        }
      ]
    },
    {
      "fn": "tenthDigit",
      "title": "Tenths digit",
      "prompt": "Return the digit in the tenths place (first digit after the decimal point) of non-negative number x.",
      "starter": "function tenthDigit(x) {\n  // your code here\n}\n",
      "solution": "function tenthDigit(x) {\n  return Math.floor(Math.round((x % 1) * 1000000) / 100000) % 10;\n}\n",
      "tests": [
        {
          "args": [
            12.74
          ],
          "expected": 7
        },
        {
          "args": [
            5.09
          ],
          "expected": 0
        },
        {
          "args": [
            0.3
          ],
          "expected": 3
        }
      ]
    }
  ]
};

initTopic(TOPIC);
