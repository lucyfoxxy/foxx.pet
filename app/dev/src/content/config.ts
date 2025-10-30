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
  slug: z.string(),
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

const catalogCategorySchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  nsfw: z.boolean().optional(),
  subCategories: z
    .array(
      z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        nsfw: z.boolean().optional(),
      }),
    )
    .optional(),
});

const catalogAreaSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  categories: z.array(catalogCategorySchema).min(1),
});

const catalog = defineCollection({
  type: "data",
  schema: z.object({
    album: z.object({
      paws: catalogAreaSchema,
      frames: catalogAreaSchema,
    }),
    blog: z.object({
      tails: catalogAreaSchema,
      noms: catalogAreaSchema,
    }),
  }),
});

const album = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    albumId: z.string().optional(),
    shareKey: z.string(),
    albumName: z.string().optional(),
    title: z.string().optional(),
    startDate: z.string(),
    description: z.string().optional(),
    coverUrl: z.string().optional(),
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

const chapterSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  summary: z.string().optional(),
});

const baseBlogEntrySchema = basePostSchema.extend({
  section: z.enum(["tails", "noms"]),
  primaryCategory: z.string(),
  featured: z.boolean().default(false),
  slug: z.string().optional(),
  chapters: z.array(chapterSchema).optional(),
});

const blog = defineCollection({
  type: "content",
  schema: z.discriminatedUnion("section", [
    baseBlogEntrySchema.extend({
      section: z.literal("tails"),
    }),
    baseBlogEntrySchema.extend({
      section: z.literal("noms"),
      prepTime: z.string().optional(),
      cookTime: z.string().optional(),
      servings: z.string().optional(),
    }),
  ]),
  slug: ({ data, defaultSlug }) => {
    const rawSlug = typeof (data as { slug?: string }).slug === "string" ? data.slug : undefined;

    if (!rawSlug) {
      return defaultSlug;
    }

    const normalized = rawSlug
      .split("/")
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0)
      .join("/");

    return normalized.length > 0 ? normalized : defaultSlug;
  },
});

export const collections = {
  sitePages,
  catalog,
  album,
  blog,
};
