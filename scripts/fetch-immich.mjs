import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Agent } from 'undici';
import 'dotenv/config';
// ──────────────────────────────────────────────────────────────────────────────
// Configuration ----------------------------------------------------------------

const { target: TARGET, quiet: QUIET } = parseCliArgs(
  process.argv.slice(2)
);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const PATHS = createPathConfig(REPO_ROOT, TARGET);

const BASE = process.env.IMMICH_BASE_URL || process.env.IMMICH_URL;
const KEY = process.env.IMMICH_API_KEY;
const OWNER_ID = 'd3e4dd84-d590-4c98-b2d1-07ed6811a693';
const KEYWORDS = ['suitwalk', 'furmeet', 'convention', 'sfw', 'nsfw'];
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
    console.log(`   entries: ${PATHS.albumDataRoot}`);
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
  for (const entry of albumEntries) {


    await processAlbum({
      album: entry.album,
      assets: entry.assets,
      shareKey: entry.shareKey,
      counters,
      paths: PATHS,
      baseUrl: BASE
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
  metaOverride = null
}) {
  const meta = metaOverride ?? deriveAlbumMeta(album);
  if (!meta) {
    if (!QUIET) console.log(`⏭  Skipping album without matching keyword: ${album.albumName}`);
    return null;
  }

  const albumAssets = assets ?? (await listAssets(album.id));
  const totalAlbum = albumAssets.length;

  const albumRoot = path.join(paths.srcRoot, 'content', 'album');
  const dataSegments = Array.isArray(meta.dataDirSegments)
    ? meta.dataDirSegments.filter(Boolean)
    : [meta.section ?? 'albums', meta.category ?? 'misc'];
  const dataDir = path.join(albumRoot, ...dataSegments);
  const dataFile = path.join(dataDir, `${meta.dataFileName ?? meta.slug}.json`);

  const mode = 'remote';

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
      items.push(createRemoteAssetItem({ asset, baseUrl, shareKey }));
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
  await fs.mkdir(dir, { recursive: true });
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

// ──────────────────────────────────────────────────────────────────────────────
// CLI / utility helpers --------------------------------------------------------

function parseCliArgs(argv) {
  const args = { target: 'dev', quiet: false };
  for (const entry of argv) {
    if (entry === '--quiet') args.quiet = true;
    else if (entry.startsWith('--target=')) {
      args.target = entry.split('=')[1]?.toLowerCase() ?? args.target;
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
    albumDataRoot: path.join(contentRoot, 'album'),
    envFile: path.join(appRoot, '.env'),
  };
}

function deriveAlbumMeta(album) {
  if (!album || typeof album.albumName !== "string") return null;
  const name = album.albumName.trim();
  const lower = name.toLowerCase();

  if (lower.includes("frame")) {
    const category = lower.includes("nsfw") ? "nsfw" : "sfw";
    const section = "frames";
    const slug = `frames-${category}`;
    const title = category.toUpperCase();

    return {
      slug,
      albumId: album.id,
      albumName: name,
      title,
      section,
      category,
      dataDirSegments: ["albums", section, category],
      dataFileName: category,
    };
  }

  const keyword = findKeywordMatch(lower);
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
    section: 'paws',
    category: 'bestof',
    dataDirSegments: ['albums', 'paws', 'bestof'],
    dataFileName: 'bestof',
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

function findKeywordMatch(lowerName) {
  let bestMatch = null;
  for (const keyword of KEYWORDS) {
    if (!lowerName.includes(keyword)) continue;
    if (!bestMatch || keyword.length > bestMatch.length) {
      bestMatch = keyword;
    }
  }
  return bestMatch;
}
