export type NavLink = {
  href: string;
  label: string;
  isActive?: boolean;
};

export type Breadcrumb = {
  label: string;
  href: string;
  isCurrent: boolean;
};

export const normalizePath = (path: string) => {
  if (!path || path === '/') return '/';
  const trimmed = path.replace(/\/+$/, '') || '/';
  return `/${trimmed.replace(/^\/+/, '')}`.replace(/\/+$/, '') || '/';
};

const toTitleCase = (value: string) =>
  value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const isLinkActive = (href: string, currentPath: string) => {
  const normalizedCurrent = normalizePath(currentPath);
  const target = normalizePath(href);

  if (target === '/') return normalizedCurrent === '/';

  return normalizedCurrent === target || normalizedCurrent.startsWith(`${target}/`);
};

export const buildBreadcrumbs = ({
  currentPath,
  navLinks,
  pageTitle,
  homeLabel = '↩ Home',
}: {
  currentPath: string;
  navLinks: NavLink[];
  pageTitle: string;
  homeLabel?: string;
}): Breadcrumb[] => {
  const normalizedCurrentPath = normalizePath(currentPath);
  const navLabelByPath = new Map(navLinks.map((link) => [normalizePath(link.href), link.label]));
  const segments = normalizedCurrentPath === '/' ? [] : normalizedCurrentPath.slice(1).split('/');
  const collectedSegments: string[] = [];
  const homeLink = navLinks.find((link) => normalizePath(link.href) === '/');
  const resolvedHomeLabel = homeLink ? homeLink.label : homeLabel;

  const crumbs: Breadcrumb[] = [
    {
      label: resolvedHomeLabel,
      href: '/',
      isCurrent: segments.length === 0,
    },
  ];

  segments.forEach((segment, index) => {
    collectedSegments.push(segment);
    const href = normalizePath(`/${collectedSegments.join('/')}`);
    const isLast = index === segments.length - 1;
    let label = navLabelByPath.get(href) ?? toTitleCase(segment);
    if (isLast && pageTitle?.trim().length) {
      label = pageTitle.trim();
    }
    crumbs.push({
      label,
      href,
      isCurrent: isLast,
    });
  });

  return crumbs;
};
