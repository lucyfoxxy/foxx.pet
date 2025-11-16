import { findCoverImage } from '@Assets/covers';
import { getIntroParagraphs, type PageContent } from '@Content/siteContent';
import type { CollectionEntry } from 'astro:content';
import { isAlbumEntry, sortEntriesByDateDesc, type Entry } from './getEntries';

export interface TileEntryViewModel {
  href: string;
  title: string;
  description: string;
  dataSlug: string;
  cover: string;
  date?: Entry['data']['date'];
  count?: number;
  countLabel?: string;
}

export interface AlbumThumbData {
  src?: string;
  width?: number;
  height?: number;
  alt?: string;
  full?: string;
}

export interface AlbumViewModel {
  title: string;
  description: string;
  shareKey?: string;
  albumSlug: string;
  categoryBadge?: string;
  dateBadge?: string;
  initialThumb?: AlbumThumbData;
}

export interface AlbumEntryViewData {
  album: AlbumViewModel;
  headerBackHref: string;
  pageTitle: string;
  pageDescription: string;
  metaImage?: string;
}

export interface BlogViewModel {
  title: string;
  description?: string;
  introParagraphs: string[];
  cover: { src: string; alt: string };
  chapters?: { id: string; title: string; summary?: string }[];
}

export interface BlogEntryViewData {
  blog: BlogViewModel;
  headerBackHref: string;
  pageTitle: string;
  pageDescription: string;
  metaImage?: string;
}

interface NormalizeEntriesOptions {
  parentHref: string;
  defaultCategorySlug: string;
  placeholderCover: string;
}

const ensureTrailingSlash = (href: string) => (href.endsWith('/') ? href : `${href}/`);

const sanitizeSegment = (value?: string | null, fallback = '') => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

export const buildEntryHref = (
  entry: Entry,
  parentHref: string,
  defaultCategorySlug: string,
) => {
  const baseHref = parentHref.replace(/\/+$/, '');
  const categorySegment = sanitizeSegment(entry.data.category, defaultCategorySlug);
  const base = `${baseHref}/${categorySegment}`.replace(/\/{2,}/g, '/');

  const entrySegment = isAlbumEntry(entry)
    ? sanitizeSegment(entry.data.slug, entry.slug)
    : entry.slug.split('/').filter(Boolean).pop() ?? sanitizeSegment(entry.data.slug, defaultCategorySlug);

  if (!entrySegment) {
    return undefined;
  }

  const href = `${base}/${entrySegment}`.replace(/\/{2,}/g, '/');
  return ensureTrailingSlash(href);
};

export const normalizeEntriesForTile = (
  entries: Entry[],
  { parentHref, defaultCategorySlug, placeholderCover }: NormalizeEntriesOptions,
) =>
  sortEntriesByDateDesc(entries)
    .map((entry) => {
      const href = buildEntryHref(entry, parentHref, defaultCategorySlug);
      if (!href) return undefined;

      const title = sanitizeSegment(entry.data.title, entry.data.slug ?? entry.slug);
      const description = sanitizeSegment(entry.data.description);
      const date = entry.data.date;

      if (isAlbumEntry(entry)) {
        const cover = sanitizeSegment(
          entry.data.cover,
          entry.data.items?.find((item) => item?.thumb || item?.full)?.thumb ?? placeholderCover,
        );
        const count = typeof entry.data.count === 'number' ? entry.data.count : undefined;

        return {
          href,
          title,
          description,
          dataSlug: entry.data.slug ?? entry.slug,
          cover,
          date,
          count,
          countLabel: count !== undefined ? 'Photos' : undefined,
        } satisfies TileEntryViewModel;
      }

      const coverImage = sanitizeSegment(
        entry.data.cover,
        findCoverImage(entry.data.slug, entry.slug, entry.data.category)?.src ?? placeholderCover,
      );

      return {
        href,
        title,
        description,
        dataSlug: entry.slug,
        cover: coverImage,
        date,
        count: undefined,
        countLabel: undefined,
      } satisfies TileEntryViewModel;
    })
    .filter((value): value is TileEntryViewModel => Boolean(value));

export const matchesEntrySlug = (entry: Entry, slug: string) => {
  const normalized = slug.trim();
  if (!normalized) return false;

  if (isAlbumEntry(entry)) {
    return (entry.data.slug ?? entry.slug) === normalized;
  }

  const segments = entry.slug.split('/').filter(Boolean);
  return segments[segments.length - 1] === normalized || entry.data.slug === normalized;
};

