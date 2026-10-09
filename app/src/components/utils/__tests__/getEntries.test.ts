import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getEntriesByFilter, getEntriesBySection, getEntriesBySectionAndCategory, type Entry } from '../getEntries';

const { mockGetCollection } = vi.hoisted(() => ({
  mockGetCollection: vi.fn(),
}));

vi.mock(
  'astro:content',
  () => ({
    getCollection: mockGetCollection,
  }),
  { virtual: true },
);

type MockEntry = Entry & { data: Entry['data'] & { category?: string; slug?: string } };

const createEntry = (collection: 'album' | 'blog', overrides: Partial<MockEntry['data']> = {}): MockEntry =>
  ({
    collection,
    id: `${collection}-${overrides.slug ?? overrides.section ?? 'id'}`,
    data: {
      section: 'frames',
      category: 'portraits',
      slug: `${collection}-${overrides.slug ?? 'slug'}`,
      date: '2024-01-01',
      ...overrides,
    },
  } as MockEntry);

describe('getEntries helpers', () => {
  const albums: MockEntry[] = [
    createEntry('album', { section: 'frames', category: 'portraits', slug: 'album-a' }),
    createEntry('album', { section: 'tails', category: 'updates', slug: 'album-b' }),
  ];

  const blogs: MockEntry[] = [
    createEntry('blog', { section: 'frames', category: 'portraits', slug: 'blog-a' }),
    createEntry('blog', { section: 'frames', category: 'news', slug: 'blog-b' }),
  ];

  beforeEach(() => {
    mockGetCollection.mockImplementation(async (collection: 'album' | 'blog', filter?: (entry: MockEntry) => boolean) => {
      const source = collection === 'album' ? albums : blogs;
      return filter ? source.filter((entry) => filter(entry)) : source;
    });
  });

  it('combines album and blog entries with a custom filter', async () => {
    const result = await getEntriesByFilter((data) => data.section === 'frames');

    expect(result).toHaveLength(3);
    expect(result.every((entry) => entry.data.section === 'frames')).toBe(true);
    expect(result[0].collection).toBe('album');
    expect(result[2].collection).toBe('blog');
  });

  it('filters by section', async () => {
    const result = await getEntriesBySection('frames');

    expect(result.map((entry) => entry.data.category)).toEqual(['portraits', 'portraits', 'news']);
  });

  it('filters by section and category', async () => {
    const result = await getEntriesBySectionAndCategory('frames', 'portraits');

    expect(result).toHaveLength(2);
    expect(result.every((entry) => entry.data.category === 'portraits')).toBe(true);
  });
});
