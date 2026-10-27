# Grants: what the manifest decides, and what the prompt cannot

In an open-source project the permission model is a file people can read before
they run anything. Here that file is `kortix.yaml`.

`kortix.yaml` is the permission slip. Three rules cover every change to it.

**Deny by default.** An omitted `connectors`, `secrets`, `kortix_permissions`,
`skills` or `workspace` key resolves to none. The one agent here names `none`
explicitly for the grants it does not want, so a reviewer reads the omission as
a decision rather than as an oversight.

**An allow list beats an exclusion list.** `tools: [read, grep, edit, bash]`
names what the agent may use. The exclusion form is longer to read and it fails
open every time a new tool appears.

**Widening is a review, not an edit.** A grant added to the manifest is a
capability change: it belongs in a change request with the reason in the body,
and the reason names the task that failed without it.

## The test that makes a grant real

Have the session call a connector it was not granted, and read the refusal in
the session log. Then add that one grant and watch the same call succeed. A
denial nobody has triggered is a line in a file; the first person to trigger it
is usually reading an incident at the time.

## What this project deliberately does not grant

`kortix_permissions` stays unset, which means no permission token reaches the
agent at all. Nothing here runs `kortix`, opens a change request or reaches the
network for the platform's own API: the checks are local scripts and the agent's
only output is a diff in this repository.
