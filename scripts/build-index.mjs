// Generate checkpoints.json from checkpoints/*.md + routing.md.
// Generated file: never hand-edit checkpoints.json.
//
// Usage: node scripts/build-index.mjs [--check]
//   --check  exit 1 if the committed file is out of date (used by CI)
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'checkpoints.json');
const CHECK = process.argv.includes('--check');

const readTitle = (markdown) => {
  const match = /^#\s+(.+?)\s*$/m.exec(markdown);
  if (!match) return null;
  const [id, ...rest] = match[1].split('—');
  return { id: id.trim(), title: rest.join('—').trim() };
};

const readMeta = (markdown) => {
  const fence = /^```yaml\s*\n([\s\S]*?)\n```/m.exec(markdown);
  if (!fence) return null;
  const meta = {};
  for (const line of fence[1].split(/\r?\n/)) {
    const entry = /^([a-z-]+):\s*(.*)$/.exec(line.trim());
    if (entry) meta[entry[1]] = entry[2].trim();
  }
  return meta;
};

const files = (await readdir(join(ROOT, 'checkpoints')))
  .filter((name) => name.endsWith('.md'))
  .sort();

const checkpoints = [];
for (const file of files) {
  const markdown = await readFile(join(ROOT, 'checkpoints', file), 'utf8');
  const heading = readTitle(markdown);
  const meta = readMeta(markdown);
  const id = file.replace(/\.md$/, '');

  if (!heading || heading.id !== id) {
    throw new Error(`${file}: top heading id "${heading?.id}" does not match file name "${id}"`);
  }
  if (!meta || meta.id !== id) {
    throw new Error(`${file}: yaml block id "${meta?.id}" does not match file name "${id}"`);
  }

  checkpoints.push({
    id,
    title: heading.title,
    owner: meta.owner,
    status: meta.status,
    devtoolsOnly: meta['devtools-only'] === 'true',
    passBar: meta.pass_bar,
    file: `checkpoints/${file}`,
    insights: [],
  });
}

// Reverse-route insights from routing.md into their checkpoints.
const routing = await readFile(join(ROOT, 'routing.md'), 'utf8');
const byId = new Map(checkpoints.map((checkpoint) => [checkpoint.id, checkpoint]));
for (const line of routing.split(/\r?\n/)) {
  const row = /^\|\s*`([^`]+)`\s*\|\s*([\w-]+)\s*\|$/.exec(line);
  if (!row) continue;
  const target = byId.get(row[2]);
  if (!target) throw new Error(`routing.md references unknown checkpoint "${row[2]}"`);
  if (!target.insights.includes(row[1])) target.insights.push(row[1]);
}
for (const checkpoint of checkpoints) checkpoint.insights.sort();

const payload = {
  generatedBy: 'scripts/build-index.mjs',
  note: 'Generated file. Run `node scripts/build-index.mjs` after editing checkpoints/ or routing.md.',
  count: checkpoints.length,
  checkpoints,
};

const serialized = `${JSON.stringify(payload, null, 2)}\n`;

if (CHECK) {
  const current = await readFile(OUT, 'utf8').catch(() => null);
  if (current?.replace(/\r\n/g, '\n') !== serialized) {
    console.error('checkpoints.json is out of date. Run: node scripts/build-index.mjs');
    process.exit(1);
  }
  console.log(`checkpoints.json is up to date (${checkpoints.length} checkpoints).`);
} else {
  await writeFile(OUT, serialized, 'utf8');
  console.log(`Wrote checkpoints.json (${checkpoints.length} checkpoints).`);
}
