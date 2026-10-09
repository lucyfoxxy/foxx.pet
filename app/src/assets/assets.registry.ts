import type { ImageMetadata } from 'astro';

import logo__lucyRocket from './logos/logo__lucy-rocket.webp';
import meta__defaultOg from './meta/meta__default-og.webp';
import meta__favicon from './meta/meta__favicon.webp';
import overlay__nebula from './overlays/overlay__nebula.webp';
import overlay__nebula_4 from './overlays/overlay__nebula_4.webp';
import overlay__nebula_mobile from './overlays/overlay__nebula_mobile.webp';
import overlay__stars from './overlays/overlay__stars.webp';
import overlay__stars__dense from './overlays/overlay__stars--dense.webp';
import { COVERS, PLACEHOLDER_COVER, findCoverImage } from './covers';
import { registry as ICON_REGISTRY } from './Icons.astro';

type AssetRegistry = Record<string, ImageMetadata>;

export const ASSETS: AssetRegistry = {
  favicon: meta__favicon,
  og: meta__defaultOg,
  mascot: logo__lucyRocket,
  overlay__nebula,overlay__nebula_4,overlay__nebula_mobile,
  overlay__stars,
  overlay__stars__dense,
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
