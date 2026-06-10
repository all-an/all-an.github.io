// TypeScript
// Runnable version of the "Result / error value" concept snippet.
// Run with Node 23.6+ (it strips the types and runs the JS):
//   ./run.sh            (or: node result.ts)

// A Result is a discriminated union: a success carrying a value, OR a failure
// carrying an error. The literal `ok` field is the tag the compiler narrows on.
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// Tiny constructors so call sites read as ok(x) / err(msg).
const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// parseAge returns a value on success or an error message on failure — the
// failure is an ordinary return value, not a thrown exception or a null.
function parseAge(text: string): Result<number, string> {
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0) return err(`invalid age: '${text}'`);
  return ok(n);
}

// Checking `.ok` narrows the union, so `.value` exists only in the success
// branch and `.error` only in the failure branch — both cases must be handled,
// and the compiler rejects reaching for the wrong field in the wrong branch.
function describe(text: string): string {
  const r = parseAge(text);
  if (r.ok) return `age is ${r.value}`;
  return `error: ${r.error}`;
}

// Three inputs: one valid, one out of range, one not a number.
for (const input of ["42", "-1", "abc"]) {
  console.log(`${input} -> ${describe(input)}`);
}
