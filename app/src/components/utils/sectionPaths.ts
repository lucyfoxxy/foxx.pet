import { getPageContent } from '@Content/siteContent';
import { getEntriesBySection, type Entry } from './getEntries';

type StaticPath<TParams extends Record<string, string>> = { params: TParams };

type EntryParamBuilder<TParams extends Record<string, string>> = (
  entry: Entry,
) => TParams | null | undefined;

export async function buildCategoryStaticPaths(section: string) {
  const page = await getPageContent(section);
  const categories = page.categories ?? [];

  return categories
    .map((category) => category.slug?.trim())
    .filter((slug): slug is string => Boolean(slug?.length))
    .map((slug) => ({ params: { slug } } satisfies StaticPath<{ slug: string }>));
}

export async function buildSectionEntryStaticPaths<TParams extends Record<string, string>>(
  section: string,
  buildParams: EntryParamBuilder<TParams>,
) {
  const entries = await getEntriesBySection(section);

  return entries
    .map((entry) => {
      const params = buildParams(entry);
      return params ? ({ params } satisfies StaticPath<TParams>) : undefined;
    })
    .filter((value): value is StaticPath<TParams> => Boolean(value));
}
