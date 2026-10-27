#!/usr/bin/env node
// The command line: read the file, call the adapter, call the domain, print.
// Everything with a decision in it lives in src/; this file holds only wiring.
import { readFile } from 'node:fs/promises';
import { parseInvoiceCsv } from '../src/adapters/csv-invoices.mjs';
import { skipsByField, unpaidTotal } from '../src/domain/invoice-totals.mjs';

const path = process.argv[2] ?? 'data/invoices.csv';
const csv = await readFile(path, 'utf8');
const total = unpaidTotal(parseInvoiceCsv(csv));

console.log(`unpaid total: ${total.totalCents} cents (${total.counted.length} invoices)`);
for (const skip of total.skipped) {
  console.log(`skipped ${skip.id}: ${skip.field} — ${skip.reason}`);
}
const byField = skipsByField(total.skipped);
if (Object.keys(byField).length > 0) {
  console.log(
    'why: ' +
      Object.entries(byField)
        .map(([field, count]) => `${field} ${count}`)
        .join(', ')
  );
}
