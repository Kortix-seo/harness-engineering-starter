#!/bin/sh
# Sensor 1/3: one dependency direction.
#
# The domain layer holds the rules; the adapters hold the shapes the rules are
# applied to. The rule is one-way: an adapter may import the domain, and the
# domain never imports an adapter. When the export changes from CSV to an API
# the adapter changes and the rules do not — unless somebody reaches across the
# line to save a parameter, which is the day the rules start depending on the
# file format.
set -eu

violations=0

for file in src/domain/*.mjs; do
  [ -e "$file" ] || continue
  if grep -nE "from ['\"][^'\"]*(\.\./)?adapters/|from ['\"]\.\./adapters/" "$file" >/dev/null 2>&1; then
    violations=$((violations + 1))
    echo "FAIL $file imports from src/adapters/"
    sed -nE "s/.*from ['\"]([^'\"]*adapters\/[^'\"]*)['\"].*/  line: \1/p" "$file" | sed 's/^/  /'
    echo "  FIX: move the value the domain needs into src/domain (a rule about invoices belongs there),"
    echo "       and let the adapter call that function instead of passing parsed rows back up."
    echo "       The direction is one-way: adapters import domain, never the reverse."
  fi
done

if [ "$violations" -gt 0 ]; then
  echo ""
  echo "$violations domain file(s) reach into an adapter."
  echo "  To prove the check still fires, add the import back in a scratch branch and re-run this script."
  exit 1
fi

echo "imports: ok (src/domain/ does not import src/adapters/)"
