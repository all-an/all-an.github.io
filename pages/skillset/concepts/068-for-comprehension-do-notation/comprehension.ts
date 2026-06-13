// TypeScript
// Runnable version of the "For comprehension / do notation" concept snippet.
// Run with Node 23.6+ (it strips the types and runs the JS):
//   ./run.sh            (or: node comprehension.ts)

// For-comprehension (Scala) and do-notation (Haskell) are syntactic sugar over
// monadic flatMap/bind: they let a chain of dependent steps read top-to-bottom
// instead of nesting. JavaScript's async/await is that same sugar specialized to
// one monad — the Promise. `await` IS Promise's flatMap, and the code after it
// is the continuation. This file shows both forms producing the same answer.

// A tiny in-memory "database". Each lookup returns a Promise — the monad we are
// sequencing over. A missing user rejects, which becomes a short-circuit later.
const users: Record<number, string> = { 1: "Ada", 2: "Linus" };
const orders: Record<string, string[]> = { Ada: ["book", "pen"], Linus: ["laptop"] };

// Step 1: id -> name. Rejects when the id is unknown.
function findUser(id: number): Promise<string> {
  const name = users[id];
  return name ? Promise.resolve(name) : Promise.reject(new Error(`no user #${id}`));
}

// Step 2: name -> their orders. Depends on the result of step 1.
function findOrders(name: string): Promise<string[]> {
  return Promise.resolve(orders[name] ?? []);
}

// DO-NOTATION form: each `await` is a monadic bind. The two steps read as plain
// sequential statements, yet `items` depends on `name` from the previous bind.
// A rejection (failed bind) throws here and skips the rest — the same
// short-circuit Scala's `for` and Haskell's `do` give for Option/Either.
async function summarySugar(id: number): Promise<string> {
  const name = await findUser(id);        // bind 1
  const items = await findOrders(name);   // bind 2, depends on bind 1
  return `${name} ordered ${items.join(", ")}`;
}

// DESUGARED form: exactly what async/await compiles to — nested Promise.then,
// which is the Promise monad's flatMap. This is the bind chain the sugar hides.
function summaryDesugared(id: number): Promise<string> {
  return findUser(id).then((name) =>
    findOrders(name).then((items) =>
      `${name} ordered ${items.join(", ")}`));
}

// Run both forms over the same ids. #9 is unknown, so its first bind rejects and
// both forms short-circuit to the error without running step 2.
async function main(): Promise<void> {
  for (const id of [1, 2, 9]) {
    // Promise.allSettled lets us print the failure instead of crashing.
    const [sugar, desugared] = await Promise.allSettled([
      summarySugar(id),
      summaryDesugared(id),
    ]);
    const show = (r: PromiseSettledResult<string>) =>
      r.status === "fulfilled" ? r.value : `error: ${r.reason.message}`;
    // Both columns match, proving async/await is the do-notation for Promises.
    console.log(`#${id}  sugar: ${show(sugar)}  |  desugared: ${show(desugared)}`);
  }
}

main();
