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

export const getNavigationLinks = async () => {
  const pages = await loadPages();

  return pages.map(({ data }) => {
    const { text, emoji, icon } = getNavLabelParts(data);
    return {
      href: normalizePath(data.href),
      label: text,
      emoji,
      icon,
      includeInHeader: data.includeInHeader ?? true,
    };
  });
};

export const findPageByHref = async (href: string) => {
  const target = normalizePath(href);
  const pages = await loadPages();
  const match = pages.find(({ data }) => normalizePath(data.href) === target);
  return match?.data;
};
