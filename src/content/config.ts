import { defineCollection, z } from 'astro:content';

const researchCollection = defineCollection({
  type: 'content',
  schema: () => z.object({
    title: z.string(),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => str === 'Now' ? new Date() : new Date(str)),
    partner: z.string(),
  }).transform(data => ({
    ...data,
    status: data.endDate > new Date() || data.endDate.toISOString() === new Date().toISOString() ? 'in_progress' : 'completed'
  })),
});

const memberCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    englishName: z.string(),
    chineseName: z.string(),
    research: z.array(z.string()).default([]),
    photo: z.union([image(), z.null()]).optional(),
    linkedin: z.string().url().optional(),
    email: z.string().email().optional(),
    entryYear: z.number().optional(),
  }),
});

const newsCollection = defineCollection({
  type: 'content',
  schema: () => z.object({
    title: z.string(),
    date: z.string().transform((str) => new Date(str)),
    tag: z.string(),
    summary: z.string().optional(),
  }),
});
export const collections = {
  research: researchCollection,
  member: memberCollection,
  news: newsCollection
};
