import type { ImageMetadata } from 'astro';

import logo__lucyRocket from './logos/logo__lucy-rocket.webp';
import meta__defaultOg from './meta/meta__default-og.webp';
import meta__favicon from './meta/meta__favicon.webp';
import overlay__nebula from './overlays/overlay__nebula.webp';
import overlay__stars from './overlays/overlay__stars.webp';
import overlay__stars__dense from './overlays/overlay__stars--dense.webp';
import overlay__nebula__bars from './overlays/overlay__nebula__bars.webp';
import overlay__header from './overlays/overlay__header.webp';
import { COVERS, PLACEHOLDER_COVER, findCoverImage } from './covers';
import { registry as ICON_REGISTRY } from './icons.registry';

type AssetRegistry = Record<string, ImageMetadata>;

export const ASSETS: AssetRegistry = {
  favicon: meta__favicon,
  og: meta__defaultOg,
  mascot: logo__lucyRocket,
  overlay__nebula,
  overlay__stars,
  overlay__stars__dense,
  overlay__header,
  overlay__nebula__bars,
};

export const assetsRegistry = {
  images: ASSETS,
  icons: ICON_REGISTRY,
  covers: COVERS,
  placeholderCover: PLACEHOLDER_COVER,
  findCoverImage,
};

export { COVERS, ICON_REGISTRY, PLACEHOLDER_COVER, findCoverImage };
export default assetsRegistry;
