#!/bin/sh
# Sensor 2/3: the JSDoc types are the contract.
#
# There is no build step in this project, so the types only exist if something
# reads them. `tsc --checkJs` does: it type-checks .mjs files against their
# JSDoc annotations, and it runs in a couple of seconds.
set -eu

if [ ! -x node_modules/.bin/tsc ]; then
  echo "FAIL tsc is not installed in this checkout."
  echo "  FIX: run 'npm install' in the repository root, then re-run 'npm run check'."
  echo "       If you are in a fresh session sandbox that has no node_modules, the install"
  echo "       is the first command: the types cannot be checked by a tool that is not there."
  exit 1
fi

if ! node_modules/.bin/tsc --noEmit; then
  echo ""
  echo "FAIL type check."
  echo "  FIX: fix the annotation or the code — never the tsconfig. The three causes worth checking"
  echo "       first: a value that is 'string | null' used as a string (guard the null where you read"
  echo "       it); an object literal missing a property the typedef names; and a 'Cannot find module"
  echo "       node:...' error, which means @types/node is not installed (run npm install, do not"
  echo "       add types by hand). Re-run: npm run typecheck"
  exit 1
fi

echo "types: ok (tsc --noEmit, JSDoc checked)"
