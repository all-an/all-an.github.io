// Eigenvalues & eigenvectors — demo and exercises. The shared runtime (../topic.js) builds the page from this object.

const TOPIC = {
  "demo": {
    "type": "calc",
    "inputs": [
      {
        "name": "a",
        "label": "a₁₁",
        "value": 3,
        "min": -10,
        "max": 10
      },
      {
        "name": "b",
        "label": "a₁₂",
        "value": 1,
        "min": -10,
        "max": 10
      },
      {
        "name": "c",
        "label": "a₂₁",
        "value": 2,
        "min": -10,
        "max": 10
      },
      {
        "name": "d",
        "label": "a₂₂",
        "value": 4,
        "min": -10,
        "max": 10
      }
    ],
    "outputs": [
      {
        "label": "det(A) = ad − bc",
        "expr": "a * d - b * c"
      },
      {
        "label": "trace(A) = a + d",
        "expr": "a + d"
      },
      {
        "label": "column 1 norm √(a²+c²)",
        "expr": "hypot(a, c)"
      },
      {
        "label": "dot product of rows (ab + cd)",
        "expr": "a * b + c * d"
      }
    ]
  },
  "exercises": [
    {
      "fn": "dotProduct",
      "title": "Vector dot product",
      "prompt": "Return the inner product u[0]*v[0] + u[1]*v[1] + ... of two equal-length vectors u and v.",
      "starter": "function dotProduct(u, v) {\n  // your code here\n}\n",
      "solution": "function dotProduct(u, v) {\n  return u.reduce((s, x, i) => s + x * v[i], 0);\n}\n",
      "tests": [
        {
          "args": [
            [
              1,
              2,
              3
            ],
            [
              4,
              5,
              6
            ]
          ],
          "expected": 32
        },
        {
          "args": [
            [
              2,
              -1
            ],
            [
              1,
              2
            ]
          ],
          "expected": 0
        }
      ]
    },
    {
      "fn": "matVecMul2x2",
      "title": "2×2 matrix-vector multiplication",
      "prompt": "Given 2×2 matrix [[a, b], [c, d]] and vector [x, y], return [a*x + b*y, c*x + d*y].",
      "starter": "function matVecMul2x2(M, v) {\n  // your code here\n}\n",
      "solution": "function matVecMul2x2(M, v) {\n  return [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]];\n}\n",
      "tests": [
        {
          "args": [
            [
              [
                2,
                1
              ],
              [
                0,
                3
              ]
            ],
            [
              4,
              5
            ]
          ],
          "expected": [
            13,
            15
          ]
        },
        {
          "args": [
            [
              [
                1,
                0
              ],
              [
                0,
                1
              ]
            ],
            [
              7,
              -2
            ]
          ],
          "expected": [
            7,
            -2
          ]
        }
      ]
    },
    {
      "fn": "traceAndDet2x2",
      "title": "Trace and determinant of a 2×2 matrix",
      "prompt": "Given [[a, b], [c, d]], return [a + d, a * d - b * c].",
      "starter": "function traceAndDet2x2(M) {\n  // your code here\n}\n",
      "solution": "function traceAndDet2x2(M) {\n  return [M[0][0] + M[1][1], M[0][0] * M[1][1] - M[0][1] * M[1][0]];\n}\n",
      "tests": [
        {
          "args": [
            [
              [
                3,
                1
              ],
              [
                2,
                4
              ]
            ]
          ],
          "expected": [
            7,
            10
          ]
        },
        {
          "args": [
            [
              [
                1,
                2
              ],
              [
                2,
                4
              ]
            ]
          ],
          "expected": [
            5,
            0
          ]
        }
      ]
    }
  ]
};

initTopic(TOPIC);