export const createAlbumEntryView = (
  entry: CollectionEntry<'album'>,
  parentHref: string,
  options: { categorySlug?: string; categoryTitle?: string; backToParentCategory?: boolean },
): AlbumEntryViewData => {
  const initialItem = entry.data.items?.find((item) => item?.thumb || item?.full);
  const albumThumb: AlbumThumbData | undefined = initialItem
    ? {
        src: initialItem.thumb ?? initialItem.full ?? undefined,
        width: typeof initialItem.width === 'number' ? initialItem.width : undefined,
        height: typeof initialItem.height === 'number' ? initialItem.height : undefined,
        alt: initialItem.filename ?? undefined,
        full: initialItem.full ?? undefined,
      }
    : entry.data.cover
    ? { src: entry.data.cover, alt: entry.data.title ?? entry.data.slug }
    : undefined;

  const parsedDate = entry.data.date instanceof Date ? entry.data.date : undefined;
  const formattedDate = parsedDate
    ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(parsedDate)
    : undefined;

  const categorySegment = sanitizeSegment(options.categorySlug, entry.data.category ?? '');
  const backHref = options.backToParentCategory || !categorySegment
    ? ensureTrailingSlash(parentHref)
    : ensureTrailingSlash(`${parentHref}/${categorySegment}`.replace(/\/{2,}/g, '/'));

  const albumView: AlbumViewModel = {
    title: entry.data.title ?? entry.data.albumName ?? entry.data.slug ?? entry.slug,
    description: entry.data.description ?? entry.data.albumName ?? '',
    shareKey: entry.data.shareKey ?? undefined,
    albumSlug: entry.data.slug ?? entry.slug,
    categoryBadge: options.categoryTitle ?? entry.data.category ?? undefined,
    dateBadge: formattedDate,
    initialThumb: albumThumb,
  };

  const metaImage = entry.data.cover ?? albumThumb?.full ?? albumThumb?.src;

  return {
    album: albumView,
    headerBackHref: backHref,
    pageTitle: albumView.title,
    pageDescription: albumView.description,
    metaImage,
  };
};

export const createBlogEntryView = (
  entry: CollectionEntry<'blog'>,
  parentHref: string,
  options: {
    categorySlug?: string;
    categoryDescription?: string;
    parentPage?: PageContent;
    placeholderCover: string;
  },
): BlogEntryViewData => {
  const coverImage = sanitizeSegment(
    entry.data.cover,
    findCoverImage(entry.data.slug, entry.slug, entry.data.category)?.src ?? options.placeholderCover,
  );

  const introParagraphs = options.categoryDescription
    ? [options.categoryDescription]
    : options.parentPage
    ? getIntroParagraphs(options.parentPage)
    : [];

  const categorySegment = sanitizeSegment(entry.data.category, options.categorySlug ?? '');
  const backHrefBase = parentHref;
  const headerBackHref = categorySegment
    ? ensureTrailingSlash(`${backHrefBase}/${categorySegment}`.replace(/\/{2,}/g, '/'))
    : ensureTrailingSlash(backHrefBase);

  const chapters = Array.isArray(entry.data.chapters)
    ? entry.data.chapters
        .map((chapter, index) => {
          const title = chapter.title?.trim();
          if (!title) return undefined;
          const baseId = (chapter.slug?.trim().length ? chapter.slug.trim() : title)
            .toLowerCase()
            .replace(/[^\p{Letter}\p{Number}]+/gu, '-');
          const id = baseId.length > 0 ? baseId : `chapter-${index + 1}`;
          const summary = chapter.summary?.trim();
          return {
            id,
            title,
            summary: summary && summary.length > 0 ? summary : undefined,
          };
        })
        .filter((value): value is NonNullable<typeof value> => Boolean(value))
    : [];

  const blogView: BlogViewModel = {
    title: entry.data.title,
    description: entry.data.description ?? undefined,
    introParagraphs,
    cover: { src: coverImage, alt: entry.data.title },
    chapters: chapters.length > 0 ? chapters : undefined,
  };

  return {
    blog: blogView,
    headerBackHref,
    pageTitle: entry.data.title,
    pageDescription: entry.data.description ?? options.parentPage?.description ?? '',
    metaImage: coverImage,
  };
};
