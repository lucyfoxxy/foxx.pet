import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'album'> | CollectionEntry<'blog'>;

export const isAlbumEntry = (
  entry: Entry,
): entry is CollectionEntry<'album'> => entry.collection === 'album';

export const isBlogEntry = (
  entry: Entry,
): entry is CollectionEntry<'blog'> => entry.collection === 'blog';

const toTimestamp = (value: unknown) => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = Date.parse(String(value));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

export const sortEntriesByDateDesc = <T extends Entry>(entries: T[]) =>
  [...entries].sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));

export async function getEntriesBySection(section: string): Promise<Entry[]> {
  const [albums, posts] = await Promise.all([
    getCollection('album', ({ data }) => data.section === section),
    getCollection('blog', ({ data }) => data.section === section),
  ]);

  return [...albums, ...posts];
}

export async function getEntriesBySectionAndCategory(
  section: string,
  category: string,
): Promise<Entry[]> {
  const [albums, posts] = await Promise.all([
    getCollection('album', ({ data }) => data.section === section && data.category === category),
    getCollection('blog', ({ data }) => data.section === section && data.category === category),
  ]);

  return [...albums, ...posts];
}
