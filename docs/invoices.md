# Invoices: the file, the fields, the rules

This is the job the open-source `harness-engineering-starter` project runs. It is
small on purpose: the interesting part is the harness around it, not the code.

`data/invoices.csv` is the export the job reads. One header row, then one row
per invoice:

```csv
id,amount_cents,currency,paid_on,voided
INV-1001,125000,USD,,false
INV-1002,40000,USD,2026-10-14,false
INV-1003,999,USD,,true
```

The rules the total obeys, in order:

1. A row with `voided=true` is not owed. It is skipped and named.
2. A row with a `paid_on` date is already paid. It is skipped and named.
3. A row whose `currency` is not `USD` is skipped and named, never converted.
4. A row whose `amount_cents` is not a whole number fails validation, and the
   whole run stops. A partial total is worse than no total.

Every skip prints the row id and the field that decided it, because the next
question is always "why is INV-1007 not in there".

## The layer split

- `src/domain/invoice-totals.mjs` — the rules above. Pure functions over plain
  objects. It imports nothing from `src/adapters/`.
- `src/adapters/csv-invoices.mjs` — the CSV text into those plain objects. It
  may import the domain layer.
- `scripts/invoice-totals.mjs` — the command line: read the file, call the
  adapter, call the domain, print.

The direction is one-way on purpose. When the export moves from CSV to an API,
the adapter changes and the rules do not, and a check keeps anyone from
reaching across the line to save a parameter.
