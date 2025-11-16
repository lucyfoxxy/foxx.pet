import { findCategory, getPageContent, type PageContent } from '@Content/siteContent';
import { resolveSectionFromUrl, type SectionResolution, type SectionViewKind } from './sectionUrl';

const trim = (value?: string | null) => value?.trim() ?? '';

export interface LoadSectionContextOptions {
  url: URL;
  section?: string;
  categorySlug?: string;
  kind?: SectionViewKind;
  missingSectionMessage?: string;
}

export interface SectionContextResult extends SectionResolution {
  page?: PageContent;
  category?: PageContent['categories'][number];
  error?: string;
}

export const getSectionBaseHref = (sectionSlug: string, page?: PageContent) =>
  (page?.href?.replace(/\/+$/, '') ?? (sectionSlug ? `/${sectionSlug}` : '')).replace(/\/{2,}/g, '/');

export const loadSectionContext = async ({
  url,
  section,
  categorySlug: categoryOverride,
  kind = 'category',
  missingSectionMessage = 'We could not resolve the requested section.',
}: LoadSectionContextOptions): Promise<SectionContextResult> => {
  const { sectionSlug: resolvedSection, categorySlug: derivedCategory } = resolveSectionFromUrl(url, kind);
  const sectionSlug = trim(section) || resolvedSection;
  const categorySlug = trim(categoryOverride) || derivedCategory;

  if (!sectionSlug) {
    return { sectionSlug: '', categorySlug, error: missingSectionMessage };
  }

  try {
    const page = await getPageContent(sectionSlug as Parameters<typeof getPageContent>[0]);
    const category = categorySlug ? findCategory(page, categorySlug) : undefined;
    return { sectionSlug, categorySlug, page, category };
  } catch (unknownError) {
    const message =
      unknownError instanceof Error ? unknownError.message : 'Unable to load page details.';
    return { sectionSlug, categorySlug, error: message };
  }
};
