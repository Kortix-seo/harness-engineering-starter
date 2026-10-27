#!/bin/sh
# Sensor 3/3: the totals the tests expect are the totals.
#
# These tests are the specification of the invoice rules. A failing assertion is
# the cheapest form of the bug, and it fails here rather than in a total someone
# signs.
set -eu

log=/tmp/harness-tests.log
if ! node --test test/*.test.mjs >"$log" 2>&1; then
  cat "$log"
  echo ""
  echo "FAIL tests."
  echo "  FIX: read the assertion, then read the rule in docs/invoices.md that names it. If the"
  echo "       code is wrong, fix src/. If the rule changed on purpose, change the test and say so"
  echo "       in the change request. Do not delete the assertion: a test removed to get green is"
  echo "       a rule nobody enforces."
  echo "  Then add a row to docs/failures.md with the commit that fixed it."
  exit 1
fi

tail -n 4 "$log"
echo "tests: ok"
