// One-shot migration: split the monolithic checkpoints.md into checkpoints/<id>.md
// Fence-aware (ignores '## ' headings inside code blocks) and idempotent.
//
// Usage: node scripts/split-checkpoints.mjs
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'checkpoints.md');
const OUT_DIR = join(ROOT, 'checkpoints');

const source = await readFile(SOURCE, 'utf8');

const existing = await readdir(OUT_DIR).catch(() => null);
if (existing && existing.some((name) => name.endsWith('.md'))) {
  console.log(`checkpoints/ already contains ${existing.filter((n) => n.endsWith('.md')).length} file(s); nothing to do.`);
  process.exit(0);
}

await mkdir(OUT_DIR, { recursive: true });

const lines = source.split(/\r?\n/);
const headings = [];
let inFence = false;

lines.forEach((line, index) => {
  if (/^\s*```/.test(line)) {
    inFence = !inFence;
    return;
  }
  if (inFence) return;
  const match = /^##\s+(.+?)\s*$/.exec(line);
  if (match) headings.push({ index, text: match[1] });
});

const sections = headings
  .map((heading, i) => ({
    text: heading.text,
    body: lines
      .slice(heading.index, i + 1 < headings.length ? headings[i + 1].index : lines.length)
      .join('\n')
      .replace(/\n+-{3,}\s*$/, '')
      .trimEnd(),
  }))
  .filter((section) => /^[\w-]+\s+—/.test(section.text)); // skip non-checkpoint sections (e.g. quick triage)

let written = 0;
for (const section of sections) {
  const id = section.text.split('—')[0].trim();
  const body = section.body.replace(/^##\s+/, '# ');
  await writeFile(join(OUT_DIR, `${id}.md`), `${body}\n`, 'utf8');
  written += 1;
}

console.log(`Wrote ${written} checkpoint file(s) to checkpoints/`);
