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
const KEYWORDS = ['suitwalk', 'furmeet', 'convention', 'sfw','nsfw'];
const DISPLAY_KEYWORDS = KEYWORDS.map((kw) =>
  kw.replace(/^./, (c) => c.toUpperCase())
);
const CATEGORY_CONFIG = new Map([
  [
    'suitwalk',
    {
      section: 'paws',
      category: 'suitwalks'
    }
  ],
  [
    'furmeet',
    {
      section: 'paws',
      category: 'furmeets',
    }
  ],
  [
    'convention',
    {
      section: 'paws',
      category: 'conventions',
    }
  ],
  [
    'sfw',
    {
      section: 'frames',
      category: 'sfw',
    }
  ],
  [
    'nsfw',
    {
      section: 'frames',
      category: 'nsfw',
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
    if (!QUIET) console.log(`⏭  Skipping album without matching keyword: ${album.albumName}`);
    return null;
  }

  const albumAssets = assets ?? (await listAssets(album.id));
  const totalAlbum = albumAssets.length;

  const assetDir = path.join(paths.assetsPath, ...meta.assetDirSegments);
  const assetPrefix = joinPosix('albums', ...meta.assetDirSegments);

  // NEU: nur EIN Zielpfad
  const albumRoot = path.join(paths.srcRoot, 'content', 'album');
const section = meta.section ?? 'albums';
const category = meta.category ?? 'misc';
const dataDir = path.join(albumRoot, section, category);
const dataFile = path.join(dataDir, `${meta.dataFileName ?? meta.slug}.json`);


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
    if (removed && !QUIET) console.log(`• ${meta.slug}: removed ${removed} stale file(s)`);
  }

  barsUpdate({
    slug: meta.slug,
    albumCurrent: 0,
    albumTotal: totalAlbum,
    allCurrent: counters.processedAll,
    allTotal: counters.grandTotal
  });

  const items = [];

  for (let i = 0; i < totalAlbum; i++) {
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

  // NUR EIN WRITE, kein Array mehr
  await fs.mkdir(dataDir, { recursive: true });
  
  await writeAlbumIndex({
    filePath: dataFile,
    meta,
    mode,
    items,
    shareKey,
    album
  });
}


async function writeAlbumIndex({ filePath, meta, mode, items, shareKey, album }) {
  // Verzeichnis aus dem Zielpfad ableiten
  const dir = path.dirname(filePath);

  const cover =
    album?.albumThumbnailAssetId && shareKey
      ? `${BASE}/api/assets/${album.albumThumbnailAssetId}/thumbnail?key=${encodeURIComponent(
          shareKey
        )}`
      : undefined;
  
  const index = {
    type: 'album',
    section: meta.section,
    category: meta.category,
    slug: meta.slug,
    title: meta.title,
    description: album?.description ?? '',
    date: toIsoString(album?.startDate ?? album?.createdAt ?? '1970-01-01T00:00:00.000Z'),
    cover,
    count: items.length,
    assetMode: mode,
    albumId: meta.albumId,
    albumName: meta.albumName,
    shareKey,
    items,
  };


  // jetzt gibt es dir wirklich
  await fs.mkdir(dir, { recursive: true });
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
    // nur noch ein Zielordner
    albumDataRoot: path.join(contentRoot, 'album'),
    envFile: path.join(appRoot, '.env'),
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
  if (!album || typeof album.albumName !== "string") return null;
  const name = album.albumName.trim();
  const lower = name.toLowerCase();

  // 1️⃣ Sonderfall: Frames – kein echtes Keyword-Mapping



  // 2️⃣ Standard-Flow (paws, tails, noms …)
  const keyword = KEYWORDS.find((kw) => lower.includes(kw));
  if (!keyword) return null;
  const config = CATEGORY_CONFIG.get(keyword);
  if (!config) return null;

  const nameParts = name.split(":");
  const rawTitle =
    nameParts.length > 1 ? nameParts.slice(1).join(":").trim() : name;
  const displayTitle = createDisplayTitle(rawTitle);
  const normalizedTitleRaw = displayTitle || rawTitle || name;
  const normalizedTitle =
    normalizedTitleRaw.trim().length > 0 ? normalizedTitleRaw.trim() : name;

  const section = config.section ?? "albums";
  const slugParts = [section ?? config.category ?? slugify(keyword), rawTitle]
    .filter((p) => typeof p === "string" && p.trim().length > 0)
    .map((p) => p.trim());

  const slug =
    slugify(slugParts.join(" ")) ||
    slugify(`${config.category}-${album.id}`) ||
    album.id;
  
if (lower.startsWith("frames") || lower.includes("frame")) {
  const category = lower.includes("nsfw")
    ? "nsfw"
    : lower.includes("sfw")
    ? "sfw"
    : "misc";

  // Slug klarer machen (z. B. "frames-sfw")
  const slug =
    slugify(name.replace(/^frames\s*/i, "").trim()) ||
    `${category}-${album.id.slice(0, 8)}`;

  const section = "frames"; // hier wirklich definieren
  
  return {
    slug,
    albumId: album.id,
    albumName: name,
    title: name,
    section,
    category,
    dataDirSegments: [section, category],
    dataFileName: slug,
    assetDirSegments: [section, category, slug],
  };
}
  return {
    slug,
    albumId: album.id,
    albumName: name,
    title: normalizedTitle,
    section,
    rawTitle,
    category: config.category,
    dataDirSegments: [section, config.category],
    dataFileName: slug,
    assetDirSegments: [section, config.category, slug],
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
    section: 'paws',      // oder 'paws', je nach Wunsch
    category: 'bestof',
    dataDirSegments: ['paws', 'bestof'],
    dataFileName: 'bestof',
    assetDirSegments: ['paws', 'bestof'],
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