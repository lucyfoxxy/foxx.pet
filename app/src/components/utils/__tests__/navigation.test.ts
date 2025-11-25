import { describe, expect, it } from 'vitest';
import { buildBreadcrumbs, isLinkActive, normalizePath } from '../navigation';

describe('navigation helpers', () => {
  it('normalizes paths with trailing slashes', () => {
    expect(normalizePath('/frames/')).toBe('/frames');
    expect(normalizePath('////frames//')).toBe('/frames');
    expect(normalizePath('/')).toBe('/');
  });

  it('detects active links with nested routes', () => {
    expect(isLinkActive('/frames', '/frames')).toBe(true);
    expect(isLinkActive('/frames', '/frames/portraits')).toBe(true);
    expect(isLinkActive('/frames', '/noms')).toBe(false);
    expect(isLinkActive('/', '/frames')).toBe(false);
  });

  it('builds breadcrumbs with nav labels and custom page title', () => {
    const navLinks = [
      { href: '/', label: 'Home' },
      { href: '/frames', label: 'Frames' },
      { href: '/frames/portraits', label: 'Portraits' },
    ];

    const breadcrumbs = buildBreadcrumbs({
      currentPath: '/frames/portraits/new/',
      navLinks,
      pageTitle: 'New Album',
    });

    expect(breadcrumbs).toEqual([
      { label: 'Home', href: '/', isCurrent: false },
      { label: 'Frames', href: '/frames', isCurrent: false },
      { label: 'Portraits', href: '/frames/portraits', isCurrent: false },
      { label: 'New Album', href: '/frames/portraits/new', isCurrent: true },
    ]);
  });

  it('falls back to generated labels and default home link', () => {
    const breadcrumbs = buildBreadcrumbs({
      currentPath: '/noms/sweets/cakes/',
      navLinks: [],
      pageTitle: '',
    });

    expect(breadcrumbs[0].label).toBe('↩ Home');
    expect(breadcrumbs[breadcrumbs.length - 1]).toEqual({
      label: 'Cakes',
      href: '/noms/sweets/cakes',
      isCurrent: true,
    });
  });
});
