import type { ImageMetadata } from 'astro';

type CoverModule = { default: ImageMetadata };

type NullableSlug = string | undefined | null;

type CoverMap = Map<string, ImageMetadata>;

const coverModules = import.meta.glob<CoverModule>('./covers/*.webp', { eager: true });

const coversByKey: CoverMap = new Map();

const normalizeKey = (value: string) => value.trim().toLowerCase();

const registerKey = (key: string, image: ImageMetadata) => {
  const normalized = normalizeKey(key);
  if (!normalized) return;
  if (!coversByKey.has(normalized)) {
    coversByKey.set(normalized, image);
  }
};

const collectVariants = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return [] as string[];

  const normalized = trimmed.toLowerCase();
  const variants = new Set<string>([normalized]);

  variants.add(normalized.replace(/\s+/g, '-'));
  variants.add(normalized.replace(/\s+/g, '_'));
  variants.add(normalized.replace(/[\\/]+/g, '-'));
  variants.add(normalized.replace(/[\\/]+/g, '_'));
  variants.add(normalized.replace(/-+/g, '_'));
  variants.add(normalized.replace(/_+/g, '-'));

  return Array.from(variants).filter((variant) => variant.length > 0);
};

for (const [path, module] of Object.entries(coverModules)) {
  const image = module.default;
  const fileName = path.split('/').pop() ?? '';
  const baseName = fileName.replace(/\.webp$/i, '');

  if (!baseName) continue;

  const variants = collectVariants(baseName);
  variants.forEach((variant) => registerKey(variant, image));
}

const coversObject = Object.fromEntries(coversByKey) as Record<string, ImageMetadata>;

const placeholderCover = coversByKey.get('placeholder');

if (!placeholderCover) {
  throw new Error('Missing "placeholder.webp" in assets/covers.');
}

export const COVERS = coversObject;
export const PLACEHOLDER_COVER = placeholderCover;

const buildSlugCandidates = (slug: string) => {
  const trimmed = slug.trim();
  if (!trimmed) return [] as string[];

  const lowerCased = trimmed.toLowerCase();
  const segments = lowerCased.split('/').filter(Boolean);
  const candidates = new Set<string>([
    lowerCased,
    lowerCased.replace(/\s+/g, '-'),
    lowerCased.replace(/\s+/g, '_'),
    lowerCased.replace(/[\\/]+/g, '-'),
    lowerCased.replace(/[\\/]+/g, '_'),
    lowerCased.replace(/-+/g, '_'),
    lowerCased.replace(/_+/g, '-'),
    segments.join('-'),
    segments.join('_'),
  ]);

  segments.forEach((segment) => {
    candidates.add(segment);
    candidates.add(segment.replace(/\s+/g, '-'));
    candidates.add(segment.replace(/\s+/g, '_'));
  });

  return Array.from(candidates).filter((candidate) => candidate.length > 0);
};

export const findCoverImage = (...slugs: NullableSlug[]): ImageMetadata | undefined => {
  for (const slug of slugs) {
    if (!slug) continue;
    const candidates = buildSlugCandidates(slug);

    for (const candidate of candidates) {
      const cover = coversByKey.get(normalizeKey(candidate));
      if (cover) {
        return cover;
      }
    }
  }

  return undefined;
};
