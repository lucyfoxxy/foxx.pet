export type SectionViewKind = 'category' | 'entry';

export interface SectionResolution {
  sectionSlug: string;
  categorySlug?: string;
}

export const resolveSectionFromUrl = (url: URL, kind: SectionViewKind = 'category'): SectionResolution => {
  const pathSegments = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  const sectionSlug =
    pathSegments.length >= (kind === 'category' ? 3 : 4)
      ? pathSegments[1] ?? ''
      : pathSegments.length >= 1
      ? pathSegments[0] ?? ''
      : '';

  if (kind === 'entry') {
    const categorySlug =
      pathSegments.length >= 3
        ? pathSegments[pathSegments.length - 2]
        : pathSegments.length >= 2
        ? pathSegments[pathSegments.length - 1]
        : undefined;
    return { sectionSlug, categorySlug };
  }

  const categorySlug = pathSegments[pathSegments.length - 1];
  return { sectionSlug, categorySlug };
};
