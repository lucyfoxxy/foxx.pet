import { getCollection } from "astro:content";

export async function getEntriesBySection(section: string) {
  const [albums, posts] = await Promise.all([
    getCollection("album", ({ data }) => data.section === section),
    getCollection("blog", ({ data }) => data.section === section),
  ]);
  return [...albums, ...posts];
}

export async function getEntriesBySectionAndCategory(section: string, category: string) {
  const [albums, posts] = await Promise.all([
    getCollection("album", ({ data }) => data.section === section && data.category === category),
    getCollection("blog", ({ data }) => data.section === section && data.category === category),
  ]);
  return [...albums, ...posts];
}
