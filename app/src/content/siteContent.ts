import { getCollection, getEntry, type CollectionEntry, type InferEntrySchema } from 'astro:content';

type PageEntry = CollectionEntry<'sitePages'>;

export type PageKey = PageEntry['id'];
export type PageContent = InferEntrySchema<'sitePages'>;

const normalizePath = (path: string) => (path === '/' ? '/' : path.replace(/\/+$/, '') || '/');

const normalizeNavLabel = (label: PageContent['navLabel'], fallback: string, fallbackIcon?: string) => {
  if (!label) {
    return { text: fallback, emoji: undefined as string | undefined, icon: fallbackIcon };
  }

  if (typeof label === 'string') {
    return { text: label, emoji: undefined as string | undefined, icon: fallbackIcon };
  }

  const text = label.text?.trim().length ? label.text : fallback;
  const emoji = label.emoji?.trim().length ? label.emoji : undefined;
  const icon = label.icon?.trim().length ? label.icon : fallbackIcon;

  return { text, emoji, icon };
};

let cachedPages: PageEntry[] | undefined;

const loadPages = async () => {
  if (!cachedPages) {
    cachedPages = await getCollection('sitePages');
  }

  return cachedPages;
};

export const getPageContent = async (key: PageKey): Promise<PageContent> => {
  const entry = await getEntry('sitePages', key);
  if (!entry) {
    throw new Error(`Page content for "${key}" was not found.`);
  }

  return entry.data;
};

const normalizeIcon = (icon?: string) => (icon?.trim().length ? icon : undefined);

export const getNavLabelParts = (page: PageContent) =>
  normalizeNavLabel(page.navLabel, page.title, normalizeIcon(page.icon));

const toNavWeight = (value: PageContent['navWeight']) => (typeof value === 'number' ? value : 0);

const sortPagesByWeight = (pages: PageEntry[]) =>
  pages
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const weightA = toNavWeight(a.entry.data.navWeight);
      const weightB = toNavWeight(b.entry.data.navWeight);
      if (weightA === weightB) return a.index - b.index;
      return weightB - weightA;
    })
    .map(({ entry }) => entry);

export const getIntroParagraphs = (page: PageContent) =>
  page.introParagraphs ?? (page.description ? [page.description] : []);

export const getCategories = (page: PageContent) => page.categories ?? [];

export const findCategory = (page: PageContent, slug: string) =>
  getCategories(page).find((category) => category.slug === slug);

export const getNavigationLinks = async () => {
  const pages = await loadPages();
  const sortedPages = sortPagesByWeight(pages);

  return sortedPages.map(({ data }) => {
    const { text, emoji, icon } = getNavLabelParts(data);
    return {
      href: normalizePath(data.href),
      label: text,
      emoji,
      icon,
      includeInHeader: data.includeInHeader ?? true,
      weight: toNavWeight(data.navWeight),
    };
  });
};

export const findPageByHref = async (href: string) => {
  const target = normalizePath(href);
  const pages = await loadPages();
  const match = pages.find(({ data }) => normalizePath(data.href) === target);
  return match?.data;
};
