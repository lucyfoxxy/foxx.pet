import { getEntriesBySectionAndCategory, isAlbumEntry, type Entry } from './getEntries';
import { buildCategoryStaticPaths, buildSectionEntryStaticPaths as buildEntryStaticPaths } from './sectionPaths';

type SectionConfig = {
  slug: string;
  buildCategoryProps?: (categorySlug: string) => Promise<Record<string, unknown>>;
  buildEntryParams?: (entry: Entry) => { category: string; entry: string } | null | undefined;
};

type CategoryStaticPath = {
  params: { section: string; slug: string };
  props?: Record<string, unknown>;
};

type SectionStaticPath = { params: { section: string } };
type EntryStaticPath = { params: { section: string; category: string; entry: string } };

export const sectionConfigs: SectionConfig[] = [
  {
    slug: 'frames',
    async buildCategoryProps(categorySlug) {
      const entries = await getEntriesBySectionAndCategory('frames', categorySlug);
      const albumEntries = entries.filter(isAlbumEntry);
      const onlyAlbum = albumEntries.length === 1 ? albumEntries[0] : undefined;

      if (!onlyAlbum) return {};

      return {
        albumSlug: onlyAlbum.data.slug,
        backToParentCategory: true,
      };
    },
  },
  {
    slug: 'paws',
    buildEntryParams(entry) {
      if (!isAlbumEntry(entry)) return null;

      return {
        category: entry.data.category ?? 'general',
        entry: entry.data.slug ?? entry.slug,
      };
    },
  },
  {
    slug: 'noms',
    buildEntryParams(entry) {
      if (isAlbumEntry(entry)) return null;

      const segments = entry.slug.split('/').filter(Boolean);
      const entrySegment = segments[segments.length - 1] ?? entry.data.slug ?? entry.slug;
      const categorySegment = entry.data.category ?? 'general';

      return {
        category: categorySegment,
        entry: entrySegment,
      };
    },
  },
  {
    slug: 'tails',
    buildEntryParams(entry) {
      if (isAlbumEntry(entry)) return null;

      const segments = entry.slug.split('/').filter(Boolean);
      const entrySegment = segments[segments.length - 1] ?? entry.data.slug ?? entry.slug;
      const categorySegment = entry.data.category ?? 'general';

      return {
        category: categorySegment,
        entry: entrySegment,
      };
    },
  },
];

export const sectionSlugs = sectionConfigs.map((config) => config.slug);

export const findSectionConfig = (section?: string | null) =>
  sectionConfigs.find((config) => config.slug === section);

export async function buildSectionIndexStaticPaths(): Promise<SectionStaticPath[]> {
  return sectionConfigs.map((config) => ({ params: { section: config.slug } }));
}

export async function buildSectionCategoryStaticPaths(): Promise<CategoryStaticPath[]> {
  const sectionPaths = await Promise.all(
    sectionConfigs.map(async (config) => {
      const basePaths = await buildCategoryStaticPaths(config.slug);

      const resolvedPaths = await Promise.all(
        basePaths.map(async ({ params }) => {
          const props = config.buildCategoryProps
            ? await config.buildCategoryProps(params.slug)
            : {};

          return {
            params: { section: config.slug, slug: params.slug },
            props,
          } satisfies CategoryStaticPath;
        }),
      );

      return resolvedPaths;
    }),
  );

  return sectionPaths.flat();
}

export async function buildSectionEntryStaticPaths(): Promise<EntryStaticPath[]> {
  const entryPaths = await Promise.all(
    sectionConfigs.map(async (config) => {
      if (!config.buildEntryParams) return [];

      const basePaths = await buildEntryStaticPaths(config.slug, config.buildEntryParams);

      return basePaths.map(({ params }) => ({
        params: { section: config.slug, category: params.category, entry: params.entry },
      } satisfies EntryStaticPath));
    }),
  );

  return entryPaths.flat();
}
