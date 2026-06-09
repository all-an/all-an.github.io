// Scala
// Runnable version of the "Monad / chain" concept snippet.
// Run with scala-cli:  ./run.sh   (or: scala-cli run Main.scala)

// parse turns text into a number, or an error message. Either[L, R] is a monad:
// it has flatMap and map, so a failure (Left) short-circuits a chain of steps.
def parse(text: String): Either[String, Int] =
  text.toIntOption.toRight(s"not a number: '$text'")

// divide guards against the divide-by-zero failure case.
def divide(a: Int, b: Int): Either[String, Int] =
  if b == 0 then Left("divide by zero") else Right(a / b)

// Nested flatMap: bind each step to the next. A Left anywhere stops the chain
// and becomes the result — that short-circuiting is the monad doing the work.
def chained(a: String, b: String): Either[String, Int] =
  parse(a).flatMap(x => parse(b).flatMap(y => divide(x, y)))

// The exact same computation as a for-comprehension. The compiler desugars this
// back into the flatMap chain above — identical behavior, linear to read.
def sugared(a: String, b: String): Either[String, Int] =
  for
    x <- parse(a)
    y <- parse(b)
    z <- divide(x, y)
  yield z

@main def run(): Unit =
  // Both styles agree on every input, because they are the same chain. The
  // second and third rows show a Left short-circuiting the remaining steps.
  val cases = List(("84", "2"), ("84", "0"), ("eight", "2"))
  for (a, b) <- cases do
    println(s"($a, $b) -> flatMap: ${chained(a, b)}  |  for: ${sugared(a, b)}")
