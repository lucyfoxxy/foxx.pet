import type { ImageMetadata } from 'astro';
import logo_header from '@Assets/ui/logo-header.webp';
import logo_hero from '@Assets/ui/logo-hero.webp';
import favicon from '@Assets/ui/favicon.webp';
import og from '@Assets/ui/default-og.webp';
import overlay__stars from '@Assets/ui/stars.webp';
import overlay__nebula from '@Assets/ui/nebula.webp';
import bg__panel from '@Assets/ui/container-bg.webp';

export const ASSETS: Record<string, ImageMetadata> = {
  favicon, og,
  bg__panel, 
  overlay__stars, overlay__nebula, 
  logo_header, logo_hero
};
