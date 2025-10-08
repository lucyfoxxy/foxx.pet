import { defineCollection, z } from "astro:content";

const albumData = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    count: z.number(),
    items: z.array(
      z.object({
        id: z.string().optional(),
        thumb: z.string(),
        full: z.string(),
        filename: z.string().optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
      }),
    ),
  }),
});

export const collections = { albumData };
