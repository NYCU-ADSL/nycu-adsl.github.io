import { defineCollection, z } from 'astro:content';

const researchCollection = defineCollection({
  type: 'content',
  schema: () => z.object({
    title: z.string(),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => str === 'Now' ? new Date() : new Date(str)),
    partner: z.string(),
    moreInfoUrl: z.string().url().optional(), // 外部連結（可選）
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
    github: z.string().url().optional(),
    personalWebsite: z.string().url().optional(),
    thesisTitle: z.string().optional(), // 論文題目
    thesis: z.string().nullable().optional(), // 論文 PDF 檔名
    thesisPresentation: z.string().nullable().optional(), // 口試簡報 PDF 檔名
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
