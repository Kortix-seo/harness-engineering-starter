/**
 * The invoice rules. Plain data in, plain data out: no file system, no CSV, no
 * network. This is the layer that must stay testable without a fixture on disk,
 * which is why `scripts/check-imports.sh` refuses an adapter import here.
 *
 * @typedef {object} Invoice
 * @property {string} id
 * @property {number} amountCents
 * @property {string} currency
 * @property {string | null} paidOn
 * @property {boolean} voided
 */

/**
 * @typedef {object} Skip
 * @property {string} id
 * @property {string} field
 * @property {string} reason
 */

/**
 * @typedef {object} Total
 * @property {number} totalCents
 * @property {Invoice[]} counted
 * @property {Skip[]} skipped
 */

/**
 * Sum the invoices that are still owed.
 *
 * @param {Invoice[]} invoices
 * @returns {Total}
 * @throws {Error} when an amount is not a whole number of cents
 */
export function unpaidTotal(invoices) {
  /** @type {Skip[]} */
  const skipped = [];
  /** @type {Invoice[]} */
  const counted = [];
  let totalCents = 0;

  for (const invoice of invoices) {
    if (!Number.isInteger(invoice.amountCents)) {
      throw new Error(
        `${invoice.id}: amountCents is ${String(invoice.amountCents)}, which is not a whole number of cents. ` +
          'A total built on a rounded row is wrong in a way nobody can see. Fix the export.'
      );
    }
    if (invoice.voided) {
      skipped.push({ id: invoice.id, field: 'voided', reason: 'voided' });
      continue;
    }
    if (invoice.paidOn) {
      skipped.push({ id: invoice.id, field: 'paid_on', reason: `paid on ${invoice.paidOn}` });
      continue;
    }
    if (invoice.currency !== 'USD') {
      skipped.push({ id: invoice.id, field: 'currency', reason: `currency ${invoice.currency}, not converted` });
      continue;
    }
    totalCents += invoice.amountCents;
    counted.push(invoice);
  }

  return { totalCents, counted, skipped };
}

/**
 * Group a total by the field that decided each skip, for the summary line.
 *
 * @param {Skip[]} skipped
 * @returns {Record<string, number>}
 */
export function skipsByField(skipped) {
  /** @type {Record<string, number>} */
  const byField = {};
  for (const skip of skipped) {
    byField[skip.field] = (byField[skip.field] ?? 0) + 1;
  }
  return byField;
}
