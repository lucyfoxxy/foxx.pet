import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { Agent } from 'undici';
import 'dotenv/config';
// ──────────────────────────────────────────────────────────────────────────────
// Configuration ----------------------------------------------------------------

const { target: TARGET, quiet: QUIET, mode: REQUESTED_MODE } = parseCliArgs(
  process.argv.slice(2)
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const PATHS = createPathConfig(REPO_ROOT, TARGET);

const BASE = process.env.IMMICH_BASE_URL || process.env.IMMICH_URL;
const KEY = process.env.IMMICH_API_KEY;
const OWNER_ID = 'd3e4dd84-d590-4c98-b2d1-07ed6811a693';
const KEYWORDS = ['suitwalk', 'furmeet', 'convention'];
const CATEGORY_MAP = new Map([
  ['suitwalk', { name: 'Suitwalks', slug: 'suitwalks' }],
  ['furmeet', { name: 'Furmeets', slug: 'furmeets' }],
  ['convention', { name: 'Conventions', slug: 'conventions' }]
]);
const BESTOF_ID = (process.env.IMMICH_BESTOF_ALBUM || '').trim();

if (!['dev', 'prod'].includes(TARGET)) {
  console.error(`Invalid TARGET "${TARGET}". Exiting.`);
  process.exit(1);
}
if (!BASE || !KEY) {
  console.error('.env not found, exiting:', {
    BASE,
    hasKEY: Boolean(KEY)
  });
  process.exit(1);
}

const PREFERRED_MODE =
  (process.env.IMMICH_FETCH_MODE || '').trim().toLowerCase() || REQUESTED_MODE;
const FETCH_AGENT = new Agent({ connect: { family: 4 } });
const CLR = '\x1b[2K';
const UP1 = '\x1b[1A';
let barsActive = false;


function barsInit() {
  if (!process.stdout.isTTY || barsActive) return;
  process.stdout.write('\n\n');
  process.stdout.write(UP1 + UP1);
  barsActive = true;
}
function barsUpdate({ slug, albumCurrent, albumTotal, allCurrent, allTotal }) {
  if (!process.stdout.isTTY) return;
  if (!barsActive) barsInit();
  const pct = (c, t) => (t ? Math.floor((c / t) * 100) : 100);
  const bar = (p, w = 28) =>
    '█'.repeat(Math.floor((p * w) / 100)).padEnd(w, '░');
  const pad = (s, w = 16) => String('['+s+']').padEnd(w, ' ');

  const pctAll = pct(allCurrent, allTotal);
  const pctAlbum = pct(albumCurrent, albumTotal);
  const lineAll = `🔄 [TOTAL]          [${bar(pctAll)}] ${String(pctAll).padStart(
    3
  )}% (${allCurrent}/${allTotal})`;
  const lineCur = `🔄 ${pad(slug)} [${bar(pctAlbum)}] ${String(
    pctAlbum
  ).padStart(3)}% (${albumCurrent}/${albumTotal})`;

  process.stdout.write('\r' + CLR + lineAll + '\n' + CLR + lineCur);
  process.stdout.write(UP1);
 

}
function barsRelease() {
  if (!process.stdout.isTTY || !barsActive) return;
  process.stdout.write('\n\n');
  
  barsActive = false;
}

const assetsCache = new Map();
function getAssetsCached(id) {
  if (!assetsCache.has(id)) assetsCache.set(id, listAssets(id));
  return assetsCache.get(id);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main workflow ----------------------------------------------------------------

async function main() {
  await fs.mkdir(PATHS.srcRoot, { recursive: true });
  if (!QUIET) {
    console.log(`→ fetch-immich target: ${TARGET}`);
    console.log(`   assets:   ${PATHS.assetsPath}`);
    console.log(`   entries: ${PATHS.albumData}`);
  }

  const albums = await listRelevantAlbums();

  const albumEntries = [];
  let grandTotal = 0;
  for (const album of albums) {
    const assets = await getAssetsCached(album.id);
    albumEntries.push({ album, assets });
    grandTotal += assets.length;
  }

  let bestOfEntry = null;
  if (BESTOF_ID) {
    const bestOfAlbum = await fetchAlbumInfo(BESTOF_ID);
    const assets = await getAssetsCached(BESTOF_ID);
    bestOfEntry = { album: bestOfAlbum, assets, metaOverride: createBestOfMeta(bestOfAlbum) };
    grandTotal += assets.length;
  }

  if (albumEntries.length === 0 && !bestOfEntry) {
    console.log('No matching albums found. Nothing to do.');
    return;
  }

  const counters = { processedAll: 0, grandTotal };
  const assetStrategy = createAssetStrategy({
    baseUrl: BASE,
    preferredMode: PREFERRED_MODE,
    quiet: QUIET
  });

  for (const entry of albumEntries) {
    await processAlbum({
      album: entry.album,
      assets: entry.assets,
      counters,
      paths: PATHS,
      baseUrl: BASE,
      assetStrategy
    });
    if (QUIET) await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  if (bestOfEntry) {
    await processAlbum({
      album: bestOfEntry.album,
      assets: bestOfEntry.assets,
      counters,
      paths: PATHS,
      baseUrl: BASE,
      assetStrategy,
      metaOverride: bestOfEntry.metaOverride
    });
  }

  barsRelease();
}

main().catch((error) => {
  console.error('[fetch-immich] ERROR', error);
  process.exit(1);
});

process.on('exit', () => {
  FETCH_AGENT.close();
});

// ──────────────────────────────────────────────────────────────────────────────
// Album processing -------------------------------------------------------------

async function processAlbum({
  album,
  assets = null,
  counters,
  paths,
  baseUrl,
  assetStrategy,
  metaOverride = null
}) {
  const meta = metaOverride ?? deriveAlbumMeta(album);
  if (!meta) {
    if (!QUIET) {
      console.log(`⏭  Skipping album without matching keyword: ${album.albumName}`);
    }
    return null;
  }

  const albumAssets = assets ?? (await listAssets(album.id));
  const totalAlbum = albumAssets.length;

  const assetDir = path.join(paths.assetsPath, ...meta.assetDirSegments);
  const assetPrefix = joinPosix('albums', ...meta.assetDirSegments);
  const albumDataDir = path.join(paths.albumData, ...meta.dataDirSegments);
  const albumDataFile = path.join(albumDataDir, `${meta.dataFileName}.json`);

  let mode = await assetStrategy.resolve(albumAssets[0]?.id ?? null);
  if (!mode) mode = 'download';

  if (mode === 'remote') {
    await removeDirectory(assetDir);
  } else {
    await fs.mkdir(assetDir, { recursive: true });
    const removed = await pruneRemovedFiles(
      assetDir,
      albumAssets.map((asset) => asset.id)
    );
    if (removed && !QUIET) {
      console.log(`• ${meta.slug}: removed ${removed} stale file(s)`);
    }
  }

  barsUpdate({
    slug: meta.slug,
    albumCurrent: 0,
    albumTotal: totalAlbum,
    allCurrent: counters.processedAll,
    allTotal: counters.grandTotal
  });

  const items = [];

  for (let i = 0; i < totalAlbum; i += 1) {
    const asset = albumAssets[i];
    try {
      if (mode === 'remote') {
        items.push(createRemoteAssetItem({ asset, baseUrl }));
      } else {
        const { thumbName, fullName } = await ensureAssetVariants({
          asset,
          outDir: assetDir,
          baseUrl
        });
        items.push({
          id: asset.id,
          thumb: joinPosix(assetPrefix, thumbName),
          full: joinPosix(assetPrefix, fullName),
          filename: asset.originalFileName,
          width: asset.exifInfo?.exifImageWidth ?? null,
          height: asset.exifInfo?.exifImageHeight ?? null
        });
      }
    } catch (error) {
      console.warn(`[asset fail] ${meta.slug}/${asset.id}:`, error.message);
    }

    counters.processedAll += 1;

    barsUpdate({
      slug: meta.slug,
      albumCurrent: i + 1,
      albumTotal: totalAlbum,
      allCurrent: counters.processedAll,
      allTotal: counters.grandTotal
    });
  }

  await fs.mkdir(albumDataDir, { recursive: true });
  await writeAlbumIndex({
    filePath: albumDataFile,
    meta,
    mode,
    items
  });

  if (!QUIET) {
    console.log(`\n\n✓ ${meta.slug}: ${items.length}/${totalAlbum} assets processed (${mode})`);
  }

  return { slug: meta.slug, mode };
}

async function writeAlbumIndex({ filePath, meta, mode, items }) {
  const index = {
    slug: meta.slug,
    albumId: meta.albumId,
    albumName: meta.albumName,
    title: meta.title,
    category: meta.category,
    assetMode: mode,
    count: items.length,
    items
  };
  await fs.writeFile(filePath, JSON.stringify(index, null, 2), 'utf-8');
}

async function listRelevantAlbums() {
  const response = await fetch(`${BASE}/api/albums`, {
    headers: { 'x-api-key': KEY },
    dispatcher: FETCH_AGENT
  });
  if (!response.ok) {
    throw new Error(`ALBUM LIST ${response.status}`);
  }
  const albums = (await response.json()) ?? [];
  return albums
    .filter((album) => {
      if (!album || typeof album.albumName !== 'string') return false;
      const ownerOk =
        (album.ownerId && album.ownerId === OWNER_ID) ||
        album.owner?.name === 'Lucy Foxx';
      if (!ownerOk) return false;
      const lower = album.albumName.toLowerCase();
      return KEYWORDS.some((keyword) => lower.includes(keyword));
    })
    .sort((a, b) => {
      const aDate = Date.parse(a.startDate || a.createdAt || '');
      const bDate = Date.parse(b.startDate || b.createdAt || '');
      if (Number.isNaN(aDate) && Number.isNaN(bDate)) return 0;
      if (Number.isNaN(aDate)) return 1;
      if (Number.isNaN(bDate)) return -1;
      return bDate - aDate;
    });
}

async function fetchAlbumInfo(albumId) {
  const response = await fetch(`${BASE}/api/albums/${albumId}`, {
    headers: { 'x-api-key': KEY },
    dispatcher: FETCH_AGENT
  });
  if (!response.ok) {
    throw new Error(`ALBUM INFO ${albumId} → ${response.status}`);
  }
  return response.json();
}

function createAssetStrategy({ baseUrl, preferredMode, quiet }) {
  const normalized = normalizeMode(preferredMode);
  let resolved = normalized ?? null;
  let tested = Boolean(normalized);
  let noticeShown = Boolean(normalized);

  return {
    async resolve(sampleAssetId) {
      if (resolved) return resolved;
      if (!tested && sampleAssetId) {
        tested = true;
        const accessible = await checkRemoteAccess(baseUrl, sampleAssetId);
        resolved = accessible ? 'remote' : 'download';
        if (!noticeShown && !quiet) {
          const message = accessible
            ? 'ℹ️ Remote Immich assets are publicly accessible. Using live URLs.'
            : 'ℹ️ Remote Immich assets require authentication. Falling back to downloading 1920x1080 variants.';
          console.log(message);
        }
        noticeShown = true;
        return resolved;
      }
      if (!tested && !sampleAssetId) {
        return resolved ?? 'download';
      }
      return resolved ?? normalized ?? 'download';
    },
    getMode() {
      return resolved ?? normalized ?? null;
    }
  };
}

function createRemoteAssetItem({ asset, baseUrl }) {
  return {
    id: asset.id,
    thumb: `${baseUrl}/api/assets/${asset.id}/thumbnail`,
    full: `${baseUrl}/api/assets/${asset.id}/original`,
    filename: asset.originalFileName,
    width: asset.exifInfo?.exifImageWidth ?? null,
    height: asset.exifInfo?.exifImageHeight ?? null
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// API helpers ------------------------------------------------------------------

async function fetchAlbum(albumId, page = 1, size = 500) {
  const url = `${BASE}/api/albums/${albumId}?withAssets=true&assetPagination[page]=${page}&assetPagination[size]=${size}`;
  const response = await fetch(url, {
    headers: { 'x-api-key': KEY },
    dispatcher: FETCH_AGENT
  });
  if (!response.ok) throw new Error(`ALBUM ${response.status}`);
  return response.json();
}

async function listAssets(albumId) {
  const all = [];
  let page = 1;
  for (;;) {
    const data = await fetchAlbum(albumId, page, 500);
    const items = Array.isArray(data.assets) ? data.assets : [];
    all.push(...items);
    const totalItems =
      data.assetsPagination?.totalItems ?? data.totalItems ?? null;
    if (!totalItems || all.length >= totalItems || items.length === 0) break;
    page += 1;
  }
  return all;
}

async function downloadBuffer(url) {
  const response = await fetch(url, {
    headers: { 'x-api-key': KEY },
    dispatcher: FETCH_AGENT
  });
  if (!response.ok) throw new Error(`GET ${url} -> ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

// ──────────────────────────────────────────────────────────────────────────────
// File helpers -----------------------------------------------------------------

async function ensureAssetVariants({ asset, outDir, baseUrl }) {
  const baseId = asset.id;
  const thumbName = `thumb-${baseId}.webp`;
  const fullName = `full-${baseId}.webp`;
  const thumbPath = path.join(outDir, thumbName);
  const fullPath = path.join(outDir, fullName);

  const needThumb = !(await exists(thumbPath));
  const needFull = !(await exists(fullPath));

  if (needThumb || needFull) {
    const buffer = await downloadBuffer(
      `${baseUrl}/api/assets/${asset.id}/original`
    );
    await renderVariants({
      buffer,
      thumbPath,
      fullPath,
      needThumb,
      needFull
    });
  }

  return { thumbName, fullName };
}

async function renderVariants({ buffer, thumbPath, fullPath, needThumb, needFull }) {
  if (needThumb) {
    await sharp(buffer)
      .rotate()
      .resize({
        width: 196,
        height: 196,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ lossless: true })
      .toFile(thumbPath);
  }

  if (needFull) {
    await sharp(buffer)
      .rotate()
      .resize({
        width: 1920,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 90 })
      .toFile(fullPath);
  }
}

async function pruneRemovedFiles(outDir, validIds) {
  const keep = new Set(validIds.map((id) => String(id)));
  let removed = 0;
  try {
    const files = await fs.readdir(outDir);
    for (const file of files) {
      const match = file.match(/^(?:thumb|full)-(.+?)\.webp$/);
      if (!match) continue;
      const id = match[1];
      if (!keep.has(id)) {
        await fs.unlink(path.join(outDir, file));
        removed += 1;
      }
    }
  } catch {
    // Directory may not exist yet.
  }
  return removed;
}

async function exists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// CLI / utility helpers --------------------------------------------------------

function parseCliArgs(argv) {
  const args = { target: 'dev', quiet: false, mode: null };
  for (const entry of argv) {
    if (entry === '--quiet') args.quiet = true;
    else if (entry.startsWith('--target=')) {
      args.target = entry.split('=')[1]?.toLowerCase() ?? args.target;
    } else if (entry.startsWith('--mode=')) {
      args.mode = entry.split('=')[1]?.toLowerCase() ?? null;
    }
  }

  if (!argv.some((arg) => arg.startsWith('--target=')) && process.env.TARGET) {
    args.target = process.env.TARGET.toLowerCase();
  }

  return args;
}

function createPathConfig(repoRoot, target) {
  const appRoot = path.join(repoRoot, 'app', target);
  const srcRoot = path.join(appRoot, 'src');
  return {
    repoRoot,
    appRoot,
    srcRoot,
    assetsPath: path.join(srcRoot, 'assets', 'albums'),
    
    albumData: path.join(srcRoot, 'content', 'albumData'),
    envFile: path.join(appRoot, '.env')
  };
}


function normalizeMode(value) {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'remote' || normalized === 'download') return normalized;
  return null;
}

async function checkRemoteAccess(baseUrl, assetId) {
  const url = `${baseUrl}/api/assets/${assetId}/thumbnail`;
  try {
    const response = await fetch(url, { method: 'HEAD', dispatcher: FETCH_AGENT });
    return response.ok;
  } catch {
    return false;
  }
}

function joinPosix(...segments) {
  return segments
    .filter((segment) => typeof segment === 'string' && segment.length > 0)
    .join('/')
    .replace(/\/+/g, '/');
}

async function removeDirectory(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

function deriveAlbumMeta(album) {
  if (!album || typeof album.albumName !== 'string') return null;
  const lower = album.albumName.toLowerCase();
  const keyword = KEYWORDS.find((kw) => lower.includes(kw));
  if (!keyword) return null;
  const category = CATEGORY_MAP.get(keyword) ?? {
    name: keyword.replace(/^./, (c) => c.toUpperCase()) + 's',
    slug: slugify(keyword)
  };

  const nameParts = album.albumName.split(':');
  const title = nameParts.length > 1
    ? nameParts.slice(1).join(':').trim()
    : album.albumName.trim();

  const cleanCategory = sanitizeSegment(category.name) || 'Galleries';
  const cleanTitle = sanitizeSegment(title) || sanitizeSegment(album.albumName) || album.id;
  const slug = slugify(`${category.slug}-${title}`) || slugify(`${category.slug}-${album.id}`);

  return {
    slug,
    albumId: album.id,
    albumName: album.albumName,
    title,
    category: { name: category.name, slug: category.slug },
    dataDirSegments: [cleanCategory],
    dataFileName: cleanTitle,
    assetDirSegments: [category.slug, slug]
  };
}

function createBestOfMeta(album) {
  const title = album?.albumName?.trim() || 'Best Of';
  const cleanTitle = sanitizeSegment(title) || 'Best Of';
  return {
    slug: 'bestof',
    albumId: album?.id ?? BESTOF_ID,
    albumName: album?.albumName ?? 'Best Of',
    title,
    category: { name: 'Highlights', slug: 'bestof' },
    dataDirSegments: [],
    dataFileName: 'bestof',
    assetDirSegments: ['bestof']
  };
}

function sanitizeSegment(value) {
  if (!value || typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(/[\/:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\.+$/, '')
    .trim();
}

function slugify(value) {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
