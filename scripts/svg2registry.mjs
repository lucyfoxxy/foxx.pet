#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = process.argv[2] ?? 'src/icons/raw';
const OUT = process.argv[3] ?? 'src/icons/registry.generated.ts';

// sehr einfache Normalisierung: fill/stroke → currentColor, width/height/transform am <svg> ignorieren
const coerceColor = (s) =>
  s
    .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"');

const extract = (svg) => {
  const vbMatch = svg.match(/viewBox="([^"]+)"/i);
  if (!vbMatch) throw new Error('Kein viewBox gefunden');
  const viewBox = vbMatch[1];

  // Inhalt zwischen <svg>…</svg>
  const body = svg
    .replace(/^[\s\S]*?<svg[^>]*>/i, '')
    .replace(/<\/svg>\s*$/i, '')
    .trim();

  return { viewBox, body: coerceColor(body) };
};

const toConstName = (file) =>
  path.basename(file).replace(/\.svg$/i, '').replace(/[^a-z0-9/_-]/gi, '').replace(/\s+/g, '-');

const run = async () => {
  const files = (await fs.readdir(SRC)).filter((f) => f.toLowerCase().endsWith('.svg'));
  const items = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(SRC, f), 'utf8');
    try {
      const { viewBox, body } = extract(raw);
      items.push({ name: toConstName(f), viewBox, body });
    } catch (e) {
      console.warn(`⚠️  ${f}: ${e.message}`);
    }
  }

  items.sort((a, b) => a.name.localeCompare(b.name));

  const out = `// AUTO-GENERATED. Do not edit.
export const registry = {
${items
  .map(
    (i) => `  "${i.name}": {
    vb: ${JSON.stringify(i.viewBox)},
    body: ${JSON.stringify(i.body)},
  }`
  )
  .join(',\n')}
} as const;
`;

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, out, 'utf8');
  console.log(`✅ registry written to ${OUT} (${items.length} icons)`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
