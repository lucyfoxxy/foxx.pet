import type { ImageMetadata } from 'astro';
import bg from '@Assets/ui/bg9.webp';
import logo_header from '@Assets/ui/logo-header.webp';
import logo_hero from '@Assets/ui/logo-hero.webp';
import favicon from '@Assets/ui/favicon.webp';
import og from '@Assets/ui/default-og.webp';
import bg__stars from '@Assets/ui/stars.webp';
import bg__twinkle from '@Assets/ui/twinkle.webp';
import bg__nebula from '@Assets/ui/nebula.webp';
import container_bg from '@Assets/ui/container-bg.webp';
export const ASSETS: Record<string, ImageMetadata> = {
  favicon, og,
  bg, container_bg, bg__stars, bg__nebula, bg__twinkle, 
  logo_header, logo_hero, 
};
