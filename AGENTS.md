# AGENTS.md — the map, not the manual

This is an open-source Kortix project: the manifest, the agent file and the
checks are all in this repository, and all of them change by diff.

This file travels with every turn, so it stays short and points at the files
that carry the procedures. Each path below resolves in this repository; if one
stops resolving, the map is wrong and the fix belongs in the same change.

| When the task is | Read |
|---|---|
| Totalling invoices, or explaining an exclusion | `docs/invoices.md` |
| Changing what an agent may reach | `kortix.yaml`, then `docs/grants.md` |
| Adding or fixing a check | `docs/checks.md` |
| A failure that already happened once | `docs/failures.md` |

Conventions that apply to every task:

- Every change lands through a change request; merge is default-deny for agents.
- The domain layer never imports an adapter. `scripts/check-imports.sh` enforces
  it and its failure message says what to do instead.
- A check's failure message carries the fix. A message that only names a rule is
  incomplete.
- A bug fix that no check would have caught gets a check in the same change.
