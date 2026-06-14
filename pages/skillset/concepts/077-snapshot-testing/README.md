# Snapshot testing — runnable Jest project

A small **Jest project** because snapshot testing only means something inside a
runner that can serialize a value, store it, and diff against it on the next run.
**Jest** (JavaScript) is the canonical home of the technique.

## Files

| Path | Purpose |
| --- | --- |
| `package.json` | npm project — pulls in Jest, defines the `test` script. |
| `src/formatInvoice.js` | The code under test: renders an invoice to a receipt string. |
| `__tests__/formatInvoice.test.js` | A `toMatchSnapshot` test and a `toMatchInlineSnapshot` test. |
| `__tests__/__snapshots__/formatInvoice.test.js.snap` | The stored "golden" snapshot — **committed to git**. |
| `run.sh` | Installs deps on first run, then runs `npm test`. |
| `index.html` / `style.css` | The concept page. |

`node_modules/` is git-ignored; the `.snap` file is **not** — it is the test's
reference and must be committed.

## Run it (recommended)

```sh
chmod +x run.sh   # make the script executable (only needed once)
./run.sh          # npm install (first run only), then npm test
```

The **first** run downloads Jest into `node_modules` and needs network access;
afterwards it runs offline.

## Run it manually

```sh
npm install   # first run only
npm test
```

## Expected result

Both tests pass because the rendered output matches the committed snapshots:

```
PASS __tests__/formatInvoice.test.js
  formatInvoice
    ✓ renders the receipt the same as the stored snapshot
    ✓ formats a tiny invoice inline

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
Snapshots:   2 passed, 2 total
```

## The idea

Hand-writing assertions for large, structured output is tedious and brittle.
Snapshot testing replaces that with one assertion — `toMatchSnapshot()` — and
delegates the bookkeeping to the framework:

1. **First run:** Jest serializes the value and writes it to a `.snap` file.
2. **Every later run:** Jest re-renders and **compares** against that stored
   file. A mismatch fails the test with a diff.

The stored snapshot is the source of truth, so it is committed to git. That is
the whole point — it is **regression testing by serialization**, and a reviewer
sees precisely how the output changed in the pull-request diff.

## Two styles in this project

| Assertion | Where the expected value lives |
| --- | --- |
| `toMatchSnapshot()` | a separate `__snapshots__/*.snap` file — best for large output |
| `toMatchInlineSnapshot()` | inside the test file's backticks — best for small output |

## Determinism is mandatory

Snapshots only work when the value is **stable across runs**. Dates, random ids,
unordered map iteration, or absolute file paths make the snapshot churn and the
test flaky. The `formatInvoice` function here is a pure function of its input,
so the same invoice always renders the same string.

## Updating a snapshot

When you change the code on purpose, the snapshot test fails by design — it is
telling you the output moved. Inspect the diff; if the new output is correct,
re-bless it:

```sh
npx jest -u        # update all snapshots to the current output
```

If the change was *not* intended, you just caught a regression — fix the code
instead. Never run `-u` blindly; review the diff first.

## Equivalents elsewhere

`toMatchSnapshot` (Jest) ↔ `insta` (Rust) ↔ `expect-test` / `ppx_expect`
(OCaml) ↔ ApprovalTests (C#, Java). The general idea is also called
*golden-file* or *characterization* testing.
