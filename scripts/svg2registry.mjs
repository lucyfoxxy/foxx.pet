#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_SRC = 'src/icons/raw';
const DEFAULT_OUT = 'src/icons/registry.generated.ts';

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

const isUrl = (s) => /^https?:\/\//i.test(s);

const fetchSvg = async (url) => {
  if (typeof fetch !== 'function') {
    throw new Error('URL-Modus benötigt Node 18+ (global fetch).');
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fehler beim Laden von ${url}: HTTP ${res.status}`);
  }
  return await res.text();
};

const loadSvg = async (input) => {
  if (isUrl(input)) {
    return fetchSvg(input);
  }
  return fs.readFile(input, 'utf8');
};

const getBaseName = (input) => {
  if (isUrl(input)) {
    const u = new URL(input);
    const base = path.basename(u.pathname);
    return base || 'icon.svg';
  }
  return path.basename(input);
};

/**
 * Registry-Datei aktualisieren: neuen Eintrag vor `} as const;` einfügen.
 */
const updateRegistryFile = async (registryPath, iconName, viewBox, body) => {
  const file = path.resolve(registryPath);
  let content;
  try {
    content = await fs.readFile(file, 'utf8');
  } catch (e) {
    console.error(`⚠️  Konnte Registry-Datei nicht lesen: ${file} (${e.message})`);
    return;
  }

  if (content.includes(`"${iconName}": {`)) {
    console.warn(`⚠️  Icon "${iconName}" existiert bereits in ${file} – überspringe Eintrag.`);
    return;
  }

  const marker = '} as const;';
  const idxMarker = content.lastIndexOf(marker);
  if (idxMarker === -1) {
    console.error(
      `⚠️  Konnte "export const registry = { ... } as const;" in ${file} nicht finden.`
    );
    return;
  }

  const idxBrace = idxMarker; // '}' der Registry
  const before = content.slice(0, idxBrace);
  const after = content.slice(idxBrace);

  const beforeTrimmed = before.trimEnd();
  const lastChar = beforeTrimmed ? beforeTrimmed[beforeTrimmed.length - 1] : '{';

  // Wenn direkt nach '{' oder nach ',' → kein führendes Komma nötig
  // Sonst brauchen wir eins vor dem neuen Eintrag
  let prefix;
  if (lastChar === '{' || lastChar === ',') {
    prefix = '\n  ';
  } else {
    prefix = ',\n  ';
  }

  const entry = `"${iconName}": {\n    vb: ${JSON.stringify(
    viewBox
  )},\n    body: ${JSON.stringify(body)},\n  },\n`;

  const updated = before + prefix + entry + after;

  await fs.writeFile(file, updated, 'utf8');
  console.log(`✅ Registry aktualisiert: ${file} (Icon "${iconName}" hinzugefügt)`);
};

/**
 * Modus 1: Ordner → komplette Registry (alter Modus, nur gekapselt).
 */
const runDirMode = async (srcDir, outFile) => {
  const files = (await fs.readdir(srcDir)).filter((f) => f.toLowerCase().endsWith('.svg'));
  const items = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(srcDir, f), 'utf8');
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
  },`
  )
  .join('\n')}
} as const;
`;

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, out, 'utf8');
  console.log(`✅ registry written to ${outFile} (${items.length} icons)`);
};

/**
 * Modus 2: Einzelnes SVG (URL oder Datei).
 * - Normalisierte SVG-Datei schreiben
 * - Ergebnis + Registry-Snippet ins Terminal
 * - Optional: Registry-Datei aktualisieren
 */
const runSingleSvg = async (input, svgOutPath, registryPath) => {
  const sourceLabel = isUrl(input) ? 'URL' : 'Datei';
  const svg = await loadSvg(input);
  const { viewBox, body } = extract(svg);

  const baseName = getBaseName(input);
  const iconName = toConstName(baseName);

  const normalizedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
${body}
</svg>
`;

  let outPathResolved;
  if (svgOutPath) {
    outPathResolved = path.resolve(svgOutPath);
  } else {
    const stem = baseName.toLowerCase().endsWith('.svg')
      ? baseName.slice(0, -4)
      : baseName;
    const dir = isUrl(input) ? process.cwd() : path.dirname(path.resolve(input));
    outPathResolved = path.join(dir, `${stem}.svg.converted`);
  }

  await fs.mkdir(path.dirname(outPathResolved), { recursive: true });
  await fs.writeFile(outPathResolved, normalizedSvg, 'utf8');

  console.log(`✅ SVG aus ${sourceLabel} "${input}" normalisiert.`);
  console.log(`   → gespeichert als: ${outPathResolved}`);

  console.log('\n// --- Normalized SVG ---');
  console.log(normalizedSvg);

  const registryEntry = `  "${iconName}": {
    vb: ${JSON.stringify(viewBox)},
    body: ${JSON.stringify(body)},
  },`;
  console.log('\n// --- Registry entry ---');
  console.log(registryEntry);

  if (registryPath) {
    await updateRegistryFile(registryPath, iconName, viewBox, body);
  }
};

const run = async () => {
  const args = process.argv.slice(2);

  let input = null;
  let out = null;
  let registry = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--registry' || arg === '-r') {
      registry = args[++i];
    } else if (arg === '--out' || arg === '-o') {
      out = args[++i];
    } else if (!input) {
      input = arg;
    } else if (!out) {
      out = arg;
    } else {
      console.warn(`⚠️  Ignoriere zusätzliches Argument: ${arg}`);
    }
  }

  // Kein Input → alter Verzeichnismodus mit Defaults
  if (!input) {
    await runDirMode(DEFAULT_SRC, out || DEFAULT_OUT);
    return;
  }

  // URL?
  if (isUrl(input)) {
    await runSingleSvg(input, out, registry);
    return;
  }

  // Lokaler Pfad: prüfen ob Datei oder Verzeichnis
  let stats;
  try {
    stats = await fs.stat(input);
  } catch (e) {
    throw new Error(
      `Eingabe "${input}" ist weder URL noch existierender Pfad: ${e.message}`
    );
  }

  if (stats.isDirectory()) {
    await runDirMode(input, out || DEFAULT_OUT);
  } else {
    await runSingleSvg(input, out, registry);
  }
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
