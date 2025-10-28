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
const KEYWORDS = ['suitwalk', 'furmeet', 'convention', 'artworks'];
const DISPLAY_KEYWORDS = KEYWORDS.map((kw) =>
  kw.replace(/^./, (c) => c.toUpperCase())
);
const CATEGORY_CONFIG = new Map([
  [
    'suitwalk',
    {
      areaSlug: 'paws',
      category: { name: 'Suitwalks', slug: 'suitwalks' },
      slugPrefix: 'suitwalks'
    }
  ],
  [
    'furmeet',
    {
      areaSlug: 'paws',
      category: { name: 'Furmeets', slug: 'furmeets' },
      slugPrefix: 'furmeets'
    }
  ],
  [
    'convention',
    {
      areaSlug: 'paws',
      category: { name: 'Conventions', slug: 'conventions' },
      slugPrefix: 'conventions'
    }
  ],
  [
    'artworks',
    {
      areaSlug: 'frames',
      categoryResolver: ({ rawTitle, displayTitle }) => {
        const name = displayTitle || rawTitle || 'Artworks';
        const slug = slugify(name) || 'artworks';
        return { name, slug };
      },
      slugPrefix: 'frames'
    }
  ]
]);
const BESTOF_LINK_ID = (process.env.IMMICH_BESTOF_SHARED_LINK || '').trim();

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
    const albumTargets = PATHS.albumDataRoots?.join(', ') ?? '';
    console.log(`   entries: ${albumTargets}`);
  }

  const { map: sharedLinkMap, links: sharedLinks } = await listRelevantSharedLinks();
  const albums = await listRelevantAlbums();

  const albumEntries = [];
  let grandTotal = 0;
  for (const album of albums) {
    const sharedLink = sharedLinkMap.get(album.id);
    if (!sharedLink) {
      console.warn(
        `⚠️  Missing shared link for album ${album.albumName} (${album.id}). Skipping.`
      );
      continue;
    }
    const assets = await getAssetsCached(album.id);
    albumEntries.push({
      album,
      assets,
      shareKey: sharedLink.key,
      shareLinkId: sharedLink.linkId
    });
    grandTotal += assets.length;
  }

  let bestOfEntry = null;
  if (BESTOF_LINK_ID) {
    const bestOfShare = resolveBestOfShareLink({
      linkId: BESTOF_LINK_ID,
      sharedLinks
    });
    if (!bestOfShare) {
      console.warn(
        `⚠️  Missing shared link for Best Of selection (${BESTOF_LINK_ID}). Skipping.`
      );
    } else if (!bestOfShare.albumId) {
      console.warn(
        `⚠️  Best Of shared link (${BESTOF_LINK_ID}) is not associated with an album. Skipping.`
      );
    } else {
      const bestOfAlbum = await fetchAlbumInfo(bestOfShare.albumId);
      const assets = await getAssetsCached(bestOfShare.albumId);
      bestOfEntry = {
        album: bestOfAlbum,
        assets,
        metaOverride: createBestOfMeta(bestOfAlbum),
        shareKey: bestOfShare.key,
        shareLinkId: bestOfShare.linkId
      };
      grandTotal += assets.length;
    }
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
      shareKey: entry.shareKey,
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
      shareKey: bestOfEntry.shareKey,
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
  shareKey = null,
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
  const albumDataRoots = Array.isArray(paths.albumDataRoots) && paths.albumDataRoots.length > 0
    ? paths.albumDataRoots
    : paths.albumData
    ? [paths.albumData]
    : [];
  const albumDataTargets = albumDataRoots.map((root) => ({
    root,
    dir: path.join(root, ...meta.dataDirSegments),
    file: path.join(root, ...meta.dataDirSegments, `${meta.dataFileName}.json`)
  }));

  let mode = await assetStrategy.resolve(albumAssets[0]?.id ?? null, shareKey);
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
        items.push(createRemoteAssetItem({ asset, baseUrl, shareKey }));
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

  for (const target of albumDataTargets) {
    await fs.mkdir(target.dir, { recursive: true });
    await writeAlbumIndex({
      filePath: target.file,
      meta,
      mode,
      items,
      shareKey,
      album
    });
  }

  await cleanupLegacyAlbumData({
    meta,
    targets: albumDataTargets
  });

  if (!QUIET) {
    console.log(`\n\n✓ ${meta.slug}: ${items.length}/${totalAlbum} assets processed (${mode})`);
  }

  return { slug: meta.slug, mode };
}

