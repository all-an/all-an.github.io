// Hypothesis testing — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "x1",
        "label": "x₁",
        "value": 10,
        "min": -20,
        "max": 50
      },
      {
        "name": "x2",
        "label": "x₂",
        "value": 14,
        "min": -20,
        "max": 50
      },
      {
        "name": "x3",
        "label": "x₃",
        "value": 18,
        "min": -20,
        "max": 50
      }
    ],
    "outputs": [
      {
        "label": "sample mean x̄",
        "expr": "(x1 + x2 + x3) / 3"
      },
      {
        "label": "range (max − min)",
        "expr": "max(x1, x2, x3) - min(x1, x2, x3)"
      },
      {
        "label": "sum of squares",
        "expr": "x1*x1 + x2*x2 + x3*x3"
      }
    ]
  },
  "exercises": [
    {
      "fn": "sampleMean",
      "title": "Arithmetic mean of a sample",
      "prompt": "Return the average of the non-empty numeric array xs.",
      "starter": "function sampleMean(xs) {\n  // your code here\n}\n",
      "solution": "function sampleMean(xs) {\n  return xs.reduce((a, b) => a + b, 0) / xs.length;\n}\n",
      "tests": [
        {
          "args": [
            [
              2,
              4,
              6,
              8
            ]
          ],
          "expected": 5
        },
        {
          "args": [
            [
              10,
              20,
              30
            ]
          ],
          "expected": 20
        }
      ]
    },
    {
      "fn": "sampleVariance",
      "title": "Unbiased sample variance s²",
      "prompt": "Return (1 / (n - 1)) * ∑(xᵢ - mean)² for array xs with length n >= 2.",
      "starter": "function sampleVariance(xs) {\n  // your code here\n}\n",
      "solution": "function sampleVariance(xs) {\n  const m = xs.reduce((a, b) => a + b, 0) / xs.length;\n  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);\n}\n",
      "tests": [
        {
          "args": [
            [
              2,
              4,
              6
            ]
          ],
          "expected": 4
        },
        {
          "args": [
            [
              5,
              5,
              5
            ]
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "zScore",
      "title": "Standard score (z-score)",
      "prompt": "Return (x - mean) / stdDev.",
      "starter": "function zScore(x, mean, stdDev) {\n  // your code here\n}\n",
      "solution": "function zScore(x, mean, stdDev) {\n  return (x - mean) / stdDev;\n}\n",
      "tests": [
        {
          "args": [
            130,
            100,
            15
          ],
          "expected": 2
        },
        {
          "args": [
            85,
            100,
            15
          ],
          "expected": -1
        }
      ]
    }
  ]
};

initTopic(TOPIC);
