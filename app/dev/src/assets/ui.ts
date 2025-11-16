import type { ImageMetadata } from 'astro';
import mascot_v2 from '@Assets/ui/fox_in_space.webp';
import logo_hero from '@Assets/ui/logo-hero.webp';
import favicon from '@Assets/ui/favicon.webp';
import og from '@Assets/ui/default-og.webp';
import overlay__stars from '@Assets/ui/stars.webp';
import overlay__nebula from '@Assets/ui/nebula.webp';
import mascot from '@Assets/ui/hero.webp';
export const ASSETS: Record<string, ImageMetadata> = {
  favicon, og,
  mascot, 
  overlay__stars, overlay__nebula, 
  mascot_v2, logo_hero,
};
