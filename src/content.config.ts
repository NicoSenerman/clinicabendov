import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const procedimientosSchema = z.object({
  title: z.string(),
  slug: z.string(),
  category: z.enum(['corporales', 'faciales', 'intimos', 'mamarios']),
  description: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  heroImage: z.string().optional(),
  thumbnailImage: z.string().optional(),
  order: z.number().default(0),
  draft: z.boolean().default(false),
});

const procedimientosCorporales = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/procedimientos-corporales' }),
  schema: procedimientosSchema,
});

const procedimientosFaciales = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/procedimientos-faciales' }),
  schema: procedimientosSchema,
});

const procedimientosIntimos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/procedimientos-intimos' }),
  schema: procedimientosSchema,
});

const procedimientosMamarios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/procedimientos-mamarios' }),
  schema: procedimientosSchema,
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    author: z.string().default('Clinica Bendov'),
    categories: z.array(z.string()).default([]),
    description: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    heroImage: z.string().optional(),
    thumbnailImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  'procedimientos-corporales': procedimientosCorporales,
  'procedimientos-faciales': procedimientosFaciales,
  'procedimientos-intimos': procedimientosIntimos,
  'procedimientos-mamarios': procedimientosMamarios,
  blog,
};
