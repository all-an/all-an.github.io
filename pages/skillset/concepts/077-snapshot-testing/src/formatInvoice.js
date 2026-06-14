// Renders an invoice as a formatted, multi-line receipt. This is an ideal
// snapshot-testing target: the output is large and structured, so asserting it
// line by line would be tedious and brittle. A snapshot captures the whole
// rendered string at once and flags any future change to it.

// Format an integer number of cents as a dollar string, e.g. 1234 -> "$12.34".
// Cents (an int) avoids the rounding error of floating-point dollar amounts.
function formatCents(cents) {
  const dollars = Math.floor(cents / 100);
  const remainder = String(cents % 100).padStart(2, "0");
  return `$${dollars}.${remainder}`;
}

// Build the receipt text for an invoice: a header, one line per item, and a
// total. It is a PURE function of its input, so the same invoice always renders
// the same string — the determinism a stable snapshot depends on.
function formatInvoice(invoice) {
  const lines = [];
  lines.push(`INVOICE ${invoice.id}`);
  lines.push(`Customer: ${invoice.customer}`);
  lines.push("--------------------------------");

  // Accumulate the grand total while rendering each line item.
  let total = 0;
  for (const item of invoice.items) {
    const lineTotal = item.qty * item.priceCents;
    total += lineTotal;
    lines.push(
      `  ${item.qty} x ${item.name} @ ${formatCents(item.priceCents)} = ${formatCents(lineTotal)}`,
    );
  }

  lines.push("--------------------------------");
  lines.push(`TOTAL: ${formatCents(total)}`);
  return lines.join("\n");
}

module.exports = { formatInvoice, formatCents };
