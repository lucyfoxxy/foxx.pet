interface AlbumItem {
  thumb?: string;
  full?: string;
  width?: number;
  height?: number;
  filename?: string;
}

interface AlbumContent {
  section?: string;
  category?: string;
  slug: string;
  title?: string;
  description?: string;
  date?: string;
  shareKey?: string;
  items?: AlbumItem[];
}

export interface AlbumTeaser {
  title: string;
  description: string;
  shareKey?: string;
  albumSlug: string;
  categoryBadge?: string;
  dateBadge?: string;
  initialThumb?: AlbumItem & { src?: string; alt?: string };
  href: string;
}

export interface AlbumTeaserOptions {
  random?: () => number;
}

const albumModules = import.meta.glob<AlbumContent>('@Content/album/*/*/*.json', {
  eager: true,
  import: 'default',
});

const albumPool = Object.values(albumModules).filter(
  (album): album is AlbumContent => Boolean(album?.items && album.items.length > 0 && album.slug),
);

const formatDateBadge = (iso?: string) => (iso ? iso.slice(0, 10) : undefined);

const pickIndex = (length: number, random: () => number) =>
  length > 0 ? Math.floor(random() * length) % length : -1;

const normalizeItem = (item?: AlbumItem) =>
  item
    ? {
        src: item.thumb || item.full,
        width: typeof item.width === 'number' ? item.width : undefined,
        height: typeof item.height === 'number' ? item.height : undefined,
        alt: item.filename ?? undefined,
        full: item.full,
      }
    : undefined;

export const getRandomAlbumTeaser = ({ random = Math.random }: AlbumTeaserOptions = {}) => {
  const index = pickIndex(albumPool.length, random);
  if (index < 0) {
    return undefined;
  }

  const album = albumPool[index];
  const initialThumb = normalizeItem(album.items?.[0]);
  const section = album.section ?? 'frames';
  const category = album.category ?? 'general';

  return {
    title: album.title ?? album.slug,
    description: album.description ?? '',
    shareKey: album.shareKey,
    albumSlug: album.slug,
    categoryBadge: category.toUpperCase?.() ?? category,
    dateBadge: formatDateBadge(album.date),
    initialThumb,
    href: `/${section}/${category}/${album.slug}/`.replace(/\/{2,}/g, '/'),
  } satisfies AlbumTeaser;
};
