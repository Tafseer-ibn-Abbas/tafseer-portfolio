import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    year: z.string(),
    category: z.string(),
    role: z.string(),
    status: z.enum(['In progress', 'Case study in preparation', 'Published']),
    order: z.number(),
    featured: z.boolean().default(true),
    tech: z.array(z.string()).default([]),
    cover: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    liveUrl: z.string().default(''),
    repoUrl: z.string().default('')
  })
});
export const collections = { projects };
