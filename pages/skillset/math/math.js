// Mathematics index — searchable, field-filterable catalogue of math concepts,
// ordered roughly from the most basic field to the most advanced. Each entry:
//   c  — concept name
//   url — folder for its interactive page (added later, once the folder exists)
//   cat — field key (matches the badge color classes in math.css)
//   cl  — human-readable field name (shown on the badge)
//   ideas — key sub-topics / keywords, shown as tags and used for search
//   t   — theory / origin / notable figures
const DATA = [
  // ---- Arithmetic: numbers and the four operations ----
  {c:"Natural numbers & counting",url:"001-natural-numbers-counting/",cat:"arith",cl:"Arithmetic",ideas:["counting","successor","place value"],t:"Peano axioms · base-10 numerals"},
  {c:"Integers & negative numbers",url:"002-integers-negative-numbers/",cat:"arith",cl:"Arithmetic",ideas:["sign","number line","absolute value"],t:"Brahmagupta (628 CE)"},
  {c:"Addition & subtraction",url:"003-addition-subtraction/",cat:"arith",cl:"Arithmetic",ideas:["sum","difference","carry / borrow"],t:"Commutative & associative laws"},
  {c:"Multiplication & division",url:"004-multiplication-division/",cat:"arith",cl:"Arithmetic",ideas:["product","quotient","remainder"],t:"Distributive law · long division"},
  {c:"Fractions & rational numbers",url:"005-fractions-rational-numbers/",cat:"arith",cl:"Arithmetic",ideas:["numerator","denominator","equivalence"],t:"Field of rationals ℚ"},
  {c:"Decimals & place value",url:"006-decimals-place-value/",cat:"arith",cl:"Arithmetic",ideas:["decimal point","rounding","repeating decimals"],t:"Positional notation (Stevin 1585)"},
  {c:"Percentages & ratios",url:"007-percentages-ratios/",cat:"arith",cl:"Arithmetic",ideas:["proportion","rate","scaling"],t:"Per centum · cross-multiplication"},
  {c:"Exponents & powers",url:"008-exponents-powers/",cat:"arith",cl:"Arithmetic",ideas:["base","exponent","power laws"],t:"Repeated multiplication"},
  {c:"Roots & radicals",url:"009-roots-radicals/",cat:"arith",cl:"Arithmetic",ideas:["square root","nth root","irrationals"],t:"Pythagoreans · √2 irrationality"},
  {c:"Order of operations",url:"010-order-of-operations/",cat:"arith",cl:"Arithmetic",ideas:["PEMDAS","precedence","grouping"],t:"Operator precedence convention"},
  {c:"Prime factorization",url:"011-prime-factorization/",cat:"arith",cl:"Arithmetic",ideas:["primes","factor tree","unique factorization"],t:"Fundamental theorem of arithmetic"},
  {c:"GCD & LCM",url:"012-gcd-lcm/",cat:"arith",cl:"Arithmetic",ideas:["common divisor","common multiple"],t:"Euclid's Elements (Book VII)"},

  // ---- Algebra: symbols, equations and structure ----
  {c:"Variables & expressions",url:"013-variables-expressions/",cat:"alg",cl:"Algebra",ideas:["unknowns","terms","substitution"],t:"al-Khwārizmī (820 CE)"},
  {c:"Linear equations",url:"014-linear-equations/",cat:"alg",cl:"Algebra",ideas:["slope-intercept","solving for x","graphing"],t:"First-degree equations"},
  {c:"Systems of linear equations",url:"015-systems-of-linear-equations/",cat:"alg",cl:"Algebra",ideas:["substitution","elimination","intersection"],t:"Cramer's rule · Gaussian elimination"},
  {c:"Quadratic equations",url:"016-quadratic-equations/",cat:"alg",cl:"Algebra",ideas:["quadratic formula","discriminant","parabola"],t:"Completing the square (Babylonians)"},
  {c:"Polynomials",url:"017-polynomials/",cat:"alg",cl:"Algebra",ideas:["degree","coefficients","roots"],t:"Fundamental theorem of algebra (Gauss)"},
  {c:"Factoring",url:"018-factoring/",cat:"alg",cl:"Algebra",ideas:["common factor","grouping","difference of squares"],t:"Reverse distribution"},
  {c:"Inequalities",url:"019-inequalities/",cat:"alg",cl:"Algebra",ideas:["<, >, ≤, ≥","intervals","sign analysis"],t:"Order relations on ℝ"},
  {c:"Functions & relations",url:"020-functions-relations/",cat:"alg",cl:"Algebra",ideas:["domain","range","mapping"],t:"Dirichlet / Euler function concept"},
  {c:"Exponential & logarithmic functions",url:"021-exponential-logarithmic-functions/",cat:"alg",cl:"Algebra",ideas:["growth / decay","log laws","base e"],t:"Napier · Euler's number e"},
  {c:"Sequences & series",url:"022-sequences-series/",cat:"alg",cl:"Algebra",ideas:["arithmetic","geometric","summation"],t:"Gauss summation · Σ notation"},
  {c:"Binomial theorem",url:"023-binomial-theorem/",cat:"alg",cl:"Algebra",ideas:["expansion","Pascal's triangle","coefficients"],t:"Newton's generalized binomial"},
  {c:"Matrices (introduction)",url:"024-matrices/",cat:"alg",cl:"Algebra",ideas:["array","operations","systems"],t:"Cayley · Sylvester (1850s)"},

  // ---- Geometry: shape, space and measurement ----
  {c:"Points, lines & planes",url:"025-points-lines-planes/",cat:"geom",cl:"Geometry",ideas:["dimension","incidence","postulates"],t:"Euclid's Elements (300 BCE)"},
  {c:"Angles",url:"026-angles/",cat:"geom",cl:"Geometry",ideas:["degrees / radians","complementary","supplementary"],t:"Angle measure"},
  {c:"Triangles & congruence",url:"027-triangles-congruence/",cat:"geom",cl:"Geometry",ideas:["SSS / SAS / ASA","angle sum","types"],t:"Euclidean congruence axioms"},
  {c:"Similarity",url:"028-similarity/",cat:"geom",cl:"Geometry",ideas:["scale factor","proportional sides","AA"],t:"Thales' theorem"},
  {c:"Circles",url:"029-circles/",cat:"geom",cl:"Geometry",ideas:["radius","chord","arc / sector"],t:"π · inscribed angle theorem"},
  {c:"Polygons",url:"030-polygons/",cat:"geom",cl:"Geometry",ideas:["interior angles","regular polygons","tessellation"],t:"Angle-sum (n−2)·180°"},
  {c:"Perimeter, area & volume",url:"031-perimeter-area-volume/",cat:"geom",cl:"Geometry",ideas:["measurement","formulas","units"],t:"Mensuration"},
  {c:"Pythagorean theorem",url:"032-pythagorean-theorem/",cat:"geom",cl:"Geometry",ideas:["a²+b²=c²","right triangle","distance"],t:"Pythagoras (570 BCE)"},
  {c:"Coordinate geometry",url:"033-coordinate-geometry/",cat:"geom",cl:"Geometry",ideas:["Cartesian plane","distance / midpoint","slope"],t:"Descartes (1637) · analytic geometry"},
  {c:"Transformations & symmetry",url:"034-transformations-symmetry/",cat:"geom",cl:"Geometry",ideas:["translation","rotation","reflection"],t:"Klein's Erlangen program"},
  {c:"Vectors (geometric)",url:"035-vectors/",cat:"geom",cl:"Geometry",ideas:["magnitude","direction","components"],t:"Hamilton · Grassmann"},
  {c:"Conic sections",url:"036-conic-sections/",cat:"geom",cl:"Geometry",ideas:["ellipse","parabola","hyperbola"],t:"Apollonius of Perga"},

  // ---- Trigonometry: angles and periodic functions ----
  {c:"Right-triangle trigonometry",url:"037-right-triangle-trigonometry/",cat:"trig",cl:"Trigonometry",ideas:["sine","cosine","tangent · SOH-CAH-TOA"],t:"Hipparchus · chord tables"},
  {c:"Unit circle",url:"038-unit-circle/",cat:"trig",cl:"Trigonometry",ideas:["radians","reference angle","quadrants"],t:"Circle of radius 1"},
  {c:"Trigonometric functions",url:"039-trigonometric-functions/",cat:"trig",cl:"Trigonometry",ideas:["periodicity","amplitude","phase"],t:"Periodic waveforms"},
  {c:"Trigonometric identities",url:"040-trigonometric-identities/",cat:"trig",cl:"Trigonometry",ideas:["Pythagorean","angle sum","double angle"],t:"sin²+cos²=1"},
  {c:"Law of sines & cosines",url:"041-law-of-sines-cosines/",cat:"trig",cl:"Trigonometry",ideas:["oblique triangles","solving triangles"],t:"Generalized Pythagorean theorem"},
  {c:"Inverse trig functions",url:"042-inverse-trig-functions/",cat:"trig",cl:"Trigonometry",ideas:["arcsin","arccos","arctan"],t:"Restricted-domain inverses"},
  {c:"Polar coordinates",url:"043-polar-coordinates/",cat:"trig",cl:"Trigonometry",ideas:["r, θ","polar curves","conversion"],t:"Newton · Bernoulli"},
  {c:"Complex numbers (polar form)",url:"044-complex-numbers/",cat:"trig",cl:"Trigonometry",ideas:["modulus / argument","De Moivre","roots of unity"],t:"Euler's formula e^{iθ}"},

  // ---- Number theory: properties of the integers ----
  {c:"Divisibility",url:"045-divisibility/",cat:"nt",cl:"Number Theory",ideas:["divisors","divisibility rules","parity"],t:"Elementary number theory"},
  {c:"Prime numbers",url:"046-prime-numbers/",cat:"nt",cl:"Number Theory",ideas:["sieve of Eratosthenes","infinitude","distribution"],t:"Euclid · prime number theorem"},
  {c:"Modular arithmetic",url:"047-modular-arithmetic/",cat:"nt",cl:"Number Theory",ideas:["congruence","clock arithmetic","residues"],t:"Gauss, Disquisitiones (1801)"},
  {c:"Euclidean algorithm",url:"048-euclidean-algorithm/",cat:"nt",cl:"Number Theory",ideas:["GCD","Bézout coefficients","extended"],t:"Euclid's Elements"},
  {c:"Diophantine equations",url:"049-diophantine-equations/",cat:"nt",cl:"Number Theory",ideas:["integer solutions","linear","Pell"],t:"Diophantus of Alexandria"},
  {c:"Fermat's little theorem",url:"050-fermat-s-little-theorem/",cat:"nt",cl:"Number Theory",ideas:["a^p ≡ a","primality","Fermat test"],t:"Fermat (1640)"},
  {c:"Euler's totient function",url:"051-euler-s-totient-function/",cat:"nt",cl:"Number Theory",ideas:["φ(n)","Euler's theorem","coprimality"],t:"Euler · generalizes Fermat"},
  {c:"Continued fractions",url:"052-continued-fractions/",cat:"nt",cl:"Number Theory",ideas:["convergents","best approximation"],t:"Rational approximation"},
  {c:"Quadratic residues",url:"053-quadratic-residues/",cat:"nt",cl:"Number Theory",ideas:["Legendre symbol","reciprocity"],t:"Gauss' quadratic reciprocity"},
  {c:"RSA & cryptographic number theory",url:"054-rsa-cryptographic-number-theory/",cat:"nt",cl:"Number Theory",ideas:["public key","factoring hardness","modular exponentiation"],t:"Rivest–Shamir–Adleman (1977)"},

  // ---- Linear algebra: vectors, matrices, transformations ----
  {c:"Vectors & vector spaces",url:"055-vectors-vector-spaces/",cat:"linalg",cl:"Linear Algebra",ideas:["span","basis","dimension"],t:"Axioms of a vector space"},
  {c:"Matrix operations",url:"056-matrix-operations/",cat:"linalg",cl:"Linear Algebra",ideas:["multiplication","transpose","inverse"],t:"Non-commutative algebra"},
  {c:"Determinants",url:"057-determinants/",cat:"linalg",cl:"Linear Algebra",ideas:["cofactor expansion","volume scaling","singularity"],t:"Leibniz · Cramer"},
  {c:"Gaussian elimination",url:"058-gaussian-elimination/",cat:"linalg",cl:"Linear Algebra",ideas:["row reduction","RREF","pivot"],t:"Gauss · LU decomposition"},
  {c:"Eigenvalues & eigenvectors",url:"059-eigenvalues-eigenvectors/",cat:"linalg",cl:"Linear Algebra",ideas:["characteristic polynomial","diagonalization","spectrum"],t:"Hilbert · spectral theory"},
  {c:"Linear transformations",url:"060-linear-transformations/",cat:"linalg",cl:"Linear Algebra",ideas:["matrix as map","kernel / image","change of basis"],t:"Homomorphisms of vector spaces"},
  {c:"Inner product spaces",url:"061-inner-product-spaces/",cat:"linalg",cl:"Linear Algebra",ideas:["dot product","norm","angle"],t:"Cauchy–Schwarz inequality"},
  {c:"Orthogonality & projections",url:"062-orthogonality-projections/",cat:"linalg",cl:"Linear Algebra",ideas:["Gram–Schmidt","orthonormal basis","least squares"],t:"QR decomposition"},
  {c:"Singular value decomposition",url:"063-singular-value-decomposition/",cat:"linalg",cl:"Linear Algebra",ideas:["SVD","rank","low-rank approximation"],t:"Eckart–Young theorem"},
  {c:"Rank & null space",url:"064-rank-null-space/",cat:"linalg",cl:"Linear Algebra",ideas:["rank-nullity","solvability","column space"],t:"Rank-nullity theorem"},

  // ---- Calculus & analysis: change, limits and the infinite ----
  {c:"Limits & continuity",url:"065-limits-continuity/",cat:"calc",cl:"Calculus & Analysis",ideas:["ε–δ definition","one-sided limits","asymptotes"],t:"Cauchy · Weierstrass"},
  {c:"Derivatives",url:"066-derivatives/",cat:"calc",cl:"Calculus & Analysis",ideas:["rate of change","tangent line","differentiation"],t:"Newton & Leibniz (1660s–70s)"},
  {c:"Rules of differentiation",url:"067-rules-of-differentiation/",cat:"calc",cl:"Calculus & Analysis",ideas:["product","quotient","chain rule"],t:"Leibniz notation"},
  {c:"Applications of derivatives",url:"068-applications-of-derivatives/",cat:"calc",cl:"Calculus & Analysis",ideas:["optimization","related rates","curve sketching"],t:"Extrema · Fermat's theorem"},
  {c:"Integrals",url:"069-integrals/",cat:"calc",cl:"Calculus & Analysis",ideas:["antiderivative","area under curve","Riemann sum"],t:"Riemann integral"},
  {c:"Fundamental theorem of calculus",url:"070-fundamental-theorem-of-calculus/",cat:"calc",cl:"Calculus & Analysis",ideas:["differentiation ↔ integration","net change"],t:"Newton–Leibniz theorem"},
  {c:"Techniques of integration",url:"071-techniques-of-integration/",cat:"calc",cl:"Calculus & Analysis",ideas:["substitution","by parts","partial fractions"],t:"Symbolic integration"},
  {c:"Convergence of series",url:"072-convergence-of-series/",cat:"calc",cl:"Calculus & Analysis",ideas:["ratio test","power series","radius of convergence"],t:"Cauchy convergence criterion"},
  {c:"Taylor & Maclaurin series",url:"073-taylor-maclaurin-series/",cat:"calc",cl:"Calculus & Analysis",ideas:["polynomial approximation","remainder","analytic functions"],t:"Brook Taylor (1715)"},
  {c:"Multivariable calculus",url:"074-multivariable-calculus/",cat:"calc",cl:"Calculus & Analysis",ideas:["functions of several variables","double / triple integrals"],t:"Fubini's theorem"},
  {c:"Partial derivatives & gradients",url:"075-partial-derivatives-gradients/",cat:"calc",cl:"Calculus & Analysis",ideas:["∂/∂x","gradient","directional derivative"],t:"Steepest ascent"},
  {c:"Vector calculus",url:"076-vector-calculus/",cat:"calc",cl:"Calculus & Analysis",ideas:["divergence","curl","Green / Stokes / Gauss"],t:"Maxwell · electromagnetism"},

  // ---- Probability: modelling uncertainty ----
  {c:"Sample spaces & events",url:"077-sample-spaces-events/",cat:"prob",cl:"Probability",ideas:["outcomes","union / intersection","complement"],t:"Kolmogorov axioms (1933)"},
  {c:"Probability rules",url:"078-probability-rules/",cat:"prob",cl:"Probability",ideas:["addition rule","multiplication rule","independence"],t:"Pascal & Fermat correspondence"},
  {c:"Conditional probability",url:"079-conditional-probability/",cat:"prob",cl:"Probability",ideas:["P(A|B)","dependence","tree diagrams"],t:"Conditioning"},
  {c:"Bayes' theorem",url:"080-bayes-theorem/",cat:"prob",cl:"Probability",ideas:["prior / posterior","likelihood","updating"],t:"Thomas Bayes (1763)"},
  {c:"Random variables",url:"081-random-variables/",cat:"prob",cl:"Probability",ideas:["discrete / continuous","PMF / PDF","CDF"],t:"Measurable functions"},
  {c:"Discrete distributions",url:"082-discrete-distributions/",cat:"prob",cl:"Probability",ideas:["binomial","Poisson","geometric"],t:"Bernoulli trials"},
  {c:"Continuous distributions",url:"083-continuous-distributions/",cat:"prob",cl:"Probability",ideas:["normal","uniform","exponential"],t:"Gaussian / bell curve"},
  {c:"Expectation & variance",url:"084-expectation-variance/",cat:"prob",cl:"Probability",ideas:["mean","spread","moments"],t:"Linearity of expectation"},
  {c:"Law of large numbers",url:"085-law-of-large-numbers/",cat:"prob",cl:"Probability",ideas:["sample mean → expectation","weak / strong"],t:"Bernoulli (1713)"},
  {c:"Central limit theorem",url:"086-central-limit-theorem/",cat:"prob",cl:"Probability",ideas:["sums → normal","standardization"],t:"de Moivre–Laplace · Lyapunov"},
  {c:"Markov chains",url:"087-markov-chains/",cat:"prob",cl:"Probability",ideas:["states","transition matrix","stationary distribution"],t:"Andrey Markov (1906)"},
  {c:"Stochastic processes",url:"088-stochastic-processes/",cat:"prob",cl:"Probability",ideas:["random walk","Brownian motion","martingales"],t:"Wiener process"},

  // ---- Statistics: learning from data ----
  {c:"Descriptive statistics",url:"089-descriptive-statistics/",cat:"stat",cl:"Statistics",ideas:["mean / median / mode","variance","quartiles"],t:"Summary statistics"},
  {c:"Data visualization",url:"090-data-visualization/",cat:"stat",cl:"Statistics",ideas:["histogram","box plot","scatter plot"],t:"Tukey · Playfair"},
  {c:"Sampling & estimation",url:"091-sampling-estimation/",cat:"stat",cl:"Statistics",ideas:["estimators","bias","standard error"],t:"Maximum likelihood (Fisher)"},
  {c:"Confidence intervals",url:"092-confidence-intervals/",cat:"stat",cl:"Statistics",ideas:["margin of error","coverage","t / z intervals"],t:"Neyman (1937)"},
  {c:"Hypothesis testing",url:"093-hypothesis-testing/",cat:"stat",cl:"Statistics",ideas:["null / alternative","p-value","type I / II error"],t:"Fisher · Neyman–Pearson"},
  {c:"Correlation & regression",url:"094-correlation-regression/",cat:"stat",cl:"Statistics",ideas:["least squares","coefficient r","residuals"],t:"Galton · Pearson"},
  {c:"Analysis of variance (ANOVA)",url:"095-analysis-of-variance/",cat:"stat",cl:"Statistics",ideas:["F-test","between / within groups"],t:"Fisher (1920s)"},
  {c:"Bayesian inference",url:"096-bayesian-inference/",cat:"stat",cl:"Statistics",ideas:["posterior","priors","MCMC"],t:"Bayesian statistics"},
  {c:"Time series analysis",url:"097-time-series-analysis/",cat:"stat",cl:"Statistics",ideas:["trend / seasonality","ARIMA","autocorrelation"],t:"Box–Jenkins method"},

  // ---- Discrete mathematics: countable structures ----
  {c:"Logic & propositions",url:"098-logic-propositions/",cat:"disc",cl:"Discrete Math",ideas:["truth tables","connectives","implication"],t:"Boolean logic"},
  {c:"Set theory (basics)",url:"099-set-theory/",cat:"disc",cl:"Discrete Math",ideas:["union / intersection","subsets","power set"],t:"Cantor · Venn diagrams"},
  {c:"Relations & functions",url:"100-relations-functions/",cat:"disc",cl:"Discrete Math",ideas:["reflexive / symmetric / transitive","equivalence","ordering"],t:"Binary relations"},
  {c:"Mathematical induction",url:"101-mathematical-induction/",cat:"disc",cl:"Discrete Math",ideas:["base case","inductive step","strong induction"],t:"Pascal · Peano"},
  {c:"Recurrence relations",url:"102-recurrence-relations/",cat:"disc",cl:"Discrete Math",ideas:["Fibonacci","characteristic equation","master theorem"],t:"Difference equations"},
  {c:"Graph theory",url:"103-graph-theory/",cat:"disc",cl:"Discrete Math",ideas:["vertices / edges","paths","Euler / Hamilton"],t:"Euler · Königsberg bridges (1736)"},
  {c:"Trees",url:"104-trees/",cat:"disc",cl:"Discrete Math",ideas:["spanning tree","rooted tree","traversal"],t:"Cayley's formula"},
  {c:"Boolean algebra",url:"105-boolean-algebra/",cat:"disc",cl:"Discrete Math",ideas:["AND / OR / NOT","De Morgan","minimization"],t:"George Boole (1854)"},

  // ---- Combinatorics: counting and arrangement ----
  {c:"Permutations & combinations",url:"106-permutations-combinations/",cat:"comb",cl:"Combinatorics",ideas:["nPr","nCr","factorials"],t:"Counting principle"},
  {c:"Pigeonhole principle",url:"107-pigeonhole-principle/",cat:"comb",cl:"Combinatorics",ideas:["counting argument","existence proofs"],t:"Dirichlet (1834)"},
  {c:"Inclusion–exclusion",url:"108-inclusion-exclusion/",cat:"comb",cl:"Combinatorics",ideas:["overlapping sets","alternating sum"],t:"de Moivre · Sylvester"},
  {c:"Generating functions",url:"109-generating-functions/",cat:"comb",cl:"Combinatorics",ideas:["formal power series","coefficient extraction"],t:"Euler · Wilf (generatingfunctionology)"},
  {c:"Ramsey theory",url:"110-ramsey-theory/",cat:"comb",cl:"Combinatorics",ideas:["unavoidable structure","party problem"],t:"Frank Ramsey (1930)"},
  {c:"Integer partitions",url:"111-integer-partitions/",cat:"comb",cl:"Combinatorics",ideas:["partition function","Young diagrams"],t:"Euler · Hardy–Ramanujan"},

  // ---- Set theory & logic: the foundations of reasoning ----
  {c:"Propositional logic",url:"112-propositional-logic/",cat:"logic",cl:"Logic & Set Theory",ideas:["well-formed formulas","tautology","inference rules"],t:"Frege · Boole"},
  {c:"Predicate logic",url:"113-predicate-logic/",cat:"logic",cl:"Logic & Set Theory",ideas:["quantifiers ∀ ∃","predicates","first-order"],t:"Frege's Begriffsschrift (1879)"},
  {c:"Naive set theory",url:"114-naive-set-theory/",cat:"logic",cl:"Logic & Set Theory",ideas:["membership","Russell's paradox","operations"],t:"Cantor · Russell (1901)"},
  {c:"Cardinality & infinity",url:"115-cardinality-infinity/",cat:"logic",cl:"Logic & Set Theory",ideas:["countable / uncountable","diagonal argument","ℵ₀"],t:"Cantor's theorem"},
  {c:"Axiomatic set theory (ZFC)",url:"116-axiomatic-set-theory/",cat:"logic",cl:"Logic & Set Theory",ideas:["axioms","axiom of choice","well-ordering"],t:"Zermelo–Fraenkel"},
  {c:"Gödel's incompleteness theorems",url:"117-godel-s-incompleteness-theorems/",cat:"logic",cl:"Logic & Set Theory",ideas:["unprovable truths","self-reference","consistency"],t:"Kurt Gödel (1931)"},
  {c:"Model theory",url:"118-model-theory/",cat:"logic",cl:"Logic & Set Theory",ideas:["structures","satisfaction","compactness"],t:"Tarski · Löwenheim–Skolem"},
  {c:"Proof theory",url:"119-proof-theory/",cat:"logic",cl:"Logic & Set Theory",ideas:["formal proofs","natural deduction","cut elimination"],t:"Gentzen · Hilbert's program"},

  // ---- Abstract algebra: groups, rings and fields ----
  {c:"Groups",url:"120-groups/",cat:"abalg",cl:"Abstract Algebra",ideas:["closure / identity / inverse","subgroups","Lagrange"],t:"Galois · Cayley"},
  {c:"Rings",url:"121-rings/",cat:"abalg",cl:"Abstract Algebra",ideas:["addition & multiplication","ideals","integral domains"],t:"Dedekind · Noether"},
  {c:"Fields",url:"122-fields/",cat:"abalg",cl:"Abstract Algebra",ideas:["division","field extensions","finite fields"],t:"Galois fields GF(p)"},
  {c:"Homomorphisms",url:"123-homomorphisms/",cat:"abalg",cl:"Abstract Algebra",ideas:["structure-preserving maps","kernel","isomorphism"],t:"First isomorphism theorem"},
  {c:"Group actions",url:"124-group-actions/",cat:"abalg",cl:"Abstract Algebra",ideas:["orbits","stabilizers","Burnside"],t:"Orbit–stabilizer theorem"},
  {c:"Galois theory",url:"125-galois-theory/",cat:"abalg",cl:"Abstract Algebra",ideas:["solvability by radicals","field automorphisms","quintic"],t:"Évariste Galois (1832)"},
  {c:"Modules",url:"126-modules/",cat:"abalg",cl:"Abstract Algebra",ideas:["generalized vector spaces","over a ring"],t:"Noether · homological algebra"},
  {c:"Representation theory",url:"127-representation-theory/",cat:"abalg",cl:"Abstract Algebra",ideas:["groups as matrices","characters","irreducibles"],t:"Frobenius · Schur"},

  // ---- Topology: continuity, shape without distance ----
  {c:"Metric spaces",url:"128-metric-spaces/",cat:"topo",cl:"Topology",ideas:["distance function","open balls","completeness"],t:"Fréchet (1906)"},
  {c:"Open & closed sets",url:"129-open-closed-sets/",cat:"topo",cl:"Topology",ideas:["topology axioms","neighborhoods","interior / closure"],t:"Hausdorff (1914)"},
  {c:"Continuity (topological)",url:"130-continuity/",cat:"topo",cl:"Topology",ideas:["preimage of open sets","homeomorphism-invariant"],t:"General topology"},
  {c:"Compactness",url:"131-compactness/",cat:"topo",cl:"Topology",ideas:["open cover","Heine–Borel","sequential compactness"],t:"Heine–Borel theorem"},
  {c:"Connectedness",url:"132-connectedness/",cat:"topo",cl:"Topology",ideas:["path-connected","components","intermediate value"],t:"Connected spaces"},
  {c:"Homeomorphisms",url:"133-homeomorphisms/",cat:"topo",cl:"Topology",ideas:["topological equivalence","invariants","'coffee cup = donut'"],t:"Rubber-sheet geometry"},
  {c:"Homotopy & fundamental group",url:"134-homotopy-fundamental-group/",cat:"topo",cl:"Topology",ideas:["loops","π₁","deformation"],t:"Poincaré (1895)"},
  {c:"Homology",url:"135-homology/",cat:"topo",cl:"Topology",ideas:["holes","chains / cycles","Betti numbers"],t:"Algebraic topology"},

  // ---- Differential equations: laws of change ----
  {c:"First-order ODEs",url:"136-first-order-odes/",cat:"diffeq",cl:"Differential Equations",ideas:["separable","integrating factor","slope fields"],t:"Newton · Leibniz"},
  {c:"Second-order linear ODEs",url:"137-second-order-linear-odes/",cat:"diffeq",cl:"Differential Equations",ideas:["homogeneous","characteristic roots","resonance"],t:"Euler · harmonic oscillator"},
  {c:"Systems of ODEs",url:"138-systems-of-odes/",cat:"diffeq",cl:"Differential Equations",ideas:["phase plane","stability","eigenvalues"],t:"Poincaré · dynamical systems"},
  {c:"Laplace transforms",url:"139-laplace-transforms/",cat:"diffeq",cl:"Differential Equations",ideas:["s-domain","initial value problems","transfer functions"],t:"Pierre-Simon Laplace"},
  {c:"Fourier series",url:"140-fourier-series/",cat:"diffeq",cl:"Differential Equations",ideas:["periodic decomposition","harmonics","convergence"],t:"Joseph Fourier (1807)"},
  {c:"Partial differential equations",url:"141-partial-differential-equations/",cat:"diffeq",cl:"Differential Equations",ideas:["heat","wave","Laplace equation"],t:"Mathematical physics"},
  {c:"Numerical methods for ODEs",url:"142-numerical-methods-for-odes/",cat:"diffeq",cl:"Differential Equations",ideas:["Euler method","Runge–Kutta","stiffness"],t:"Runge–Kutta (1900s)"},

  // ---- Complex analysis: calculus over ℂ ----
  {c:"Complex numbers & the plane",url:"143-complex-numbers-the-plane/",cat:"complex",cl:"Complex Analysis",ideas:["real / imaginary","Argand diagram","i²=−1"],t:"Gauss · Argand"},
  {c:"Analytic functions",url:"144-analytic-functions/",cat:"complex",cl:"Complex Analysis",ideas:["holomorphic","power series","differentiability"],t:"Cauchy · Riemann"},
  {c:"Cauchy–Riemann equations",url:"145-cauchy-riemann-equations/",cat:"complex",cl:"Complex Analysis",ideas:["partial derivatives","harmonic conjugate"],t:"Condition for holomorphy"},
  {c:"Contour integration",url:"146-contour-integration/",cat:"complex",cl:"Complex Analysis",ideas:["path integrals","parametrization"],t:"Line integrals in ℂ"},
  {c:"Cauchy's integral theorem",url:"147-cauchy-s-integral-theorem/",cat:"complex",cl:"Complex Analysis",ideas:["closed contours","integral formula","analyticity"],t:"Augustin-Louis Cauchy"},
  {c:"Residue theorem",url:"148-residue-theorem/",cat:"complex",cl:"Complex Analysis",ideas:["poles","residues","real integrals"],t:"Cauchy's residue calculus"},
  {c:"Conformal mappings",url:"149-conformal-mappings/",cat:"complex",cl:"Complex Analysis",ideas:["angle-preserving","Möbius transforms","Riemann mapping"],t:"Riemann mapping theorem"},

  // ---- Numerical analysis: computation with real numbers ----
  {c:"Floating-point arithmetic",url:"150-floating-point-arithmetic/",cat:"numer",cl:"Numerical Analysis",ideas:["IEEE 754","rounding error","machine epsilon"],t:"IEEE 754 standard"},
  {c:"Root finding",url:"151-root-finding/",cat:"numer",cl:"Numerical Analysis",ideas:["bisection","Newton's method","secant"],t:"Newton–Raphson"},
  {c:"Interpolation",url:"152-interpolation/",cat:"numer",cl:"Numerical Analysis",ideas:["Lagrange","splines","polynomial fit"],t:"Lagrange / Newton interpolation"},
  {c:"Numerical integration",url:"153-numerical-integration/",cat:"numer",cl:"Numerical Analysis",ideas:["trapezoidal","Simpson's rule","quadrature"],t:"Newton–Cotes formulas"},
  {c:"Numerical linear algebra",url:"154-numerical-linear-algebra/",cat:"numer",cl:"Numerical Analysis",ideas:["LU / QR","iterative solvers","conditioning"],t:"Householder · Wilkinson"},
  {c:"Finite difference methods",url:"155-finite-difference-methods/",cat:"numer",cl:"Numerical Analysis",ideas:["discretization","stencils","stability"],t:"PDE discretization"},
  {c:"Error analysis",url:"156-error-analysis/",cat:"numer",cl:"Numerical Analysis",ideas:["truncation","round-off","convergence order"],t:"Stability & conditioning"},

  // ---- Optimization: finding the best solution ----
  {c:"Linear programming",url:"157-linear-programming/",cat:"opt",cl:"Optimization",ideas:["objective function","constraints","feasible region"],t:"Dantzig (1947)"},
  {c:"Simplex method",url:"158-simplex-method/",cat:"opt",cl:"Optimization",ideas:["vertices","pivoting","duality"],t:"George Dantzig"},
  {c:"Convex optimization",url:"159-convex-optimization/",cat:"opt",cl:"Optimization",ideas:["convex sets","global optimum","KKT conditions"],t:"Boyd & Vandenberghe"},
  {c:"Gradient descent",url:"160-gradient-descent/",cat:"opt",cl:"Optimization",ideas:["step size","local minima","stochastic GD"],t:"Cauchy (1847)"},
  {c:"Lagrange multipliers",url:"161-lagrange-multipliers/",cat:"opt",cl:"Optimization",ideas:["constrained optimization","gradients parallel"],t:"Joseph-Louis Lagrange"},
  {c:"Integer programming",url:"162-integer-programming/",cat:"opt",cl:"Optimization",ideas:["discrete variables","branch and bound","NP-hard"],t:"Combinatorial optimization"},
  {c:"Dynamic programming",url:"163-dynamic-programming/",cat:"opt",cl:"Optimization",ideas:["optimal substructure","Bellman equation","memoization"],t:"Richard Bellman (1953)"},

  // ---- Category theory: the mathematics of structure ----
  {c:"Categories & morphisms",url:"164-categories-morphisms/",cat:"cat",cl:"Category Theory",ideas:["objects","arrows","composition"],t:"Eilenberg & Mac Lane (1945)"},
  {c:"Functors",url:"165-functors/",cat:"cat",cl:"Category Theory",ideas:["structure-preserving maps","covariant / contravariant"],t:"Functoriality"},
  {c:"Natural transformations",url:"166-natural-transformations/",cat:"cat",cl:"Category Theory",ideas:["morphisms of functors","naturality square"],t:"Mac Lane"},
  {c:"Limits & colimits",url:"167-limits-colimits/",cat:"cat",cl:"Category Theory",ideas:["products","coproducts","pullbacks"],t:"Universal properties"},
  {c:"Adjunctions",url:"168-adjunctions/",cat:"cat",cl:"Category Theory",ideas:["left / right adjoint","unit / counit","free–forgetful"],t:"Kan (1958)"},
  {c:"Monads (categorical)",url:"169-monads/",cat:"cat",cl:"Category Theory",ideas:["endofunctor","unit / join","Kleisli category"],t:"Godement · Moggi"},
  {c:"Yoneda lemma",url:"170-yoneda-lemma/",cat:"cat",cl:"Category Theory",ideas:["representable functors","embedding","naturality"],t:"Nobuo Yoneda"},

  // ---- Foundations: what mathematics is built on ----
  {c:"Mathematical proof",url:"171-mathematical-proof/",cat:"found",cl:"Foundations",ideas:["direct","contradiction","contrapositive"],t:"Deductive reasoning"},
  {c:"Axioms & definitions",url:"172-axioms-definitions/",cat:"found",cl:"Foundations",ideas:["primitive notions","postulates","rigor"],t:"Hilbert's axiomatic method"},
  {c:"Functions & mappings",url:"173-functions-mappings/",cat:"found",cl:"Foundations",ideas:["injective / surjective / bijective","composition","inverse"],t:"Set-theoretic functions"},
  {c:"Equivalence relations",url:"174-equivalence-relations/",cat:"found",cl:"Foundations",ideas:["partitions","equivalence classes","quotients"],t:"Classification by equivalence"},
  {c:"Cardinal & ordinal numbers",url:"175-cardinal-ordinal-numbers/",cat:"found",cl:"Foundations",ideas:["transfinite numbers","well-ordering","ℵ and ω"],t:"Cantor's set theory"},
  {c:"Computability & Turing machines",url:"176-computability-turing-machines/",cat:"found",cl:"Foundations",ideas:["decidability","halting problem","Church–Turing"],t:"Turing · Church (1936)"},
  {c:"Lambda calculus",url:"177-lambda-calculus/",cat:"found",cl:"Foundations",ideas:["abstraction","application","β-reduction"],t:"Alonzo Church (1936)"},
];

