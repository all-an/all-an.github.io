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
  {c:"Integers & negative numbers",cat:"arith",cl:"Arithmetic",ideas:["sign","number line","absolute value"],t:"Brahmagupta (628 CE)"},
  {c:"Addition & subtraction",cat:"arith",cl:"Arithmetic",ideas:["sum","difference","carry / borrow"],t:"Commutative & associative laws"},
  {c:"Multiplication & division",cat:"arith",cl:"Arithmetic",ideas:["product","quotient","remainder"],t:"Distributive law · long division"},
  {c:"Fractions & rational numbers",cat:"arith",cl:"Arithmetic",ideas:["numerator","denominator","equivalence"],t:"Field of rationals ℚ"},
  {c:"Decimals & place value",cat:"arith",cl:"Arithmetic",ideas:["decimal point","rounding","repeating decimals"],t:"Positional notation (Stevin 1585)"},
  {c:"Percentages & ratios",cat:"arith",cl:"Arithmetic",ideas:["proportion","rate","scaling"],t:"Per centum · cross-multiplication"},
  {c:"Exponents & powers",cat:"arith",cl:"Arithmetic",ideas:["base","exponent","power laws"],t:"Repeated multiplication"},
  {c:"Roots & radicals",cat:"arith",cl:"Arithmetic",ideas:["square root","nth root","irrationals"],t:"Pythagoreans · √2 irrationality"},
  {c:"Order of operations",cat:"arith",cl:"Arithmetic",ideas:["PEMDAS","precedence","grouping"],t:"Operator precedence convention"},
  {c:"Prime factorization",cat:"arith",cl:"Arithmetic",ideas:["primes","factor tree","unique factorization"],t:"Fundamental theorem of arithmetic"},
  {c:"GCD & LCM",cat:"arith",cl:"Arithmetic",ideas:["common divisor","common multiple"],t:"Euclid's Elements (Book VII)"},

  // ---- Algebra: symbols, equations and structure ----
  {c:"Variables & expressions",cat:"alg",cl:"Algebra",ideas:["unknowns","terms","substitution"],t:"al-Khwārizmī (820 CE)"},
  {c:"Linear equations",cat:"alg",cl:"Algebra",ideas:["slope-intercept","solving for x","graphing"],t:"First-degree equations"},
  {c:"Systems of linear equations",cat:"alg",cl:"Algebra",ideas:["substitution","elimination","intersection"],t:"Cramer's rule · Gaussian elimination"},
  {c:"Quadratic equations",cat:"alg",cl:"Algebra",ideas:["quadratic formula","discriminant","parabola"],t:"Completing the square (Babylonians)"},
  {c:"Polynomials",cat:"alg",cl:"Algebra",ideas:["degree","coefficients","roots"],t:"Fundamental theorem of algebra (Gauss)"},
  {c:"Factoring",cat:"alg",cl:"Algebra",ideas:["common factor","grouping","difference of squares"],t:"Reverse distribution"},
  {c:"Inequalities",cat:"alg",cl:"Algebra",ideas:["<, >, ≤, ≥","intervals","sign analysis"],t:"Order relations on ℝ"},
  {c:"Functions & relations",cat:"alg",cl:"Algebra",ideas:["domain","range","mapping"],t:"Dirichlet / Euler function concept"},
  {c:"Exponential & logarithmic functions",cat:"alg",cl:"Algebra",ideas:["growth / decay","log laws","base e"],t:"Napier · Euler's number e"},
  {c:"Sequences & series",cat:"alg",cl:"Algebra",ideas:["arithmetic","geometric","summation"],t:"Gauss summation · Σ notation"},
  {c:"Binomial theorem",cat:"alg",cl:"Algebra",ideas:["expansion","Pascal's triangle","coefficients"],t:"Newton's generalized binomial"},
  {c:"Matrices (introduction)",cat:"alg",cl:"Algebra",ideas:["array","operations","systems"],t:"Cayley · Sylvester (1850s)"},

  // ---- Geometry: shape, space and measurement ----
  {c:"Points, lines & planes",cat:"geom",cl:"Geometry",ideas:["dimension","incidence","postulates"],t:"Euclid's Elements (300 BCE)"},
  {c:"Angles",cat:"geom",cl:"Geometry",ideas:["degrees / radians","complementary","supplementary"],t:"Angle measure"},
  {c:"Triangles & congruence",cat:"geom",cl:"Geometry",ideas:["SSS / SAS / ASA","angle sum","types"],t:"Euclidean congruence axioms"},
  {c:"Similarity",cat:"geom",cl:"Geometry",ideas:["scale factor","proportional sides","AA"],t:"Thales' theorem"},
  {c:"Circles",cat:"geom",cl:"Geometry",ideas:["radius","chord","arc / sector"],t:"π · inscribed angle theorem"},
  {c:"Polygons",cat:"geom",cl:"Geometry",ideas:["interior angles","regular polygons","tessellation"],t:"Angle-sum (n−2)·180°"},
  {c:"Perimeter, area & volume",cat:"geom",cl:"Geometry",ideas:["measurement","formulas","units"],t:"Mensuration"},
  {c:"Pythagorean theorem",cat:"geom",cl:"Geometry",ideas:["a²+b²=c²","right triangle","distance"],t:"Pythagoras (570 BCE)"},
  {c:"Coordinate geometry",cat:"geom",cl:"Geometry",ideas:["Cartesian plane","distance / midpoint","slope"],t:"Descartes (1637) · analytic geometry"},
  {c:"Transformations & symmetry",cat:"geom",cl:"Geometry",ideas:["translation","rotation","reflection"],t:"Klein's Erlangen program"},
  {c:"Vectors (geometric)",cat:"geom",cl:"Geometry",ideas:["magnitude","direction","components"],t:"Hamilton · Grassmann"},
  {c:"Conic sections",cat:"geom",cl:"Geometry",ideas:["ellipse","parabola","hyperbola"],t:"Apollonius of Perga"},

  // ---- Trigonometry: angles and periodic functions ----
  {c:"Right-triangle trigonometry",cat:"trig",cl:"Trigonometry",ideas:["sine","cosine","tangent · SOH-CAH-TOA"],t:"Hipparchus · chord tables"},
  {c:"Unit circle",cat:"trig",cl:"Trigonometry",ideas:["radians","reference angle","quadrants"],t:"Circle of radius 1"},
  {c:"Trigonometric functions",cat:"trig",cl:"Trigonometry",ideas:["periodicity","amplitude","phase"],t:"Periodic waveforms"},
  {c:"Trigonometric identities",cat:"trig",cl:"Trigonometry",ideas:["Pythagorean","angle sum","double angle"],t:"sin²+cos²=1"},
  {c:"Law of sines & cosines",cat:"trig",cl:"Trigonometry",ideas:["oblique triangles","solving triangles"],t:"Generalized Pythagorean theorem"},
  {c:"Inverse trig functions",cat:"trig",cl:"Trigonometry",ideas:["arcsin","arccos","arctan"],t:"Restricted-domain inverses"},
  {c:"Polar coordinates",cat:"trig",cl:"Trigonometry",ideas:["r, θ","polar curves","conversion"],t:"Newton · Bernoulli"},
  {c:"Complex numbers (polar form)",cat:"trig",cl:"Trigonometry",ideas:["modulus / argument","De Moivre","roots of unity"],t:"Euler's formula e^{iθ}"},

  // ---- Number theory: properties of the integers ----
  {c:"Divisibility",cat:"nt",cl:"Number Theory",ideas:["divisors","divisibility rules","parity"],t:"Elementary number theory"},
  {c:"Prime numbers",cat:"nt",cl:"Number Theory",ideas:["sieve of Eratosthenes","infinitude","distribution"],t:"Euclid · prime number theorem"},
  {c:"Modular arithmetic",cat:"nt",cl:"Number Theory",ideas:["congruence","clock arithmetic","residues"],t:"Gauss, Disquisitiones (1801)"},
  {c:"Euclidean algorithm",cat:"nt",cl:"Number Theory",ideas:["GCD","Bézout coefficients","extended"],t:"Euclid's Elements"},
  {c:"Diophantine equations",cat:"nt",cl:"Number Theory",ideas:["integer solutions","linear","Pell"],t:"Diophantus of Alexandria"},
  {c:"Fermat's little theorem",cat:"nt",cl:"Number Theory",ideas:["a^p ≡ a","primality","Fermat test"],t:"Fermat (1640)"},
  {c:"Euler's totient function",cat:"nt",cl:"Number Theory",ideas:["φ(n)","Euler's theorem","coprimality"],t:"Euler · generalizes Fermat"},
  {c:"Continued fractions",cat:"nt",cl:"Number Theory",ideas:["convergents","best approximation"],t:"Rational approximation"},
  {c:"Quadratic residues",cat:"nt",cl:"Number Theory",ideas:["Legendre symbol","reciprocity"],t:"Gauss' quadratic reciprocity"},
  {c:"RSA & cryptographic number theory",cat:"nt",cl:"Number Theory",ideas:["public key","factoring hardness","modular exponentiation"],t:"Rivest–Shamir–Adleman (1977)"},

  // ---- Linear algebra: vectors, matrices, transformations ----
  {c:"Vectors & vector spaces",cat:"linalg",cl:"Linear Algebra",ideas:["span","basis","dimension"],t:"Axioms of a vector space"},
  {c:"Matrix operations",cat:"linalg",cl:"Linear Algebra",ideas:["multiplication","transpose","inverse"],t:"Non-commutative algebra"},
  {c:"Determinants",cat:"linalg",cl:"Linear Algebra",ideas:["cofactor expansion","volume scaling","singularity"],t:"Leibniz · Cramer"},
  {c:"Gaussian elimination",cat:"linalg",cl:"Linear Algebra",ideas:["row reduction","RREF","pivot"],t:"Gauss · LU decomposition"},
  {c:"Eigenvalues & eigenvectors",cat:"linalg",cl:"Linear Algebra",ideas:["characteristic polynomial","diagonalization","spectrum"],t:"Hilbert · spectral theory"},
  {c:"Linear transformations",cat:"linalg",cl:"Linear Algebra",ideas:["matrix as map","kernel / image","change of basis"],t:"Homomorphisms of vector spaces"},
  {c:"Inner product spaces",cat:"linalg",cl:"Linear Algebra",ideas:["dot product","norm","angle"],t:"Cauchy–Schwarz inequality"},
  {c:"Orthogonality & projections",cat:"linalg",cl:"Linear Algebra",ideas:["Gram–Schmidt","orthonormal basis","least squares"],t:"QR decomposition"},
  {c:"Singular value decomposition",cat:"linalg",cl:"Linear Algebra",ideas:["SVD","rank","low-rank approximation"],t:"Eckart–Young theorem"},
  {c:"Rank & null space",cat:"linalg",cl:"Linear Algebra",ideas:["rank-nullity","solvability","column space"],t:"Rank-nullity theorem"},

  // ---- Calculus & analysis: change, limits and the infinite ----
  {c:"Limits & continuity",cat:"calc",cl:"Calculus & Analysis",ideas:["ε–δ definition","one-sided limits","asymptotes"],t:"Cauchy · Weierstrass"},
  {c:"Derivatives",cat:"calc",cl:"Calculus & Analysis",ideas:["rate of change","tangent line","differentiation"],t:"Newton & Leibniz (1660s–70s)"},
  {c:"Rules of differentiation",cat:"calc",cl:"Calculus & Analysis",ideas:["product","quotient","chain rule"],t:"Leibniz notation"},
  {c:"Applications of derivatives",cat:"calc",cl:"Calculus & Analysis",ideas:["optimization","related rates","curve sketching"],t:"Extrema · Fermat's theorem"},
  {c:"Integrals",cat:"calc",cl:"Calculus & Analysis",ideas:["antiderivative","area under curve","Riemann sum"],t:"Riemann integral"},
  {c:"Fundamental theorem of calculus",cat:"calc",cl:"Calculus & Analysis",ideas:["differentiation ↔ integration","net change"],t:"Newton–Leibniz theorem"},
  {c:"Techniques of integration",cat:"calc",cl:"Calculus & Analysis",ideas:["substitution","by parts","partial fractions"],t:"Symbolic integration"},
  {c:"Convergence of series",cat:"calc",cl:"Calculus & Analysis",ideas:["ratio test","power series","radius of convergence"],t:"Cauchy convergence criterion"},
  {c:"Taylor & Maclaurin series",cat:"calc",cl:"Calculus & Analysis",ideas:["polynomial approximation","remainder","analytic functions"],t:"Brook Taylor (1715)"},
  {c:"Multivariable calculus",cat:"calc",cl:"Calculus & Analysis",ideas:["functions of several variables","double / triple integrals"],t:"Fubini's theorem"},
  {c:"Partial derivatives & gradients",cat:"calc",cl:"Calculus & Analysis",ideas:["∂/∂x","gradient","directional derivative"],t:"Steepest ascent"},
  {c:"Vector calculus",cat:"calc",cl:"Calculus & Analysis",ideas:["divergence","curl","Green / Stokes / Gauss"],t:"Maxwell · electromagnetism"},

  // ---- Probability: modelling uncertainty ----
  {c:"Sample spaces & events",cat:"prob",cl:"Probability",ideas:["outcomes","union / intersection","complement"],t:"Kolmogorov axioms (1933)"},
  {c:"Probability rules",cat:"prob",cl:"Probability",ideas:["addition rule","multiplication rule","independence"],t:"Pascal & Fermat correspondence"},
  {c:"Conditional probability",cat:"prob",cl:"Probability",ideas:["P(A|B)","dependence","tree diagrams"],t:"Conditioning"},
  {c:"Bayes' theorem",cat:"prob",cl:"Probability",ideas:["prior / posterior","likelihood","updating"],t:"Thomas Bayes (1763)"},
  {c:"Random variables",cat:"prob",cl:"Probability",ideas:["discrete / continuous","PMF / PDF","CDF"],t:"Measurable functions"},
  {c:"Discrete distributions",cat:"prob",cl:"Probability",ideas:["binomial","Poisson","geometric"],t:"Bernoulli trials"},
  {c:"Continuous distributions",cat:"prob",cl:"Probability",ideas:["normal","uniform","exponential"],t:"Gaussian / bell curve"},
  {c:"Expectation & variance",cat:"prob",cl:"Probability",ideas:["mean","spread","moments"],t:"Linearity of expectation"},
  {c:"Law of large numbers",cat:"prob",cl:"Probability",ideas:["sample mean → expectation","weak / strong"],t:"Bernoulli (1713)"},
  {c:"Central limit theorem",cat:"prob",cl:"Probability",ideas:["sums → normal","standardization"],t:"de Moivre–Laplace · Lyapunov"},
  {c:"Markov chains",cat:"prob",cl:"Probability",ideas:["states","transition matrix","stationary distribution"],t:"Andrey Markov (1906)"},
  {c:"Stochastic processes",cat:"prob",cl:"Probability",ideas:["random walk","Brownian motion","martingales"],t:"Wiener process"},

  // ---- Statistics: learning from data ----
  {c:"Descriptive statistics",cat:"stat",cl:"Statistics",ideas:["mean / median / mode","variance","quartiles"],t:"Summary statistics"},
  {c:"Data visualization",cat:"stat",cl:"Statistics",ideas:["histogram","box plot","scatter plot"],t:"Tukey · Playfair"},
  {c:"Sampling & estimation",cat:"stat",cl:"Statistics",ideas:["estimators","bias","standard error"],t:"Maximum likelihood (Fisher)"},
  {c:"Confidence intervals",cat:"stat",cl:"Statistics",ideas:["margin of error","coverage","t / z intervals"],t:"Neyman (1937)"},
  {c:"Hypothesis testing",cat:"stat",cl:"Statistics",ideas:["null / alternative","p-value","type I / II error"],t:"Fisher · Neyman–Pearson"},
  {c:"Correlation & regression",cat:"stat",cl:"Statistics",ideas:["least squares","coefficient r","residuals"],t:"Galton · Pearson"},
  {c:"Analysis of variance (ANOVA)",cat:"stat",cl:"Statistics",ideas:["F-test","between / within groups"],t:"Fisher (1920s)"},
  {c:"Bayesian inference",cat:"stat",cl:"Statistics",ideas:["posterior","priors","MCMC"],t:"Bayesian statistics"},
  {c:"Time series analysis",cat:"stat",cl:"Statistics",ideas:["trend / seasonality","ARIMA","autocorrelation"],t:"Box–Jenkins method"},

  // ---- Discrete mathematics: countable structures ----
  {c:"Logic & propositions",cat:"disc",cl:"Discrete Math",ideas:["truth tables","connectives","implication"],t:"Boolean logic"},
  {c:"Set theory (basics)",cat:"disc",cl:"Discrete Math",ideas:["union / intersection","subsets","power set"],t:"Cantor · Venn diagrams"},
  {c:"Relations & functions",cat:"disc",cl:"Discrete Math",ideas:["reflexive / symmetric / transitive","equivalence","ordering"],t:"Binary relations"},
  {c:"Mathematical induction",cat:"disc",cl:"Discrete Math",ideas:["base case","inductive step","strong induction"],t:"Pascal · Peano"},
  {c:"Recurrence relations",cat:"disc",cl:"Discrete Math",ideas:["Fibonacci","characteristic equation","master theorem"],t:"Difference equations"},
  {c:"Graph theory",cat:"disc",cl:"Discrete Math",ideas:["vertices / edges","paths","Euler / Hamilton"],t:"Euler · Königsberg bridges (1736)"},
  {c:"Trees",cat:"disc",cl:"Discrete Math",ideas:["spanning tree","rooted tree","traversal"],t:"Cayley's formula"},
  {c:"Boolean algebra",cat:"disc",cl:"Discrete Math",ideas:["AND / OR / NOT","De Morgan","minimization"],t:"George Boole (1854)"},

  // ---- Combinatorics: counting and arrangement ----
  {c:"Permutations & combinations",cat:"comb",cl:"Combinatorics",ideas:["nPr","nCr","factorials"],t:"Counting principle"},
  {c:"Pigeonhole principle",cat:"comb",cl:"Combinatorics",ideas:["counting argument","existence proofs"],t:"Dirichlet (1834)"},
  {c:"Inclusion–exclusion",cat:"comb",cl:"Combinatorics",ideas:["overlapping sets","alternating sum"],t:"de Moivre · Sylvester"},
  {c:"Generating functions",cat:"comb",cl:"Combinatorics",ideas:["formal power series","coefficient extraction"],t:"Euler · Wilf (generatingfunctionology)"},
  {c:"Ramsey theory",cat:"comb",cl:"Combinatorics",ideas:["unavoidable structure","party problem"],t:"Frank Ramsey (1930)"},
  {c:"Integer partitions",cat:"comb",cl:"Combinatorics",ideas:["partition function","Young diagrams"],t:"Euler · Hardy–Ramanujan"},

  // ---- Set theory & logic: the foundations of reasoning ----
  {c:"Propositional logic",cat:"logic",cl:"Logic & Set Theory",ideas:["well-formed formulas","tautology","inference rules"],t:"Frege · Boole"},
  {c:"Predicate logic",cat:"logic",cl:"Logic & Set Theory",ideas:["quantifiers ∀ ∃","predicates","first-order"],t:"Frege's Begriffsschrift (1879)"},
  {c:"Naive set theory",cat:"logic",cl:"Logic & Set Theory",ideas:["membership","Russell's paradox","operations"],t:"Cantor · Russell (1901)"},
  {c:"Cardinality & infinity",cat:"logic",cl:"Logic & Set Theory",ideas:["countable / uncountable","diagonal argument","ℵ₀"],t:"Cantor's theorem"},
  {c:"Axiomatic set theory (ZFC)",cat:"logic",cl:"Logic & Set Theory",ideas:["axioms","axiom of choice","well-ordering"],t:"Zermelo–Fraenkel"},
  {c:"Gödel's incompleteness theorems",cat:"logic",cl:"Logic & Set Theory",ideas:["unprovable truths","self-reference","consistency"],t:"Kurt Gödel (1931)"},
  {c:"Model theory",cat:"logic",cl:"Logic & Set Theory",ideas:["structures","satisfaction","compactness"],t:"Tarski · Löwenheim–Skolem"},
  {c:"Proof theory",cat:"logic",cl:"Logic & Set Theory",ideas:["formal proofs","natural deduction","cut elimination"],t:"Gentzen · Hilbert's program"},

  // ---- Abstract algebra: groups, rings and fields ----
  {c:"Groups",cat:"abalg",cl:"Abstract Algebra",ideas:["closure / identity / inverse","subgroups","Lagrange"],t:"Galois · Cayley"},
  {c:"Rings",cat:"abalg",cl:"Abstract Algebra",ideas:["addition & multiplication","ideals","integral domains"],t:"Dedekind · Noether"},
  {c:"Fields",cat:"abalg",cl:"Abstract Algebra",ideas:["division","field extensions","finite fields"],t:"Galois fields GF(p)"},
  {c:"Homomorphisms",cat:"abalg",cl:"Abstract Algebra",ideas:["structure-preserving maps","kernel","isomorphism"],t:"First isomorphism theorem"},
  {c:"Group actions",cat:"abalg",cl:"Abstract Algebra",ideas:["orbits","stabilizers","Burnside"],t:"Orbit–stabilizer theorem"},
  {c:"Galois theory",cat:"abalg",cl:"Abstract Algebra",ideas:["solvability by radicals","field automorphisms","quintic"],t:"Évariste Galois (1832)"},
  {c:"Modules",cat:"abalg",cl:"Abstract Algebra",ideas:["generalized vector spaces","over a ring"],t:"Noether · homological algebra"},
  {c:"Representation theory",cat:"abalg",cl:"Abstract Algebra",ideas:["groups as matrices","characters","irreducibles"],t:"Frobenius · Schur"},

  // ---- Topology: continuity, shape without distance ----
  {c:"Metric spaces",cat:"topo",cl:"Topology",ideas:["distance function","open balls","completeness"],t:"Fréchet (1906)"},
  {c:"Open & closed sets",cat:"topo",cl:"Topology",ideas:["topology axioms","neighborhoods","interior / closure"],t:"Hausdorff (1914)"},
  {c:"Continuity (topological)",cat:"topo",cl:"Topology",ideas:["preimage of open sets","homeomorphism-invariant"],t:"General topology"},
  {c:"Compactness",cat:"topo",cl:"Topology",ideas:["open cover","Heine–Borel","sequential compactness"],t:"Heine–Borel theorem"},
  {c:"Connectedness",cat:"topo",cl:"Topology",ideas:["path-connected","components","intermediate value"],t:"Connected spaces"},
  {c:"Homeomorphisms",cat:"topo",cl:"Topology",ideas:["topological equivalence","invariants","'coffee cup = donut'"],t:"Rubber-sheet geometry"},
  {c:"Homotopy & fundamental group",cat:"topo",cl:"Topology",ideas:["loops","π₁","deformation"],t:"Poincaré (1895)"},
  {c:"Homology",cat:"topo",cl:"Topology",ideas:["holes","chains / cycles","Betti numbers"],t:"Algebraic topology"},

  // ---- Differential equations: laws of change ----
  {c:"First-order ODEs",cat:"diffeq",cl:"Differential Equations",ideas:["separable","integrating factor","slope fields"],t:"Newton · Leibniz"},
  {c:"Second-order linear ODEs",cat:"diffeq",cl:"Differential Equations",ideas:["homogeneous","characteristic roots","resonance"],t:"Euler · harmonic oscillator"},
  {c:"Systems of ODEs",cat:"diffeq",cl:"Differential Equations",ideas:["phase plane","stability","eigenvalues"],t:"Poincaré · dynamical systems"},
  {c:"Laplace transforms",cat:"diffeq",cl:"Differential Equations",ideas:["s-domain","initial value problems","transfer functions"],t:"Pierre-Simon Laplace"},
  {c:"Fourier series",cat:"diffeq",cl:"Differential Equations",ideas:["periodic decomposition","harmonics","convergence"],t:"Joseph Fourier (1807)"},
  {c:"Partial differential equations",cat:"diffeq",cl:"Differential Equations",ideas:["heat","wave","Laplace equation"],t:"Mathematical physics"},
  {c:"Numerical methods for ODEs",cat:"diffeq",cl:"Differential Equations",ideas:["Euler method","Runge–Kutta","stiffness"],t:"Runge–Kutta (1900s)"},

  // ---- Complex analysis: calculus over ℂ ----
  {c:"Complex numbers & the plane",cat:"complex",cl:"Complex Analysis",ideas:["real / imaginary","Argand diagram","i²=−1"],t:"Gauss · Argand"},
  {c:"Analytic functions",cat:"complex",cl:"Complex Analysis",ideas:["holomorphic","power series","differentiability"],t:"Cauchy · Riemann"},
  {c:"Cauchy–Riemann equations",cat:"complex",cl:"Complex Analysis",ideas:["partial derivatives","harmonic conjugate"],t:"Condition for holomorphy"},
  {c:"Contour integration",cat:"complex",cl:"Complex Analysis",ideas:["path integrals","parametrization"],t:"Line integrals in ℂ"},
  {c:"Cauchy's integral theorem",cat:"complex",cl:"Complex Analysis",ideas:["closed contours","integral formula","analyticity"],t:"Augustin-Louis Cauchy"},
  {c:"Residue theorem",cat:"complex",cl:"Complex Analysis",ideas:["poles","residues","real integrals"],t:"Cauchy's residue calculus"},
  {c:"Conformal mappings",cat:"complex",cl:"Complex Analysis",ideas:["angle-preserving","Möbius transforms","Riemann mapping"],t:"Riemann mapping theorem"},

  // ---- Numerical analysis: computation with real numbers ----
  {c:"Floating-point arithmetic",cat:"numer",cl:"Numerical Analysis",ideas:["IEEE 754","rounding error","machine epsilon"],t:"IEEE 754 standard"},
  {c:"Root finding",cat:"numer",cl:"Numerical Analysis",ideas:["bisection","Newton's method","secant"],t:"Newton–Raphson"},
  {c:"Interpolation",cat:"numer",cl:"Numerical Analysis",ideas:["Lagrange","splines","polynomial fit"],t:"Lagrange / Newton interpolation"},
  {c:"Numerical integration",cat:"numer",cl:"Numerical Analysis",ideas:["trapezoidal","Simpson's rule","quadrature"],t:"Newton–Cotes formulas"},
  {c:"Numerical linear algebra",cat:"numer",cl:"Numerical Analysis",ideas:["LU / QR","iterative solvers","conditioning"],t:"Householder · Wilkinson"},
  {c:"Finite difference methods",cat:"numer",cl:"Numerical Analysis",ideas:["discretization","stencils","stability"],t:"PDE discretization"},
  {c:"Error analysis",cat:"numer",cl:"Numerical Analysis",ideas:["truncation","round-off","convergence order"],t:"Stability & conditioning"},

  // ---- Optimization: finding the best solution ----
  {c:"Linear programming",cat:"opt",cl:"Optimization",ideas:["objective function","constraints","feasible region"],t:"Dantzig (1947)"},
  {c:"Simplex method",cat:"opt",cl:"Optimization",ideas:["vertices","pivoting","duality"],t:"George Dantzig"},
  {c:"Convex optimization",cat:"opt",cl:"Optimization",ideas:["convex sets","global optimum","KKT conditions"],t:"Boyd & Vandenberghe"},
  {c:"Gradient descent",cat:"opt",cl:"Optimization",ideas:["step size","local minima","stochastic GD"],t:"Cauchy (1847)"},
  {c:"Lagrange multipliers",cat:"opt",cl:"Optimization",ideas:["constrained optimization","gradients parallel"],t:"Joseph-Louis Lagrange"},
  {c:"Integer programming",cat:"opt",cl:"Optimization",ideas:["discrete variables","branch and bound","NP-hard"],t:"Combinatorial optimization"},
  {c:"Dynamic programming",cat:"opt",cl:"Optimization",ideas:["optimal substructure","Bellman equation","memoization"],t:"Richard Bellman (1953)"},

  // ---- Category theory: the mathematics of structure ----
  {c:"Categories & morphisms",cat:"cat",cl:"Category Theory",ideas:["objects","arrows","composition"],t:"Eilenberg & Mac Lane (1945)"},
  {c:"Functors",cat:"cat",cl:"Category Theory",ideas:["structure-preserving maps","covariant / contravariant"],t:"Functoriality"},
  {c:"Natural transformations",cat:"cat",cl:"Category Theory",ideas:["morphisms of functors","naturality square"],t:"Mac Lane"},
  {c:"Limits & colimits",cat:"cat",cl:"Category Theory",ideas:["products","coproducts","pullbacks"],t:"Universal properties"},
  {c:"Adjunctions",cat:"cat",cl:"Category Theory",ideas:["left / right adjoint","unit / counit","free–forgetful"],t:"Kan (1958)"},
  {c:"Monads (categorical)",cat:"cat",cl:"Category Theory",ideas:["endofunctor","unit / join","Kleisli category"],t:"Godement · Moggi"},
  {c:"Yoneda lemma",cat:"cat",cl:"Category Theory",ideas:["representable functors","embedding","naturality"],t:"Nobuo Yoneda"},

  // ---- Foundations: what mathematics is built on ----
  {c:"Mathematical proof",cat:"found",cl:"Foundations",ideas:["direct","contradiction","contrapositive"],t:"Deductive reasoning"},
  {c:"Axioms & definitions",cat:"found",cl:"Foundations",ideas:["primitive notions","postulates","rigor"],t:"Hilbert's axiomatic method"},
  {c:"Functions & mappings",cat:"found",cl:"Foundations",ideas:["injective / surjective / bijective","composition","inverse"],t:"Set-theoretic functions"},
  {c:"Equivalence relations",cat:"found",cl:"Foundations",ideas:["partitions","equivalence classes","quotients"],t:"Classification by equivalence"},
  {c:"Cardinal & ordinal numbers",cat:"found",cl:"Foundations",ideas:["transfinite numbers","well-ordering","ℵ and ω"],t:"Cantor's set theory"},
  {c:"Computability & Turing machines",cat:"found",cl:"Foundations",ideas:["decidability","halting problem","Church–Turing"],t:"Turing · Church (1936)"},
  {c:"Lambda calculus",cat:"found",cl:"Foundations",ideas:["abstraction","application","β-reduction"],t:"Alonzo Church (1936)"},
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
