# Contributing

Thanks for improving the playbook. This is a markdown skill — no build step, no dependencies.

## Layout

```text
SKILL.md                 # entry point: workflow, safety, ranking, checkpoint index
checkpoints.md           # checkpoint shape, authoring rules, front-vs-server triage
checkpoints/<id>.md      # one checkpoint per file; the file name IS the id
routing.md               # insight/audit id → checkpoint id
verification.md          # how to measure and prove a change
checkpoints.json         # GENERATED from checkpoints/ + routing.md — do not hand-edit
scripts/                 # build-index.mjs, validate.mjs, install.{ps1,sh}
```

## Before you open a PR

Run both scripts from the repo root and make sure they pass:

```bash
node scripts/build-index.mjs
node scripts/validate.mjs
```

`validate.mjs` enforces: frontmatter (`name`, description ≤1024), `SKILL.md` under 500 lines, checkpoint id = file name, allowed `status`/`owner`, a non-empty `pass_bar`, the required sections, index ↔ files parity, routing targets that exist, `checkpoints.json` freshness, resolvable internal links, and the forbidden-content rules below.

## Adding or changing a checkpoint

1. Create or edit `checkpoints/<id>.md`. Ids are lowercase with hyphens, and the file name must equal the `id:` inside the yaml block.
2. Keep the shape from [`checkpoints.md`](checkpoints.md): yaml block (`id`, `status`, `owner`, `pass_bar`) plus **Ownership**, **Stop here**, **What to check**, **How to fix**, optional **Hint / example**, **References**.
3. Set `status: filled` — `stub` is allowed temporarily but `validate.mjs` warns on it.
4. Add the row to the **Checkpoint index** in [`SKILL.md`](SKILL.md) with the same owner and status.
5. Add insight rows to [`routing.md`](routing.md) for every audit / insight id that should land on it (repeat the checkpoint once per id; one row per pair).
6. Run `node scripts/build-index.mjs && node scripts/validate.mjs`.

## Writing rules

These exist because the playbook must stay useful on a codebase it has never seen.

- Write **category patterns**: symptom → cause class → fix class → stop.
- Do **not** name products, routes, component files, brand colors, hashed bundles, or asset filenames. `validate.mjs` blocks hex colors and hashed asset names; the rest is review.
- Library and platform names may appear only as members of a category, never as the only tool the skill knows.
- Prefer stack-neutral wording. Framework / host APIs are optional examples.
- Keep **front** and **server** guidance equally concrete when both apply.
- Never recommend a fix that changes product logic, UX contracts, security, or business results to raise a lab score. Prefer defer / split / headers / discovery over delete / degrade.
- Keep `SKILL.md` lean; detail belongs in a checkpoint or `verification.md`.

## Changing the verification protocol

Edit `verification.md`. Keep it tool-agnostic where possible; when you add a specific tool, also say *why* it is the right instrument for that checkpoint. Do not weaken a rule (median-of-≥3, same URL/device, stated noise floor) without a good reason in the PR description.

## Commits and releases

- Conventional-ish messages (`add:`, `fix:`, `docs:`, `chore:`) are appreciated but not enforced.
- Version bumps follow [`CHANGELOG.md`](CHANGELOG.md): removing or renaming a checkpoint id, or changing the file layout, is a **major** bump; adding a checkpoint or changing instructions/pass bars is a **minor** bump.
- Release process: update the changelog, commit, then tag `v<version>` and push the tag.

## Scope

Out of scope by design: SEO / accessibility / best-practice audits, and anything that requires the playbook to know one specific product. If a report item is out of scope, say so in the "Not routed" section of `routing.md` rather than inventing a checkpoint.
