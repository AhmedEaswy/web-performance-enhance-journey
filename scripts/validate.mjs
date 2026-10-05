// Validate the skill package. Dependency-free, cross-platform.
//
// Usage: node scripts/validate.mjs
//
// Checks:
//   1. SKILL.md frontmatter: name, description length, schema basics, line count.
//   2. Every checkpoints/*.md: id matches file name, allowed status/owner, pass_bar, required sections.
//   3. SKILL.md checkpoint index and checkpoints/ agree (both directions).
//   4. routing.md only references checkpoints that exist.
//   5. checkpoints.json is in sync with checkpoints/ + routing.md.
//   6. Internal markdown links resolve.
//   7. Forbidden content patterns (brand colors, hashed bundles, configured tokens).
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EXPECTED_NAME = 'performance-enhance-journey';
const STATUSES = ['filled', 'stub'];
const OWNERS = ['front', 'server', 'both', 'devtools-only'];
const REQUIRED_SECTIONS = ['### Ownership', '### Stop here', '### What to check', '### How to fix'];
const MAX_DESCRIPTION = 1024;
const MAX_SKILL_LINES = 500;

const errors = [];
const warnings = [];
const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

const read = async (path) => readFile(join(ROOT, path), 'utf8');
const exists = async (path) =>
  stat(join(ROOT, path)).then(
    () => true,
    () => false,
  );

// --- 1. SKILL.md frontmatter -------------------------------------------------
const skill = await read('SKILL.md');
const skillLines = skill.split(/\r?\n/).length;

const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(skill)?.[1];
if (!frontmatter) {
  fail('SKILL.md: missing YAML frontmatter');
} else {
  const name = /^name:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim();
  if (name !== EXPECTED_NAME) fail(`SKILL.md: name "${name}" must be "${EXPECTED_NAME}"`);
  if (name && !/^[a-z0-9-]{1,64}$/.test(name)) fail(`SKILL.md: name "${name}" must be lowercase letters/numbers/hyphens, ≤64 chars`);

  const description = /^description:\s*>-\r?\n([\s\S]*)$/m.exec(frontmatter)?.[1];
  if (!description) {
    fail('SKILL.md: description is missing or not a folded block');
  } else {
    const text = description.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) fail('SKILL.md: description is empty');
    if (text.length > MAX_DESCRIPTION) fail(`SKILL.md: description is ${text.length} chars (max ${MAX_DESCRIPTION})`);
  }
}
if (skillLines >= MAX_SKILL_LINES) fail(`SKILL.md: ${skillLines} lines (must stay under ${MAX_SKILL_LINES})`);

// --- 2. checkpoint bodies ----------------------------------------------------
const checkpointFiles = (await readdir(join(ROOT, 'checkpoints')).catch(() => [])).filter((name) => name.endsWith('.md'));
if (checkpointFiles.length === 0) fail('checkpoints/: no checkpoint files found');

const checkpoints = new Map();
for (const file of checkpointFiles) {
  const id = file.replace(/\.md$/, '');
  const markdown = await read(join('checkpoints', file));
  const heading = /^#\s+(.+?)\s*$/m.exec(markdown)?.[1]?.trim();
  const meta = /^```yaml\s*\n([\s\S]*?)\n```/m.exec(markdown)?.[1] ?? '';
  const field = (key) => new RegExp(`^${key}:\\s*(.*)$`, 'm').exec(meta)?.[1]?.trim();

  if (!heading || heading.split('—')[0].trim() !== id) {
    fail(`checkpoints/${file}: top heading must start with "${id} — "`);
  }
  if (field('id') !== id) fail(`checkpoints/${file}: yaml id "${field('id')}" must equal file name`);
  const status = field('status');
  if (!STATUSES.includes(status)) fail(`checkpoints/${file}: status "${status}" must be one of ${STATUSES.join(', ')}`);
  if (status === 'stub') warn(`checkpoints/${file}: status is "stub"`);
  const owner = field('owner');
  if (!OWNERS.includes(owner)) fail(`checkpoints/${file}: owner "${owner}" must be one of ${OWNERS.join(', ')}`);
  if (!field('pass_bar')) fail(`checkpoints/${file}: pass_bar is empty`);
  for (const section of REQUIRED_SECTIONS) {
    if (!markdown.includes(section)) fail(`checkpoints/${file}: missing ${section}`);
  }
  checkpoints.set(id, { owner, status });
}

