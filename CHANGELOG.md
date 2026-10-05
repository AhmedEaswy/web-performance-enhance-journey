# Changelog

All notable changes to this skill are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

A checkpoint's `pass_bar` or agent instructions changing is a **minor** bump. Removing or renaming a checkpoint id, or changing the file layout, is a **major** bump.

## [Unreleased]

Planned checkpoints (candidates, not yet written — verify each against the current Chrome insights index before adding):

- `efficient-animated-content` — animated GIF → video (partly covered by `img-delivery`).
- `preconnect` / origin warming — `net-tree` covers candidates, but there is no dedicated checkpoint.
- `unminified-css` / `unminified-javascript` as their own item.
- `no-document-write` and `uses-passive-event-listeners` beyond their current `main-thread` / `js-unused` mentions.
- Long animation frames (LoAF) and SPA soft-navigation INP as distinct INP contributors.
- `content-visibility` / rendering work for long pages.
- Stack packs (`stacks/nuxt.md`, `stacks/laravel.md`, `stacks/react.md`) referenced as optional examples.
- Site-wide mode: cluster routes by template, batch-measure, fix the template once.

## [1.0.0] - 2026-10-05

### Added

- Checkpoint routing: `routing.md` maps Lighthouse audit / Chrome insight ids to checkpoint ids, and `checkpoints.json` carries the same mapping machine-readable and reverse-indexed.
- Verification protocol: `verification.md` — lab vs field, median-of-≥3 with a stated noise floor, tool recipes (PSI API, Lighthouse CLI, Lighthouse CI budgets, header checks), per-fix protocol, stop conditions, anti-patterns.
- Three checkpoints: `bf-cache`, `total-byte-weight`, `third-party-facades`.
- Tooling: `scripts/build-index.mjs` (generates `checkpoints.json`, `--check` for CI), `scripts/validate.mjs` (dependency-free package lint), `scripts/install.ps1` / `scripts/install.sh` (one-step repo → skills-folder sync).
- CI: `.github/workflows/validate.yml` verifies the generated index is current and the package validates.
- Docs: `CONTRIBUTING.md`, `.editorconfig`, `.gitattributes`, install troubleshooting and source-of-truth guidance in `README.md`.

### Changed

- Checkpoints split out of the single `checkpoints.md` into `checkpoints/<id>.md` (one file per id) so an agent loads only the checkpoints a report points at. `checkpoints.md` is now the shape / authoring-rules / triage hub.
- `SKILL.md` checkpoint index links directly to each checkpoint file and is validated for parity against `checkpoints/`.
- `SKILL.md` now routes findings through `routing.md` first and requires the verification protocol before claiming an improvement.
- `README.md` documents install options, install tips, troubleshooting, and the canonical-copy rule.

### Fixed

- Missing entry for the front-vs-server triage table in the checkpoint index.
- `README.md` install path pointed at the legacy `~/.cursor/skills/` path instead of the user Agent Store.
