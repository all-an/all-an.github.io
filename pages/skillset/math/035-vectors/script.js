// Vectors (geometric) — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "a",
        "label": "length a",
        "value": 3,
        "min": 1,
        "max": 20
      },
      {
        "name": "b",
        "label": "length b",
        "value": 4,
        "min": 1,
        "max": 20
      }
    ],
    "outputs": [
      {
        "label": "hypotenuse / distance √(a²+b²)",
        "expr": "hypot(a, b)"
      },
      {
        "label": "area a × b",
        "expr": "a * b"
      },
      {
        "label": "triangle area ½·a·b",
        "expr": "0.5 * a * b"
      },
      {
        "label": "circle area π·a²",
        "expr": "PI * a * a"
      }
    ]
  },
  "exercises": [
    {
      "fn": "euclideanDistance",
      "title": "Distance in the Cartesian plane",
      "prompt": "Return the Euclidean distance between (x1, y1) and (x2, y2).",
      "starter": "function euclideanDistance(x1, y1, x2, y2) {\n  // your code here\n}\n",
      "solution": "function euclideanDistance(x1, y1, x2, y2) {\n  return Math.hypot(x2 - x1, y2 - y1);\n}\n",
      "tests": [
        {
          "args": [
            0,
            0,
            3,
            4
          ],
          "expected": 5
        },
        {
          "args": [
            1,
            2,
            6,
            14
          ],
          "expected": 13
        }
      ]
    },
    {
      "fn": "polygonInteriorSum",
      "title": "Interior angle sum of an n-gon",
      "prompt": "Return the sum of interior angles (in degrees) of an n-sided polygon: (n - 2) * 180.",
      "starter": "function polygonInteriorSum(n) {\n  // your code here\n}\n",
      "solution": "function polygonInteriorSum(n) {\n  return (n - 2) * 180;\n}\n",
      "tests": [
        {
          "args": [
            3
          ],
          "expected": 180
        },
        {
          "args": [
            4
          ],
          "expected": 360
        },
        {
          "args": [
            6
          ],
          "expected": 720
        }
      ]
    },
    {
      "fn": "midpoint",
      "title": "Midpoint of a segment",
      "prompt": "Return [(x1 + x2) / 2, (y1 + y2) / 2] for endpoints (x1, y1) and (x2, y2).",
      "starter": "function midpoint(x1, y1, x2, y2) {\n  // your code here\n}\n",
      "solution": "function midpoint(x1, y1, x2, y2) {\n  return [(x1 + x2) / 2, (y1 + y2) / 2];\n}\n",
      "tests": [
        {
          "args": [
            0,
            0,
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
            -2,
            5,
            4,
            -1
          ],
          "expected": [
            1,
            2
          ]
        }
      ]
    }
  ]
};

initTopic(TOPIC);