// Maps a field key to its badge color class (defined in math.css).
const catClass = {
  arith:"cat-arith", alg:"cat-alg", geom:"cat-geom", trig:"cat-trig", nt:"cat-nt",
  linalg:"cat-linalg", calc:"cat-calc", prob:"cat-prob", stat:"cat-stat", disc:"cat-disc",
  comb:"cat-comb", logic:"cat-logic", abalg:"cat-abalg", topo:"cat-topo", diffeq:"cat-diffeq",
  complex:"cat-complex", numer:"cat-numer", opt:"cat-opt", cat:"cat-cat", found:"cat-found",
};

// Session-storage key so the search/filter/scroll position survives navigating
// into a concept and back (mirrors the programming-concepts index behavior).
const STATE_KEY = 'mathematics-index-state';

// Saves the current search box, field filter and scroll position before leaving.
function saveIndexState() {
  sessionStorage.setItem(STATE_KEY, JSON.stringify({
    search: document.getElementById('search').value,
    field: document.getElementById('fieldFilter').value,
    scrollY: window.scrollY,
    pendingRestore: true,
  }));
}

// Reads back saved state exactly once, then clears the pending flag.
function consumeIndexState() {
  const raw = sessionStorage.getItem(STATE_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    if (!state.pendingRestore) return null;
    sessionStorage.removeItem(STATE_KEY);
    return state;
  } catch {
    sessionStorage.removeItem(STATE_KEY);
    return null;
  }
}

