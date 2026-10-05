# PageSpeed checkpoints

One checkpoint per file, in [`checkpoints/`](checkpoints/). The file name **is** the checkpoint id (`checkpoints/cwv-cls.md` → `cwv-cls`), so an agent can load only the checkpoints that a report actually points at instead of the whole library.

The **index** (id, title, owner, status, links) lives in [`SKILL.md`](SKILL.md#checkpoint-index). Insight → checkpoint lookup is in [`routing.md`](routing.md). How to measure and prove a change is in [`verification.md`](verification.md).

## Shape

Each checkpoint uses the same structure:

````yaml
# <id> — <title>

```yaml
id: ...
status: filled | stub
owner: front | server | both | devtools-only
pass_bar: ...
```

### Ownership      — what the app repo can change vs server/CDN/ops
### Stop here      — when further app work will not move the metric
### What to check
### How to fix
### Hint / example (optional)
### References
````

Sections in every filled body:

- **Ownership** — what the app repo can change vs server/CDN/ops
- **Stop here** — when further app work will not move the metric; escalate or accept residual
- **What to check / How to fix / Hint / References**

## Authoring rules

Fill stubs only when the user asks after a real fix. Write **Hint** as **category patterns** (symptom → cause class → fix class → stop).

- Do **not** name products, routes, component files, brand colors, hashed bundles, or asset filenames.
- Library / platform names may appear only as members of a category — never as the only tool the skill knows.
- Prefer stack-neutral wording; framework or host APIs only as optional examples.
- Keep **front and server** fix guidance equally concrete when both apply — this playbook is for front-end, backend, and full-stack users.
- Never recommend a fix that changes product logic, UX contracts, security, or business results just to raise a lab score; prefer defer/split/headers/discovery over delete or degrade.

`scripts/validate.mjs` enforces the mechanical parts of these rules (id/filename match, schema, index and routing parity, forbidden patterns, link resolution).

Chrome insights hub: https://developer.chrome.com/docs/performance/insights/

## Quick triage: front vs server

| Mostly **front** | Mostly **server / CDN / ops** | **DevTools-only** (not in PSI) |
|------------------|-------------------------------|--------------------------------|
| CLS, INP, reflow, DOM, fonts display, unused/dupe JS, legacy JS, viewport, lazy images, selector costs | TTFB/document latency, HTTP/2\|3, origin compression, object-storage / CDN Cache-Control, edge email-obfuscation inject | `css-selector`, `http` (modern HTTP) |

**Full-stack / owns hosting:** treat the server column as **Now** when those insights fail — apply each checkpoint's How to fix in-repo or in owned CDN config. **Front-only:** report server column as **Stop** (one sentence). **Backend-only:** treat server column as **Now**; put pure front CLS/JS on Next/Stop with a handoff note.

When stop criteria match **and** no owned lever remains: **report the checkpoint id + stop reason; do not invent patches on the wrong layer.** For owner `both`: do the owned half first (see skill Now order).