async function writeAlbumIndex({ filePath, meta, mode, items, shareKey, album }) {
  const albumInfo = {
    startDate: toIsoString(album?.startDate ?? '1970-01-01T00:00:00.000Z'),
    description: album?.description ?? null,
    albumThumbnailAssetId: album?.albumThumbnailAssetId ?? '0000-0000-0000-0000-00000000'
  };
  const index = {
    slug: meta.slug,
    albumId: meta.albumId,
    shareKey: shareKey,
    albumName: meta.albumName,
    title: meta.title,
    startDate: albumInfo.startDate,
    description: albumInfo.description,
    albumThumbnailAssetId: albumInfo.albumThumbnailAssetId,
    category: meta.category,
    assetMode: mode,
    count: items.length,
    
    items
  };
  await fs.writeFile(filePath, JSON.stringify(index, null, 2), 'utf-8');
}

async function cleanupLegacyAlbumData({ meta, targets }) {
  if (!meta || !Array.isArray(targets) || targets.length === 0) return;

  const keep = new Set();
  for (const target of targets) {
    if (!target || !target.file) continue;
    keep.add(path.normalize(target.file));
  }

  for (const target of targets) {
    if (!target || !target.root) continue;
    const candidates = createLegacyAlbumDataCandidates(target.root, meta);
    for (const candidate of candidates) {
      if (!candidate) continue;
      const normalized = path.normalize(candidate);
      if (keep.has(normalized)) continue;
      await removeFileIfExists(normalized);
    }
  }
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

async function listRelevantSharedLinks() {
  const response = await fetch(`${BASE}/api/shared-links`, {
    headers: { 'x-api-key': KEY },
    dispatcher: FETCH_AGENT
  });
  if (!response.ok) {
    throw new Error(`SHARED LINK LIST ${response.status}`);
  }
  const links = (await response.json()) ?? [];
  const map = new Map();
  for (const link of links) {
    if (!link || link.type !== 'ALBUM') continue;
    if (!link.userId || link.userId !== OWNER_ID) continue;
    if (!link.album || typeof link.album.albumName !== 'string') continue;
    const albumId = link.album?.id ?? link.albumId;
    if (!albumId) continue;
    const lower = link.album.albumName.toLowerCase();
    if (!KEYWORDS.some((keyword) => lower.includes(keyword))) continue;
    if (!link.key) continue;
    map.set(albumId, { key: link.key, linkId: link.id ?? null });
  }
  return { map, links };
}

function resolveBestOfShareLink({ linkId, sharedLinks }) {
  if (!linkId) return null;
  const match = sharedLinks.find((link) => {
    if (!link) return false;
    if (link.userId && link.userId !== OWNER_ID) return false;
    if (link.id && link.id === linkId) return true;
    if (link.key && link.key === linkId) return true;
    return false;
  });
  if (!match) return null;
  const albumId = match.album?.id ?? match.albumId ?? null;
  const key = match.key ?? null;
  const linkUuid = match.id ?? null;
  return { albumId, key, linkId: linkUuid };
}

function createAssetStrategy({ baseUrl, preferredMode, quiet }) {
  const normalized = normalizeMode(preferredMode);
  let resolved = normalized ?? null;
  let tested = Boolean(normalized);
  let noticeShown = Boolean(normalized);

  return {
    async resolve(sampleAssetId, shareKey) {
      if (resolved) return resolved;
      if (!tested && sampleAssetId) {
        tested = true;
        const accessible = await checkRemoteAccess(baseUrl, sampleAssetId, shareKey);
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

function createRemoteAssetItem({ asset, baseUrl, shareKey }) {
  if (!shareKey) {
    throw new Error('Missing share key for remote asset item');
  }
  const keyParam = `?key=${encodeURIComponent(shareKey)}`;
  return {
    id: asset.id,
    thumb: `${baseUrl}/api/assets/${asset.id}/thumbnail${keyParam}`,
    full: `${baseUrl}/api/assets/${asset.id}/original${keyParam}`,
    filename: asset.originalFileName,
    width: asset.exifInfo?.exifImageWidth ?? null,
    height: asset.exifInfo?.exifImageHeight ?? null,
    shareKey: shareKey ?? null
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
  const contentRoot = path.join(srcRoot, 'content');
  return {
    repoRoot,
    appRoot,
    srcRoot,
    assetsPath: path.join(srcRoot, 'assets', 'albums'),
    albumDataRoots: Array.from(
      new Set([path.join(contentRoot, 'album'), path.join(contentRoot, 'albums')])
    ),
    envFile: path.join(appRoot, '.env')
  };
}


function normalizeMode(value) {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === 'remote' || normalized === 'download') return normalized;
  return null;
}

async function checkRemoteAccess(baseUrl, assetId, shareKey) {
  if (!assetId || !shareKey) return false;
  const url = `${baseUrl}/api/assets/${assetId}/thumbnail?key=${encodeURIComponent(
    shareKey
  )}`;
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

async function removeFileIfExists(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

function createLegacyAlbumDataCandidates(root, meta) {
  const candidates = new Set();
  if (!root || !meta) return candidates;

  const segments = Array.isArray(meta.dataDirSegments) ? meta.dataDirSegments.filter(Boolean) : [];
  const fileName = `${meta.dataFileName}.json`;

  if (segments.length > 0) {
    const withoutLast = segments.slice(0, -1);
    if (withoutLast.length > 0) {
      candidates.add(path.join(root, ...withoutLast, fileName));
    }
  }

  candidates.add(path.join(root, fileName));

  return Array.from(candidates);
}

function deriveAlbumMeta(album) {
  if (!album || typeof album.albumName !== 'string') return null;
  const lower = album.albumName.toLowerCase();
  const keyword = KEYWORDS.find((kw) => lower.includes(kw));
  if (!keyword) return null;
  const config = CATEGORY_CONFIG.get(keyword);
  if (!config) return null;

  const nameParts = album.albumName.split(':');
  const rawTitle =
    nameParts.length > 1
      ? nameParts.slice(1).join(':').trim()
      : album.albumName.trim();
  const displayTitle = createDisplayTitle(rawTitle);
  const normalizedTitleRaw = displayTitle || rawTitle || album.albumName.trim();
  const normalizedTitle =
    normalizedTitleRaw && normalizedTitleRaw.trim().length
      ? normalizedTitleRaw.trim()
      : album.albumName.trim() || 'Untitled';

  const resolvedCategory =
    typeof config.categoryResolver === 'function'
      ? config.categoryResolver({ album, rawTitle, displayTitle: normalizedTitle })
      : config.category;

  const candidateCategoryName =
    resolvedCategory?.name ??
    config.category?.name ??
    keyword.replace(/^./, (c) => c.toUpperCase()) + 's';
  const categoryName =
    candidateCategoryName && candidateCategoryName.trim().length
      ? candidateCategoryName.trim()
      : 'Galleries';
  const fallbackCategorySlug = slugify(categoryName) || slugify(keyword) || 'album';
  const categorySlug =
    (resolvedCategory?.slug && resolvedCategory.slug.trim()) ||
    (config.category?.slug && config.category.slug.trim()) ||
    fallbackCategorySlug;

  const areaSlug = config.areaSlug ?? 'albums';
  const slugParts = [config.slugPrefix ?? categorySlug ?? slugify(keyword), rawTitle]
    .filter((part) => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim());
  const slug =
    slugify(slugParts.join(' ')) ||
    slugify(`${categorySlug}-${album.id}`) ||
    album.id;

  return {
    slug,
    albumId: album.id,
    albumName: album.albumName,
    title: normalizedTitle,
    rawTitle,
    category: { name: categoryName, slug: categorySlug },
    dataDirSegments: [areaSlug, categorySlug].filter(Boolean),
    dataFileName: slug,
    assetDirSegments: [areaSlug, categorySlug, slug].filter(Boolean)
  };
}



function createBestOfMeta(album) {
  const title = album?.albumName?.trim() || 'Best Of';
  return {
    slug: 'bestof',
    albumId: album?.id ?? BESTOF_LINK_ID,
    albumName: album?.albumName ?? 'Best Of',
    title,
    rawTitle: title,
    category: { name: 'Highlights', slug: 'bestof' },
    dataDirSegments: [],
    dataFileName: 'bestof',
    assetDirSegments: ['bestof']
  };
}

function createDisplayTitle(value) {
  if (!value || typeof value !== 'string') return value;
  let result = value.trim();

  if (result) {
    const leadingPattern = new RegExp(
      `^\\s*(?:${DISPLAY_KEYWORDS.join('|')})\\b(?:[\\s:–—-]+)*`,
      'i'
    );
    result = result.replace(leadingPattern, '').trim();
  }

  if (result) {
    const trailingDatePattern = /\s*\((?:[^\d()]*?)\s+\d{4}\)\s*$/u;
    if (trailingDatePattern.test(result)) {
      result = result.replace(trailingDatePattern, '').trim();
    }
  }

  if (!result) {
    return value.trim();
  }

  return result;
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

function toIsoString(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}