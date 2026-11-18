// Percentages & ratios — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "base",
        "label": "original value",
        "value": 200,
        "min": 1,
        "max": 1000
      },
      {
        "name": "pct",
        "label": "percent p%",
        "value": 15,
        "min": -100,
        "max": 200
      }
    ],
    "outputs": [
      {
        "label": "p% of original",
        "expr": "(pct / 100) * base"
      },
      {
        "label": "after +p% change",
        "expr": "base * (1 + pct / 100)"
      },
      {
        "label": "ratio p : 100 reduced",
        "expr": "[pct / gcd(pct, 100), 100 / gcd(pct, 100)]"
      }
    ]
  },
  "exercises": [
    {
      "fn": "percentOf",
      "title": "Percentage of a number",
      "prompt": "Return p percent of x.",
      "starter": "function percentOf(p, x) {\n  // your code here\n}\n",
      "solution": "function percentOf(p, x) {\n  return (p / 100) * x;\n}\n",
      "tests": [
        {
          "args": [
            25,
            80
          ],
          "expected": 20
        },
        {
          "args": [
            15,
            200
          ],
          "expected": 30
        }
      ]
    },
    {
      "fn": "percentChange",
      "title": "Percentage change",
      "prompt": "Return the percentage change from oldVal to newVal: ((newVal - oldVal) / oldVal) * 100.",
      "starter": "function percentChange(oldVal, newVal) {\n  // your code here\n}\n",
      "solution": "function percentChange(oldVal, newVal) {\n  return ((newVal - oldVal) / oldVal) * 100;\n}\n",
      "tests": [
        {
          "args": [
            50,
            75
          ],
          "expected": 50
        },
        {
          "args": [
            100,
            80
          ],
          "expected": -20
        }
      ]
    },
    {
      "fn": "solveProportion",
      "title": "Cross-multiplication",
      "prompt": "Solve a / b = c / x for x.",
      "starter": "function solveProportion(a, b, c) {\n  // your code here\n}\n",
      "solution": "function solveProportion(a, b, c) {\n  return (b * c) / a;\n}\n",
      "tests": [
        {
          "args": [
            2,
            5,
            6
          ],
          "expected": 15
        },
        {
          "args": [
            4,
            10,
            2
          ],
          "expected": 5
        }
      ]
    }
  ]
};

initTopic(TOPIC);
