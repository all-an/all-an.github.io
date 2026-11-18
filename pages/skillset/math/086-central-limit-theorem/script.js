// Central limit theorem — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "bars",
    "from": 0,
    "count": "n + 1",
    "inputs": [
      {
        "name": "n",
        "label": "trials n",
        "value": 10,
        "min": 2,
        "max": 20
      },
      {
        "name": "p",
        "label": "success prob p",
        "value": 0.5,
        "min": 0.1,
        "max": 0.9,
        "step": 0.05
      }
    ],
    "expr": "nCr(n, k) * pow(p, k) * pow(1 - p, n - k)",
    "outputs": [
      {
        "label": "E[X] = n·p",
        "expr": "n * p"
      },
      {
        "label": "Var(X) = n·p·(1−p)",
        "expr": "n * p * (1 - p)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "bayesPosterior",
      "title": "Bayes' theorem P(A|B)",
      "prompt": "Given prior pA = P(A), likelihood pBA = P(B|A), and false-positive rate pBnotA = P(B|¬A), return P(A|B).",
      "starter": "function bayesPosterior(pA, pBA, pBnotA) {\n  // your code here\n}\n",
      "solution": "function bayesPosterior(pA, pBA, pBnotA) {\n  const pB = pBA * pA + pBnotA * (1 - pA);\n  return (pBA * pA) / pB;\n}\n",
      "tests": [
        {
          "args": [
            0.5,
            0.8,
            0.2
          ],
          "expected": 0.8,
          "tol": 1e-9
        },
        {
          "args": [
            0.1,
            0.9,
            0.1
          ],
          "expected": 0.5,
          "tol": 1e-9
        }
      ]
    },
    {
      "fn": "binomialMeanVar",
      "title": "Binomial expectation and variance",
      "prompt": "For X ~ Binomial(n, p), return [n * p, n * p * (1 - p)].",
      "starter": "function binomialMeanVar(n, p) {\n  // your code here\n}\n",
      "solution": "function binomialMeanVar(n, p) {\n  return [n * p, n * p * (1 - p)];\n}\n",
      "tests": [
        {
          "args": [
            100,
            0.5
          ],
          "expected": [
            50,
            25
          ]
        },
        {
          "args": [
            20,
            0.25
          ],
          "expected": [
            5,
            3.75
          ]
        }
      ]
    },
    {
      "fn": "unionProb",
      "title": "Addition rule for independent events",
      "prompt": "Given P(A) and P(B) for two independent events, return P(A ∪ B) = P(A) + P(B) - P(A)*P(B).",
      "starter": "function unionProb(pA, pB) {\n  // your code here\n}\n",
      "solution": "function unionProb(pA, pB) {\n  return pA + pB - pA * pB;\n}\n",
      "tests": [
        {
          "args": [
            0.5,
            0.5
          ],
          "expected": 0.75
        },
        {
          "args": [
            0.2,
            0.5
          ],
          "expected": 0.6
        }
      ]
    }
  ]
};

initTopic(TOPIC);
