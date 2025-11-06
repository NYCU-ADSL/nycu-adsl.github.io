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
    pinned: z.boolean().optional().default(false), // 置頂標記
  }),
});

const albumCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.string().transform((str) => new Date(str)),
    description: z.string().optional(),
    image: image(),
  }),
});

const heroAnnouncementCollection = defineCollection({
  type: 'content',
  schema: () => z.object({
    title: z.string(), // 主標題
    subtitle: z.string().optional(), // 副標題/歡迎語
    badge: z.string().optional(), // 徽章文字（如「重要公告」）
    ctaText: z.string().default('查看詳細資訊'), // 按鈕文字
    link: z.string(), // 連結（如 news slug）
    backgroundImage: z.string().url().optional(), // 背景圖片 URL
    theme: z.enum(['orange', 'blue', 'red', 'green', 'purple']).default('orange'), // 主題顏色
    active: z.boolean().default(true), // 是否啟用
    order: z.number().default(0), // 排序（數字越小越前面）
  }),
});

export const collections = {
  research: researchCollection,
  member: memberCollection,
  news: newsCollection,
  album: albumCollection,
  'hero-announcements': heroAnnouncementCollection,
};