// Navigates into a concept folder, preserving the index state for the return trip.
function openConcept(url) {
  saveIndexState();
  location.href = url;
}

// Renders the key-idea keywords of one concept as a row of tags.
function renderIdeas(ideas) {
  return ideas.map(idea => `<span class="idea">${idea}</span>`).join('');
}

// Filters by the search query and field, then rebuilds the table body.
function render() {
  const q = document.getElementById('search').value.toLowerCase();
  const field = document.getElementById('fieldFilter').value;
  let rows = DATA;
  if (field) rows = rows.filter(d => d.cat === field);
  if (q) rows = rows.filter(d => (d.c + d.t + d.cl + d.ideas.join(' ')).toLowerCase().includes(q));
  document.getElementById('count').textContent = rows.length + ' concepts';
  document.getElementById('noResults').style.display = rows.length ? 'none' : 'block';
  document.getElementById('tbody').innerHTML = rows.map((d, i) => `
    <tr${d.url ? ` class="clickable" onclick="openConcept('${d.url}')"` : ''}>
      <td><span class="idx">${i + 1}</span></td>
      <td><div class="concept">${d.url ? `<a href="${d.url}" onclick="event.stopPropagation(); saveIndexState();">${d.c}</a>` : d.c}</div><span class="cat ${catClass[d.cat]}">${d.cl}</span></td>
      <td><div class="ideas">${renderIdeas(d.ideas)}</div></td>
      <td><span class="origin">${d.t}</span></td>
    </tr>`).join('');
}

// Keep manual control of scroll restoration so we can restore it ourselves.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const savedState = consumeIndexState();
if (savedState) {
  document.getElementById('search').value = savedState.search || '';
  document.getElementById('fieldFilter').value = savedState.field || '';
}

document.getElementById('search').addEventListener('input', render);
document.getElementById('fieldFilter').addEventListener('change', render);
render();

if (savedState) {
  requestAnimationFrame(() => {
    window.scrollTo({ top: savedState.scrollY || 0, behavior: 'auto' });
  });
}
