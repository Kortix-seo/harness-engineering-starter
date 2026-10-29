# harness-engineering-starter

An open-source harness engineering starter you can clone and run: one agent file, a governance-only manifest, and three checks whose failure messages carry the fix. Kortix is the open-source AI Operating System.

This repository is the runnable half of [how to build an agent harness in seven steps](https://harnessengineeringguide.com/how-to-build-an-agent-harness): every step in that build lands one file, and the files are all here — including the checks, which are the part most write-ups stop before. Clone it, replace the invoice job with your own, and run `npm run check`.

If you want the definition first, [what harness engineering is](https://harnessengineeringguide.com/what-is-harness-engineering) covers where the term came from and what it leaves behind in a repository, and [the six components](https://harnessengineeringguide.com/harness-engineering-components) is the map this layout follows.

## What is here, and which step it belongs to

| File | What it decides | Step |
|---|---|---|
| `kortix.yaml` | what the agent may reach — deny-by-default grants, one `agents:` map | 1, 4 |
| `agents/invoice-triage.md` | how the agent works: the job, the questions it answers, what it refuses | 1 |
| `AGENTS.md` | the map that travels with every turn: four pointers, four conventions | 2 |
| `.githooks/pre-commit` | the cheap half of the harness, run on the way in | 5 |
| `scripts/check-imports.sh` | `src/domain/` imports nothing from `src/adapters/` | 5 |
| `scripts/check-types.sh` | the JSDoc annotations in `src/` and `test/` agree with the code | 5 |
| `scripts/check-tests.sh` | the invoice rules produce the totals the tests expect | 5 |
| `docs/failures.md` | one row per failure, and the commit that ended it | 7 |

The review gate for step 6 is a change request: session work reaches `main` through one, and merge is default-deny for agents. If you want the path-level part of that gate in the repository as well, add a `.github/CODEOWNERS` naming the owners whose review `kortix.yaml` and `agents/` require.

## The job, so the checks have something to check

`data/invoices.csv` is an export of invoices. `node scripts/invoice-totals.mjs data/invoices.csv` prints the unpaid total in cents, one line per skipped invoice, and the field that decided each skip:

```text
unpaid total: 203000 cents (2 invoices)
skipped INV-1002: paid_on — paid on 2026-10-14
skipped INV-1003: voided — voided
skipped INV-1005: currency — currency EUR, not converted
why: paid_on 1, voided 1, currency 1
```

Every rule behind those lines is in `src/domain/invoice-totals.mjs`, and none of them is in the parser. That split is what the first check protects: when the export moves from CSV to an API, `src/adapters/` changes and the rules do not — unless somebody reaches across the line to save a parameter, and then the rules quietly belong to the file format. That is the difference between [harness engineering and context engineering](https://harnessengineeringguide.com/harness-engineering-vs-context-engineering) in one repository: the rules are files here, and what the model reads on a turn is an input to them.

## Run it

```bash
npm install          # typescript and @types/node; the other two checks need nothing but node
npm run check        # imports, then types, then tests
npm run totals       # the job itself, on data/invoices.csv
git config core.hooksPath .githooks   # run the cheap checks on every commit
```

Node 22 or later: `check-tests.sh` uses the built-in `node --test` runner and `invoice-totals.mjs` runs as ESM with no build step, which is why `tsc` checks JSDoc rather than compiling.

Each check exits non-zero with the fix in the message, and each one has been seeded with the failure it exists for: an adapter import in the domain layer, a `string` where the typedef says `number`, and an assertion that expects a different total. If you remove a check, the failure it caught comes back as a review comment instead — at which point it is no longer a check.

## Grants: what the prompt cannot talk its way into

The manifest answers one question per key: what may this agent reach.

```yaml
agents:
  invoice-triage:
    file: agents/invoice-triage.md
    connectors: none
    secrets: none
    skills: none
    tools: [read, grep, edit, bash]
    workspace: { project_repository: true }
```

Grants are deny-by-default, so the omissions are the security model: a prompt that asks the agent to file the invoice in a CRM has no path to one, and the refusal is the harness working. `tools` is an allow list — one extra tool is a decision someone makes on purpose, in a diff, with a reason.

A harness for a coding agent is the same shape with a smaller surface — [the coding-agent harness](https://harnessengineeringguide.com/coding-agent-harness) shows the four controls and which of them the CLI's own config cannot give you. Two grants are worth reading carefully. `workspace: { project_repository: true }` gives each session a checkout of this repository on its own branch, so a bad run costs the time it took: the branch is discarded, `main` has not moved. `bash` is granted because the job runs the three checks; a shell also reaches the network, which is why it is the last tool added and the first one questioned.

## Adapt it to your own job

1. Rename `agents/invoice-triage.md`, rewrite the body as the job, and point `file:` at it.
2. Replace `src/domain/` and `src/adapters/` with your rules and your shapes, keeping the direction between them.
3. Keep one of the three checks and delete the rest you cannot make fail on a real mistake. A check nobody has seen fail is a line in a file.

More on the term, the guides/sensors split and where each file lands: [harness engineering](https://harnessengineeringguide.com/), [the six components](https://harnessengineeringguide.com/harness-engineering-components), [what makes a harness open source](https://harnessengineeringguide.com/open-source-agent-harness), and [where a framework stops and the harness begins](https://harnessengineeringguide.com/harness-vs-framework) — the three promises this repository tries to keep.

## Project links

- [Kortix](https://kortix.com) — the open-source AI Operating System these files boot into
- [Kortix documentation](https://kortix.com/docs)
- [Kortix on GitHub](https://github.com/kortix-ai/suna) — the runtime and the starter manifest this layout comes from
