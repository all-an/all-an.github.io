// Law of sines & cosines — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "plot",
    "x": [
      -6.28,
      6.28
    ],
    "y": [
      -2.5,
      2.5
    ],
    "inputs": [
      {
        "name": "A",
        "label": "amplitude A",
        "value": 1,
        "min": 0.5,
        "max": 2,
        "step": 0.25
      },
      {
        "name": "w",
        "label": "frequency ω",
        "value": 1,
        "min": 0.5,
        "max": 3,
        "step": 0.5
      }
    ],
    "curves": [
      {
        "label": "A·sin(ωx)",
        "expr": "A * sin(w * x)"
      },
      {
        "label": "A·cos(ωx)",
        "expr": "A * cos(w * x)"
      }
    ]
  },
  "exercises": [
    {
      "fn": "degToRad",
      "title": "Degrees to radians",
      "prompt": "Convert degrees to radians: deg * Math.PI / 180.",
      "starter": "function degToRad(deg) {\n  // your code here\n}\n",
      "solution": "function degToRad(deg) {\n  return (deg * Math.PI) / 180;\n}\n",
      "tests": [
        {
          "args": [
            180
          ],
          "expected": 3.141592653589793,
          "tol": 1e-9
        },
        {
          "args": [
            90
          ],
          "expected": 1.5707963267948966,
          "tol": 1e-9
        },
        {
          "args": [
            0
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "lawOfCosinesSide",
      "title": "Law of cosines c = √(a² + b² − 2ab·cos C)",
      "prompt": "Given sides a, b and included angle C in radians, return the opposite side length c.",
      "starter": "function lawOfCosinesSide(a, b, angleRad) {\n  // your code here\n}\n",
      "solution": "function lawOfCosinesSide(a, b, angleRad) {\n  return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(angleRad));\n}\n",
      "tests": [
        {
          "args": [
            3,
            4,
            1.5707963267948966
          ],
          "expected": 5,
          "tol": 1e-9
        },
        {
          "args": [
            5,
            5,
            0
          ],
          "expected": 0,
          "tol": 1e-9
        }
      ]
    },
    {
      "fn": "polarToCartesian",
      "title": "Polar (r, θ) to Cartesian [x, y]",
      "prompt": "Given radius r and angle theta in radians, return [r * Math.cos(theta), r * Math.sin(theta)].",
      "starter": "function polarToCartesian(r, theta) {\n  // your code here\n}\n",
      "solution": "function polarToCartesian(r, theta) {\n  return [r * Math.cos(theta), r * Math.sin(theta)];\n}\n",
      "tests": [
        {
          "args": [
            5,
            0
          ],
          "expected": [
            5,
            0
          ]
        },
        {
          "args": [
            0,
            1.2
          ],
          "expected": [
            0,
            0
          ]
        }
      ]
    }
  ]
};

initTopic(TOPIC);
