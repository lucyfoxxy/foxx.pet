const createRemoteUrl = (id, shareKey, kind) => {
  if (!id || !shareKey) return undefined;
  const endpoint = kind === 'thumb' ? 'thumbnail' : 'original';
  return `https://img.foxx.pet/api/assets/${id}/${endpoint}?key=${shareKey}`;
};

const pickString = (value) => (typeof value === 'string' && value.trim() ? value : undefined);

export function createGalleryItemsBySlug(metaModules, assetModules) {
  const urlByFile = {};
  for (const [abs, url] of Object.entries(assetModules)) {
    const name = abs.split('/').pop();
    if (!name) continue;
    urlByFile[name] = url;
  }

  const urlFromId = (id, kind) =>
    urlByFile[`${kind}-${id}.webp`]
    || urlByFile[`${kind}-${id}.avif`]
    || urlByFile[`${kind}-${id}.jpg`]
    || urlByFile[`${kind}-${id}.jpeg`]
    || urlByFile[`${kind}-${id}.png`];

  const urlFromJsonPath = (p) => (p ? urlByFile[p.split('/').pop()] : undefined);

  const itemsBySlug = new Map();
  for (const [path, rawData] of Object.entries(metaModules)) {
    const data = rawData && typeof rawData === 'object' ? rawData : undefined;
    const slug = pickString(data?.slug)
      || path.match(/\/albumData\/(.+?)\.json$/)?.[1];
    if (!slug) continue;

    const albumItems = Array.isArray(data?.items) ? data.items : [];
    const albumShareKey = pickString(data?.shareKey)
      || pickString(albumItems.find((item) => pickString(item?.shareKey))?.shareKey);

    const items = albumItems.map((item) => {
      if (!item || typeof item !== 'object') return null;

      const id = pickString(item.id)
        || pickString(item.full?.match?.(/full-(.+)\.\w+$/)?.[1])
        || pickString(item.thumb?.match?.(/thumb-(.+)\.\w+$/)?.[1]);

      const itemShareKey = pickString(item.shareKey) || albumShareKey;

      const localFull = id ? urlFromId(id, 'full') : urlFromJsonPath(item.full);
      const localThumb = id ? urlFromId(id, 'thumb') : urlFromJsonPath(item.thumb);

      const remoteFull = createRemoteUrl(id, itemShareKey, 'full');
      const remoteThumb = createRemoteUrl(id, itemShareKey, 'thumb');

      const fallbackFull = pickString(item.full);
      const fallbackThumb = pickString(item.thumb);

      const full = localFull || fallbackFull || remoteFull || null;
      const thumb = localThumb || fallbackThumb || remoteThumb || full;

      if (!full) console.warn('[gallery] missing full asset for', id ?? item.full ?? item);
      if (!thumb) console.warn('[gallery] missing thumb asset for', id ?? item.thumb ?? item);

      return {
        ...item,
        id,
        shareKey: itemShareKey,
        full,
        thumb,
      };
    }).filter(Boolean);

    itemsBySlug.set(slug, {
      shareKey: albumShareKey,
      items,
    });
  }

  return itemsBySlug;
}