// --- 3. SKILL.md index parity ------------------------------------------------
const indexRows = new Map();
for (const line of skill.split(/\r?\n/)) {
  const row = /^\|\s*\[([\w-]+)\]\(checkpoints\/([\w-]+)\.md\)\s*\|\s*(.+?)\s*\|\s*(front|server|both|devtools-only)\s*\|\s*(filled|stub)\s*\|\s*$/.exec(line);
  if (!row) continue;
  const [, label, target, , owner, status] = row;
  if (label !== target) fail(`SKILL.md index: link text "${label}" does not match target "${target}"`);
  indexRows.set(label, { owner, status });
}
if (indexRows.size === 0) fail('SKILL.md: no checkpoint index rows found (expected "| [id](checkpoints/id.md) | title | owner | status |")');
for (const [id, entry] of checkpoints) {
  const row = indexRows.get(id);
  if (!row) fail(`SKILL.md index: missing row for "${id}"`);
  else {
    if (row.owner !== entry.owner) fail(`SKILL.md index: "${id}" owner ${row.owner} ≠ checkpoint ${entry.owner}`);
    if (row.status !== entry.status) fail(`SKILL.md index: "${id}" status ${row.status} ≠ checkpoint ${entry.status}`);
  }
}
for (const id of indexRows.keys()) {
  if (!checkpoints.has(id)) fail(`SKILL.md index: "${id}" has no checkpoints/${id}.md`);
}

// --- 4. routing.md ----------------------------------------------------------
const routing = await read('routing.md');
let routed = 0;
for (const line of routing.split(/\r?\n/)) {
  const row = /^\|\s*`([^`]+)`\s*\|\s*([\w-]+)\s*\|$/.exec(line);
  if (!row) continue;
  routed += 1;
  if (!checkpoints.has(row[2])) fail(`routing.md: "${row[1]}" routes to unknown checkpoint "${row[2]}"`);
}
if (routed === 0) warn('routing.md: no insight rows found');

// --- 5. checkpoints.json in sync -------------------------------------------
const index = JSON.parse(await read('checkpoints.json').catch(() => 'null'));
if (!index) fail('checkpoints.json: missing or unparsable (run `node scripts/build-index.mjs`)');
else {
  if (index.count !== checkpoints.size) fail(`checkpoints.json: count ${index.count} ≠ ${checkpoints.size} checkpoints`);
  for (const entry of index.checkpoints ?? []) {
    const local = checkpoints.get(entry.id);
    if (!local) {
      fail(`checkpoints.json: "${entry.id}" has no checkpoint file`);
      continue;
    }
    if (entry.owner !== local.owner) fail(`checkpoints.json: "${entry.id}" owner is stale`);
    if (entry.status !== local.status) fail(`checkpoints.json: "${entry.id}" status is stale`);
  }
}

// --- 6. internal links ------------------------------------------------------
const candidates = ['SKILL.md', 'README.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'checkpoints.md', 'routing.md', 'verification.md', ...checkpointFiles.map((file) => `checkpoints/${file}`)];
const markdownFiles = [];
for (const file of candidates) {
  if (await exists(file)) markdownFiles.push(file);
}
for (const file of markdownFiles) {
  const markdown = await read(file);
  let inFence = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    for (const link of line.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = link[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const path = target.split('#')[0];
      if (!path) continue;
      if (!(await exists(join(dirname(file), path)))) fail(`${file}: broken link → ${target}`);
    }
  }
}

// --- 7. forbidden content ---------------------------------------------------
const scannable = markdownFiles;
const baseForbidden = [
  { name: 'hex brand color', pattern: /(?<![A-Za-z0-9])#[0-9a-fA-F]{3,8}\b/ },
  { name: 'hashed bundle asset', pattern: /\b[\w-]+[.-][a-f0-9]{8,}\.(?:js|css)\b/ },
];
let extraForbidden = [];
if (await exists('scripts/forbidden.json')) {
  extraForbidden = JSON.parse(await read('scripts/forbidden.json')).map((entry) => ({
    name: entry.name ?? entry.pattern,
    pattern: new RegExp(entry.pattern, 'g'),
  }));
}
for (const file of scannable) {
  const markdown = await read(file);
  for (const rule of [...baseForbidden, ...extraForbidden]) {
    const hits = [...markdown.matchAll(new RegExp(rule.pattern, 'g'))].map((match) => match[0]);
    if (hits.length > 0) fail(`${file}: forbidden content (${rule.name}): ${[...new Set(hits)].slice(0, 5).join(', ')}`);
  }
}

// --- report -----------------------------------------------------------------
for (const message of warnings) console.warn(`warn  ${message}`);
for (const message of errors) console.error(`error ${message}`);

const summary = `${checkpoints.size} checkpoints, ${indexRows.size} index rows, ${routed} routing rows, ${errors.length} error(s), ${warnings.length} warning(s)`;
console.log(errors.length === 0 ? `OK  ${summary}` : `FAIL  ${summary}`);
process.exit(errors.length === 0 ? 0 : 1);
