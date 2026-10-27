# Failure log

This log is why the open-source starter has the checks it has: each row is a
mistake that reached a commit before it reached a script.

One row per failure, newest first. The row is only worth writing if it ends in
a commit: an entry with no commit died with the session that wrote it. Read the
row before you extend a check.

| Date | Command | Failure | File that fixed it | Commit |
|---|---|---|---|---|
| 2026-10-27 | `npm run check` | `src/domain/invoice-totals.mjs` imported `parseInvoiceCsv` to skip a blank line, which is the shape of the CSV and not a rule about invoices | `src/adapters/csv-invoices.mjs` (blank lines dropped while parsing) and `scripts/check-imports.sh` (added) | see `git log --follow scripts/check-imports.sh` |
