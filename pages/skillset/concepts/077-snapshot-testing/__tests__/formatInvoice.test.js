const { formatInvoice } = require("../src/formatInvoice");

// A fixed invoice the snapshot tests render. Snapshot testing needs a stable,
// deterministic input so the output only changes when the CODE changes, never
// by accident (no dates, no random ids, no map ordering surprises).
const invoice = {
  id: "INV-1001",
  customer: "Ada Lovelace",
  items: [
    { name: "Keyboard", qty: 1, priceCents: 7999 },
    { name: "USB-C cable", qty: 3, priceCents: 1250 },
  ],
};

describe("formatInvoice", () => {
  // toMatchSnapshot: on the FIRST run jest serializes the rendered receipt to
  // __snapshots__/formatInvoice.test.js.snap. On every later run it re-renders
  // and compares against that stored file; any difference fails the test. The
  // committed .snap file is the "golden" reference — this is the essence of
  // snapshot testing: regression testing by serialization.
  test("renders the receipt the same as the stored snapshot", () => {
    expect(formatInvoice(invoice)).toMatchSnapshot();
  });

  // toMatchInlineSnapshot keeps the expected value right here in the test file
  // instead of a separate .snap. Jest writes the backtick string in on first
  // run; the diff then lives next to the assertion, which suits small outputs.
  test("formats a tiny invoice inline", () => {
    const tiny = {
      id: "INV-2",
      customer: "Grace Hopper",
      items: [{ name: "Pen", qty: 2, priceCents: 150 }],
    };
    expect(formatInvoice(tiny)).toMatchInlineSnapshot(`
"INVOICE INV-2
Customer: Grace Hopper
--------------------------------
  2 x Pen @ $1.50 = $3.00
--------------------------------
TOTAL: $3.00"
`);
  });
});
