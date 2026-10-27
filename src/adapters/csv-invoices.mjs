/**
 * The CSV export, parsed into the domain's plain objects. This layer may import
 * `src/domain/`; the domain layer may not import this file. Keep the parsing
 * quirks of the export here, and every rule about invoices in the domain.
 *
 * @typedef {import('../domain/invoice-totals.mjs').Invoice} Invoice
 */

const COLUMNS = ['id', 'amount_cents', 'currency', 'paid_on', 'voided'];

/**
 * @param {string} csv
 * @returns {Invoice[]}
 * @throws {Error} when the header is not the export's header
 */
export function parseInvoiceCsv(csv) {
  /** @type {string[]} */
  const lines = csv
    .split(/\r?\n/)
    // Blank lines are a property of the export, not a rule about invoices.
    .filter((line) => line.trim() !== '');

  if (lines.length === 0) return [];

  const header = lines[0].split(',').map((name) => name.trim());
  const missing = COLUMNS.filter((name) => !header.includes(name));
  if (missing.length > 0) {
    throw new Error(
      `The export is missing ${missing.join(', ')}. ` +
        `Its header is "${header.join(',')}". Re-export with the columns ` +
        '"id,amount_cents,currency,paid_on,voided" rather than renaming them in the parser.'
    );
  }

  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map((cell) => cell.trim());
    /** @type {Record<string, string>} */
    const row = {};
    header.forEach((name, column) => {
      row[name] = cells[column] ?? '';
    });
    const field = row.id || `row ${index + 2}`;
    if (row.amount_cents === '' || Number.isNaN(Number(row.amount_cents))) {
      throw new Error(
        `${field}: amount_cents is "${row.amount_cents}". ` +
          'Money stays in integer cents in this project; fix the export, not the parser.'
      );
    }
    return {
      id: row.id,
      amountCents: Number(row.amount_cents),
      currency: row.currency,
      paidOn: row.paid_on === '' ? null : row.paid_on,
      voided: row.voided === 'true',
    };
  });
}
