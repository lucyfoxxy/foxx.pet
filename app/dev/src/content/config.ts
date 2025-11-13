import { defineCollection, z } from "astro:content";

const navLabelSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    emoji: z.string().optional(),
    icon: z.string().optional(),
  }),
]);

const contactEntrySchema = z.object({
  term: z.string(),
  description: z.string(),
  kind: z.string().optional(),
});

const heroSchema = z.object({
  heading: z.string(),
  subheading: z.string().optional(),
  subtitle: z.string().optional(),
});

const introSchema = z.object({
  heading: z.string(),
  paragraphs: z.array(z.string()),
  greeting: z.string().optional(),
  signature: z.string().optional(),
});

const featureSchema = z.object({
  heading: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
});

const overviewSchema = z.object({
  emptyState: z.string().optional(),
  cta: z.string().optional(),
});

const contactSchema = z.object({
  heading: z.string(),
  description: z.string().optional(),
});

const sectionSchema = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()),
});

const contactBlockSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  entries: z.array(contactEntrySchema),
});

const categorySchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  description: z.string().optional(),
  href: z.string().optional(),
});

const collectionPageSchema = z.object({
  collection: z.enum(["blog"]),
  section: z.enum(["tails", "noms"]).optional(),
  baseHref: z.string(),
  facets: z
    .object({
      heading: z.string(),
      paragraphs: z.array(z.string()).optional(),
      emptyFilters: z.string().optional(),
      variant: z.enum(["default", "soft"]).optional(),
    })
    .optional(),
  item: z.object({
    ctaLabel: z.string(),
    excerptField: z.string().optional(),
    details: z
      .array(
        z.object({
          label: z.string(),
          field: z.string(),
          type: z.enum(["date", "text"]).optional(),
        })
      )
      .optional(),
    listDetails: z
      .array(
        z.object({
          label: z.string(),
          field: z.string(),
        })
      )
      .optional(),
  }),
});

const sitePages = defineCollection({
  type: "data",
  schema: z
    .object({
      id: z.string().optional(),
      slug: z.string().optional(),
      href: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      icon: z.string().optional(),
      navLabel: navLabelSchema.optional(),
      includeInHeader: z.boolean().optional(),
      navWeight: z.number().optional(),
      description: z.string().optional(),
      hero: heroSchema.optional(),
      intro: introSchema.optional(),
      introParagraphs: z.array(z.string()).optional(),
      feature: featureSchema.optional(),
      overview: overviewSchema.optional(),
      contact: contactSchema.optional(),
      contactLinks: z
        .array(
          z.object({
            href: z.string(),
            label: z.string(),
            kind: z.string().optional(),
          })
        )
        .optional(),
      sections: z.array(sectionSchema).optional(),
      contacts: z.array(contactBlockSchema).optional(),
      disclaimer: z.array(z.string()).optional(),
      categories: z.array(categorySchema).optional(),
      collectionPage: collectionPageSchema.optional(),
    })
    .strict(),
});


const baseEntrySchema = z.object({
  type: z.enum(["album", "article"]),
  section: z.string(),
  category: z.string(),
  slug: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date().optional(),
  cover: z.string().optional(),
  // wird bei Artikeln u. U. leer sein – füllen wir später
  count: z.number().optional(),
});

const album = defineCollection({
  type: "data",
  schema: baseEntrySchema.extend({
    type: z.literal("album").default("album"),
    assetMode: z.enum(["remote", "download"]).optional(),
    albumId: z.string(),
    albumName: z.string().optional(),
    shareKey: z.string(),
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          thumb: z.string(),
          full: z.string(),
          filename: z.string().optional(),
          width: z.number().nullable().optional(),
          height: z.number().nullable().optional(),
          shareKey: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const chapterSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string().optional(),
});

const blog = defineCollection({
  type: "content",
  schema: baseEntrySchema.extend({
    type: z.literal("article").default("article"),
    section: z.enum(["tails", "noms"]),
    tags: z.array(z.string()).default([]),
    chapters: z.array(chapterSchema).default([]),
    // count bleibt optional – füllen wir später
  }),
});


export const collections = {
  sitePages,
  album,
  blog,
};
