# Performance enhance journey

A Cursor Agent Skill for improving Google PageSpeed Insights / Lighthouse / Core Web Vitals **without breaking product logic, UX, or business results**.

It works for **front-end**, **backend**, and **full-stack** developers. Stack-agnostic: Nuxt, React, Vue, Blade, Node, Laravel, plain HTML, CDN/edge configs, and similar.

- The playbook is plain markdown. Its optional responsive WebP helper needs Python, Pillow, and Pillow WebP support.
- 32 filled checkpoints, one file each, one shared shape, an explicit ownership model.
- An insight → checkpoint routing table, so a report lands on the right fix instead of a guess.
- A verification protocol, because "it improved" needs a median, not an opinion.

---

## Contents

- [What it is](#what-it-is)
- [Who it is for](#who-it-is-for)
- [Install](#install)
- [Install tips](#install-tips)
- [Troubleshooting the install](#troubleshooting-the-install)
- [Source of truth](#source-of-truth)
- [Updating](#updating)
- [Uninstall](#uninstall)
- [How to run it on a live project](#how-to-run-it-on-a-live-project)
- [Routing](#routing)
- [Verification](#verification)
- [Tooling](#tooling)
- [Repository layout](#repository-layout)
- [What it will do](#what-it-will-do)
- [What it will not do](#what-it-will-not-do)
- [Expectations (honest)](#expectations-honest)
- [Contributing / updating checkpoints](#contributing--updating-checkpoints)
- [License](#license)

---

## What it is

A reusable **journey**, not a one-off tip list:

1. **Census** the app and (if you own it) the server
2. **Map** findings to checkpoints
3. **Rank** Now / Next / Stop
4. **Fix** one owned item at a time (smallest safe change)
5. **Stop** when the lever is unowned, residual, or would hurt the product

Checkpoints cover CLS, LCP, INP, TTFB, images, fonts, JS/CSS, cache, HTTP, back/forward cache, total weight, third parties, facades, and common UI patterns.

- [`SKILL.md`](SKILL.md) — the workflow, product-safety rules, ranking, and the checkpoint index.
- [`checkpoints/`](checkpoints) — one file per checkpoint, named by its id. The agent loads only the ones a report points at.
- [`routing.md`](routing.md) — Lighthouse audit / Chrome insight id → checkpoint id.
- [`verification.md`](verification.md) — how to measure and prove a change.
- [`checkpoints.md`](checkpoints.md) — checkpoint shape, authoring rules, front-vs-server triage.
- [`scripts/responsive-webp.py`](scripts/responsive-webp.py) — optional local JPEG/PNG to responsive WebP conversion with a decoded quality check.

## Who it is for

| Role | What it optimizes |
|------|-------------------|
| Front-end | Markup, CSS, JS, bundler, image pipeline, hydration/islands |
| Backend | TTFB, redirects, compression, cache headers, SSR/document path, CDN config you own |
| Full-stack | Both, sequenced so server latency is not ignored and front work does not fake TTFB fixes |

---

## Install

A skill is just a folder containing `SKILL.md` **and** its `checkpoints/` folder. Copy this repo into one of the skill locations Cursor reads, keeping the folder name `performance-enhance-journey` (it must match the `name:` field in `SKILL.md`).

### Option A — personal skill, synced across machines (recommended)

Personal skills live in your **user Agent Store**:

```text
<user Agent Store>/skills/performance-enhance-journey/
```

On Windows that is:

```text
%LOCALAPPDATA%\Cursor\AgentStores\cursor_agent_stores\<store-id>\files\skills\performance-enhance-journey\
```

`<store-id>` is a per-user id (for example `u200019636`). Pick the store folder your Cursor uses for personal files; the copy there syncs to your other machines.

### Option B — personal skill, this machine only (fallback)

If your Cursor build does not expose an Agent Store, use the legacy path instead. This copy is **not** synced:

```text
~/.cursor/skills/performance-enhance-journey/
```

Windows: `%USERPROFILE%\.cursor\skills\performance-enhance-journey\`

### Option C — project skill, shared with a team

Drop it in the repo you are optimizing so everyone using that repository gets it:

```text
<cool-repo>/.cursor/skills/performance-enhance-journey/
```

### Quickstart — clone and install in one step

```bash
git clone https://github.com/AhmedEaswy/web-performance-enhance-journey.git
cd web-performance-enhance-journey
```

Then run the installer for your platform. It picks the user Agent Store when it can find exactly one, copies the runtime files, replaces the checkpoint set wholesale (so removed checkpoints do not linger), and tells you where it landed.

```powershell
# Windows: auto-detect the Agent Store
pwsh -File scripts/install.ps1

# or force the machine-local fallback, or an explicit path
pwsh -File scripts/install.ps1 -Fallback
pwsh -File scripts/install.ps1 -Destination "D:\skills\performance-enhance-journey" -Force
```

```bash
# macOS / Linux: auto-detect the Agent Store, else fall back to ~/.cursor/skills
./scripts/install.sh

./scripts/install.sh --destination "$HOME/.cursor/skills/performance-enhance-journey" --force
```

The installer is a convenience, not a requirement — the manual copy below does the same thing.

### Manual copy

Copy the runtime files, the `checkpoints/` folder, and the image helper into the chosen `performance-enhance-journey/` folder:

```text
SKILL.md  checkpoints.md  routing.md  verification.md  checkpoints/  scripts/responsive-webp.py   (README.md and LICENSE optional)
```

Windows:

```powershell
$src = ".\web-performance-enhance-journey"
$dst = "$env:LOCALAPPDATA\Cursor\AgentStores\cursor_agent_stores\<store-id>\files\skills\performance-enhance-journey"
New-Item -ItemType Directory -Force $dst | Out-Null
Copy-Item "$src\SKILL.md","$src\checkpoints.md","$src\routing.md","$src\verification.md","$src\README.md","$src\LICENSE" $dst -Force
Copy-Item "$src\checkpoints" $dst -Recurse -Force
New-Item -ItemType Directory -Force "$dst\scripts" | Out-Null
Copy-Item "$src\scripts\responsive-webp.py" "$dst\scripts" -Force
```

macOS / Linux:

```bash
mkdir -p ~/.cursor/skills/performance-enhance-journey
cp web-performance-enhance-journey/{SKILL.md,checkpoints.md,routing.md,verification.md,README.md,LICENSE} \
   ~/.cursor/skills/performance-enhance-journey/
cp -R web-performance-enhance-journey/checkpoints \
   ~/.cursor/skills/performance-enhance-journey/
mkdir -p ~/.cursor/skills/performance-enhance-journey/scripts
cp web-performance-enhance-journey/scripts/responsive-webp.py \
   ~/.cursor/skills/performance-enhance-journey/scripts/
```

The other scripts and `.github/` are repository tooling; the WebP helper is the only script needed at skill runtime.

### Invoke it

In Cursor Agent chat:

```text
/performance-enhance-journey
```

You can also just name it in a sentence ("use the performance-enhance-journey skill", "apply the pagespeed playbook"), or paste a PageSpeed / Lighthouse report and let the description match.

---

## Install tips

- **Keep the folder name exact.** `performance-enhance-journey` must match the `name:` in `SKILL.md`. Renaming the folder to something friendlier makes the skill harder to resolve.
- **Include the image helper.** The playbook needs `SKILL.md`, `checkpoints.md`, `routing.md`, `verification.md`, the whole `checkpoints/` directory, and `scripts/responsive-webp.py`. `README.md` and `LICENSE` are documentation only.
- **`checkpoints/` must come along.** Copying only `SKILL.md` leaves the index pointing at files that do not exist; the agent will report the routing but be unable to open any checkpoint body.
- **Do not install into `~/.cursor/skills-cursor/`.** That directory is reserved for Cursor's built-in skills and is managed automatically; put yours in an Agent Store (Option A) or `~/.cursor/skills/` (Option B).
- **Avoid double nesting.** The common mistake is copying the *repo* folder inside the skill folder, producing `.../performance-enhance-journey/web-performance-enhance-journey/SKILL.md`. `SKILL.md` must sit directly inside the skill folder.
- **Project skill is the best default for a single codebase.** Option C keeps the playbook versioned with the app and reviewable in the same PR as the performance work.
- **Restart a fresh Agent chat after installing.** A chat that was already open when you added the files may not pick up the new skill; start a new Agent session to load it.
- **`localhost` is not production.** Install does not change this, but do not treat local lab runs as real scores — the skill will say so too.
- **Triggering it by description.** The shipped frontmatter has `disable-model-invocation: false`, so the agent can auto-apply it from ambient context (a pasted PSI report, "improve Core Web Vitals", "pagespeed playbook"). Set it to `true` in your copy if you prefer manual `/`-invocation only.
- **Git clone vs copy.** You can symlink or junction the repo folder into the skills directory to avoid re-copying after every `git pull`, but a plain copy is more predictable across Cursor builds.
- **One skill per folder.** Do not merge this into another skill's folder; keep the checkpoint index and its bodies together.

## Troubleshooting the install

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Skill not listed after typing `/` | Folder nested too deep, or an already-open chat | Ensure `.../performance-enhance-journey/SKILL.md` exists, then start a new Agent chat |
| Skill loads but checkpoints are missing | Only `SKILL.md` was copied, or `checkpoints/` was skipped | Copy both `checkpoints.md` and the whole `checkpoints/` folder into the skill folder |
| A specific checkpoint will not open | Its file was renamed away from its `id` | File name must equal the `id:` in the checkpoint's yaml block |
| Nothing happens when pasting a report | `disable-model-invocation: true` in your copy, or the agent did not match the description | Set `disable-model-invocation: false`, or invoke `/performance-enhance-journey` explicitly |
| Different behavior on another machine | Option B copy is machine-local and unsynced | Reinstall via an Agent Store (Option A), or re-run the install script |
| Frontmatter error / skill ignored | Broken YAML in `SKILL.md` (indentation, missing `---`) | Restore `SKILL.md` from this repo |
| Local edits keep disappearing | The skills-folder copy is a snapshot and got overwritten | Edit in the repo, then re-run the install script (see [Source of truth](#source-of-truth)) |

## Source of truth

**This repository is canonical; an installed copy is a snapshot.**

- Install copies (`…/skills/performance-enhance-journey/`) are read by Cursor but are not the project. Editing them there means your next `git pull` / re-copy silently overwrites the change.
- Make every edit here, commit it, then copy into the skills folder. A new chat is needed to pick it up.
- Never hand-edit both copies. If a fix is only worth having locally, it is worth a checkpoint row here instead.
- Sync is one command: `pwsh -File scripts/install.ps1 -Force`, or `./scripts/install.sh --force`. It replaces the checkpoint set wholesale, so renames and deletions propagate instead of lingering.

## Updating

```bash
cd web-performance-enhance-journey
git pull
pwsh -File scripts/install.ps1 -Force   # or: ./scripts/install.sh --force
```

Then start a new Agent chat so the updated files are loaded.

## Uninstall

Delete the `performance-enhance-journey` folder from whichever location you installed it into. Nothing else references it.

---

## How to run it on a live project

1. Open the project in Cursor (or move the agent into that workspace).
2. Start the skill; say your role: **front-only**, **backend-only**, or **full-stack**.
3. Paste **mobile** (and ideally **desktop**) PageSpeed / Lighthouse output for the audited URL.
4. Review the **ranked plan** before approving code changes.
5. After deploy, re-run PSI on the **same** URL and smoke-test critical flows.

## Routing

Reports name insights by audit id (`largest-contentful-paint-element`, `layout-shift-culprits`, `document-latency-insight`, …). [`routing.md`](routing.md) maps those ids to checkpoints deterministically, so a finding lands on the right fix instead of a guess from the display name. [`checkpoints.json`](checkpoints.json) carries the same mapping (plus owner, status, pass bar) in machine-readable form, reverse-indexed per checkpoint.

If an insight is not routed, the skill matches it against `checkpoints/*.md` and adds the row in the same change.

## Verification

Every checkpoint has a `pass_bar`; [`verification.md`](verification.md) is how you show one was met. The short version:

- Same URL, same device, before and after — never mobile vs desktop.
- Cold cache, clean profile, **median of ≥ 3 runs**, not the best run.
- State the noise floor; if the change is inside run-to-run variance, report no measurable change.
- Lab for diagnosis, field (CrUX p75) for the real verdict — lab moves first, field lags.
- Smoke-test the product after each fix. A metric win that breaks a flow is a regression.

It also has ready-to-run recipes: the PSI API, Lighthouse CLI, Lighthouse CI budgets, and header checks for TTFB / compression / cache / protocol.

## Tooling

The optional image helper runs on an owned JPEG or PNG when a project has no image optimizer:

```bash
python -m pip install Pillow
python scripts/responsive-webp.py hero.jpg --out public/images/hero --widths 480,960,1440 --quality 88
# Add --lossless to require identical pixels after each resize (files may be larger).
```

It preserves the source, refuses to upscale or overwrite, applies EXIF orientation, retains ICC color profiles, and reports output size and decoded PSNR. Set `--min-psnr` when the project has an agreed numeric floor; a universal cutoff would reject some detailed images unnecessarily. PSNR does not establish perceived equivalence: inspect important art at each intended display size before wiring `srcset`/`sizes`. The HTML markup and a same-device performance check remain part of the image delivery fix.

Two dependency-free Node scripts keep the package honest. They are for contributing.

```bash
node scripts/build-index.mjs          # regenerate checkpoints.json from checkpoints/ + routing.md
node scripts/build-index.mjs --check  # CI: fail if checkpoints.json is stale
node scripts/validate.mjs             # lint the package
node scripts/split-checkpoints.mjs    # one-shot migration from the old single-file layout
```

`validate.mjs` enforces frontmatter limits, `SKILL.md` staying under 500 lines, checkpoint `id` = file name, allowed `status`/`owner`, non-empty `pass_bar`, required sections, index ↔ files parity, routing targets that exist, `checkpoints.json` freshness, resolvable internal links, and the forbidden-content rules (no hex brand colors, no hashed bundle names). CI runs it on every push and PR.

## Repository layout

```text
web-performance-enhance-journey/
├── SKILL.md             # Entry point: workflow, ownership, ranking, index, product safety
├── checkpoints.md       # Checkpoint shape, authoring rules, front-vs-server triage
├── checkpoints/         # One file per checkpoint, named by id (32)
├── routing.md           # Insight / audit id → checkpoint id
├── verification.md      # Measurement protocol and proof rules
├── checkpoints.json     # GENERATED index (do not hand-edit)
├── scripts/             # responsive-webp.py plus build, validate, migration, install tooling
├── .github/workflows/   # validate.yml
├── CHANGELOG.md
├── CONTRIBUTING.md
├── README.md            # This file
├── LICENSE              # MIT
├── .editorconfig
└── .gitattributes
```

## What it will do

- Prefer load-order, code-splitting, headers, compression, image discovery/size, and safe cache on hashed assets
- Defer heavy UI (carousels, validators, widgets) until interaction / need — **same logic when it runs**
- Put unowned CDN/hosting, required vendors, and framework residual on **Stop**
- Ask before quality drops, clipping content, or caching personalized HTML

## What it will not do

- Guarantee a PageSpeed score of 100
- Change business rules, auth, payments, or required analytics to chase a lab metric
- Fix hosting/CDN you do not control
- Treat `localhost` lab runs as production truth
- Delete framework, i18n, or store runtime because "unused JS" complained

## Expectations (honest)

After one solid pass on a live site you own:

**Likely**

- Clearer LCP (discovery, priority, and/or TTFB if you own the server)
- Fewer easy CLS and unsized-image issues
- Less unused JS from global heavy libraries — features kept, loaded later
- Better cache/compression when you control origin or CDN config

**Unlikely / do not expect**

- Perfect scores; required third parties and framework weight often remain
- Field CrUX to move the same day (lab usually improves first)
- Identical mobile and desktop results
- Magic backend wins if you only own the front repo

**Your job**

- Confirm the ranked list before fixes land
- Smoke-test primary CTA, nav, forms, and any auth/personalized path touched by cache or redirects
- Re-measure the same URL after deploy

## Contributing / updating checkpoints

When you learn a real fix: add or edit `checkpoints/<id>.md` as a **category pattern** (symptom → cause class → fix class → stop), add its row to the index in `SKILL.md` and to `routing.md`, then run `node scripts/build-index.mjs && node scripts/validate.mjs`. Do not add client names, private URLs, asset filenames, brand colors, or hashed bundles.

Full process, writing rules, and release steps: [`CONTRIBUTING.md`](CONTRIBUTING.md). Version history: [`CHANGELOG.md`](CHANGELOG.md).

## License

[MIT](LICENSE) — see `LICENSE` for the full text.
