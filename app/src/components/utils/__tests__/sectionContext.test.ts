import { describe, expect, it } from 'vitest';
import { resolveSectionFromUrl } from '../sectionUrl';

describe('resolveSectionFromUrl', () => {
  it('falls back to the first segment for shallow category routes', () => {
    const result = resolveSectionFromUrl(new URL('https://example.com/noms/sweets/'), 'category');
    expect(result.sectionSlug).toBe('noms');
    expect(result.categorySlug).toBe('sweets');
  });

  it('uses the second segment when the path is nested (e.g., /app/noms/foo/)', () => {
    const result = resolveSectionFromUrl(new URL('https://example.com/app/noms/sweets/'), 'category');
    expect(result.sectionSlug).toBe('noms');
    expect(result.categorySlug).toBe('sweets');
  });

  it('derives the category slug from the second to last segment for entry routes', () => {
    const result = resolveSectionFromUrl(new URL('https://example.com/noms/sweets/cake/'), 'entry');
    expect(result.sectionSlug).toBe('noms');
    expect(result.categorySlug).toBe('sweets');
  });

  it('uses the last segment as a fallback when entry routes are shallow', () => {
    const result = resolveSectionFromUrl(new URL('https://example.com/blog/post/'), 'entry');
    expect(result.sectionSlug).toBe('blog');
    expect(result.categorySlug).toBe('post');
  });
});
