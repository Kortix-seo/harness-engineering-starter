import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseInvoiceCsv } from '../src/adapters/csv-invoices.mjs';
import { skipsByField, unpaidTotal } from '../src/domain/invoice-totals.mjs';

/** @type {import('../src/domain/invoice-totals.mjs').Invoice[]} */
const invoices = [
  { id: 'INV-1', amountCents: 125000, currency: 'USD', paidOn: null, voided: false },
  { id: 'INV-2', amountCents: 40000, currency: 'USD', paidOn: '2026-10-14', voided: false },
  { id: 'INV-3', amountCents: 999, currency: 'USD', paidOn: null, voided: true },
  { id: 'INV-4', amountCents: 78000, currency: 'USD', paidOn: null, voided: false },
  { id: 'INV-5', amountCents: 50000, currency: 'EUR', paidOn: null, voided: false },
];

test('totals the unpaid USD invoices only', () => {
  const total = unpaidTotal(invoices);
  assert.equal(total.totalCents, 203000);
  assert.deepEqual(
    total.counted.map((invoice) => invoice.id),
    ['INV-1', 'INV-4']
  );
});

test('names the field that decided every skip', () => {
  const total = unpaidTotal(invoices);
  assert.deepEqual(
    total.skipped.map((skip) => [skip.id, skip.field]),
    [
      ['INV-2', 'paid_on'],
      ['INV-3', 'voided'],
      ['INV-5', 'currency'],
    ]
  );
});

test('counts skips by field for the summary line', () => {
  const total = unpaidTotal(invoices);
  assert.deepEqual(skipsByField(total.skipped), { paid_on: 1, voided: 1, currency: 1 });
});

test('refuses a fractional amount instead of rounding it', () => {
  assert.throws(
    () => unpaidTotal([{ id: 'INV-9', amountCents: 10.5, currency: 'USD', paidOn: null, voided: false }]),
    /INV-9: amountCents is 10\.5/
  );
});

test('parses the export, blank lines and all', () => {
  const csv = [
    'id,amount_cents,currency,paid_on,voided',
    'INV-1,125000,USD,,false',
    '',
    'INV-2,40000,USD,2026-10-14,false',
    '',
  ].join('\n');
  const parsed = parseInvoiceCsv(csv);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[1].paidOn, '2026-10-14');
  assert.equal(parsed[0].voided, false);
});

test('refuses an export whose header was renamed', () => {
  assert.throws(() => parseInvoiceCsv('id,amount,currency,paid_on,voided\nINV-1,1,USD,,false'), /missing amount_cents/);
});
