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

export const collections = {
  research: researchCollection,
};
