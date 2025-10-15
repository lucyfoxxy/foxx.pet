import { defineCollection, z } from "astro:content";

const navLabelSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    emoji: z.string().optional(),
  }),
]);

const contactEntrySchema = z.object({
  term: z.string(),
  description: z.string(),
  kind: z.string().optional(),
});

const sitePages = defineCollection({
  type: "data",
  schema: z
    .object({
      id: z.string(),
      href: z.string(),
      title: z.string(),
      navLabel: navLabelSchema.optional(),
      includeInHeader: z.boolean().optional(),
      description: z.string().optional(),
      hero: z
        .object({
          heading: z.string(),
          subheading: z.string().optional(),
        })
        .optional(),
      intro: z
        .object({
          heading: z.string(),
          paragraphs: z.array(z.string()),
          signature: z.string().optional(),
        })
        .optional(),
      introParagraphs: z.array(z.string()).optional(),
      feature: z
        .object({
          heading: z.string(),
          description: z.string().optional(),
          placeholder: z.string().optional(),
        })
        .optional(),
      overview: z
        .object({
          emptyState: z.string().optional(),
          cta: z.string().optional(),
        })
        .optional(),
      contact: z
        .object({
          heading: z.string(),
        })
        .optional(),
      contactLinks: z
        .array(
          z.object({
            href: z.string(),
            label: z.string(),
            kind: z.string().optional(),
          })
        )
        .optional(),
      sections: z
        .array(
          z.object({
            title: z.string(),
            paragraphs: z.array(z.string()),
          })
        )
        .optional(),
      contacts: z
        .array(
          z.object({
            title: z.string(),
            subtitle: z.string().optional(),
            entries: z.array(contactEntrySchema),
          })
        )
        .optional(),
      disclaimer: z.array(z.string()).optional(),
    })
    .strict(),
});

const galleryCatalog = defineCollection({
  type: "data",
  schema: z.object({
    categories: z.array(
      z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string().optional(),
      })
    ),
  }),
});

const albumData = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    albumId: z.string().optional(),
    shareKey: z.string(),
    albumName: z.string().optional(),
    title: z.string().optional(),
    startDate: z.string(),
    description: z.string().optional(),
    albumThumbnailAssetId: z.string(),
    category: z
      .object({
        name: z.string(),
        slug: z.string(),
      })
      .optional(),
    assetMode: z.enum(["remote", "download"]).optional(),
    count: z.number(),
    items: z.array(
      z.object({
        id: z.string().optional(),
        thumb: z.string(),
        full: z.string(),
        filename: z.string().optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        shareKey: z.string(),
      }),
    ),
  }),
});

const basePostSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  publishDate: z.date(),
  updatedDate: z.date().optional(),
  heroImage: z.string().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const stories = defineCollection({
  type: "content",
  schema: basePostSchema.extend({
    featured: z.boolean().default(false),
  }),
});

const recipes = defineCollection({
  type: "content",
  schema: basePostSchema.extend({
    prepTime: z.string().optional(),
    cookTime: z.string().optional(),
    servings: z.string().optional(),
  }),
});

export const collections = {
  sitePages,
  galleryCatalog,
  albumData,
  stories,
  recipes,
};
