# Checks: three sensors, one rule each

The three checks below are the part of this open-source starter that most
write-ups skip. Each one exists because a session got something wrong.

A check earns its place by turning a mistake that already happened into a
failure that cannot be repeated. Each of the three here carries the fix in its
failure message, because the reader is an agent that will otherwise retry the
same edit.

| Script | What it proves | The fix in its message |
|---|---|---|
| `scripts/check-imports.sh` | `src/domain/` imports nothing from `src/adapters/` | where the shared value belongs instead |
| `scripts/check-types.sh` | the JSDoc types in `src/` and `test/` agree with the code | the exact `tsc` line to run and the two common causes |
| `scripts/check-tests.sh` | the domain rules produce the totals the tests expect | which row or rule to re-read, and the log row to add |

Run all three with `npm run check`.

### The seeded run, recorded

All three were seeded and re-run in a clean clone on 2026-10-27, which is the
only reason the failure messages can be trusted to carry the fix:

| Seed | Output | Restored |
|---|---|---|
| `import { parseInvoiceCsv } from '../adapters/csv-invoices.mjs'` added to `src/domain/invoice-totals.mjs` | `FAIL src/domain/invoice-totals.mjs imports from src/adapters/` and the one-way rule | file reset, `imports: ok` |
| `totalCents` returned as `String(totalCents)` | `src/domain/invoice-totals.mjs(65,12): error TS2322: Type 'string' is not assignable to type 'number'.` plus the three causes | file reset, `types: ok` |
| the totals assertion changed from `203000` to `204000` | `pass 5 / fail 1`, the assertion, and the instruction to re-read the rule before touching the test | file reset, `tests: ok` |

## Wiring them as a pre-commit hook

```bash
git config core.hooksPath .githooks
```

`.githooks/pre-commit` runs `scripts/check-imports.sh` and
`scripts/check-types.sh` on the way in: cheap controls run first, and the whole
suite runs in the change request. A hook that runs the slow half is a hook
people learn to bypass with `--no-verify`.

## What does not belong in a check

Anything that needs judgement. A check that asks a model whether the diff is
good is a sensor with a variance you cannot bound, and it belongs on a sample
of changes rather than on every commit. Keep the deterministic half
deterministic: tests, linters, type checkers and import direction.
