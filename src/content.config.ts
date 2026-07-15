import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader } from 'astro/loaders';

const flashcardSchema = z.object({
  domain: z.string(),
  topic: z.string(),
  front: z.string(),
  back: z.string(),
});

const mcqQuestionSchema = z.object({
  domain: z.string(),
  topic: z.string(),
  question: z.string(),
  choices: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
});

const cliCommandSchema = z.object({
  domain: z.string(),
  topic: z.string(),
  os: z.enum(['windows', 'linux']),
  prompt: z.string(),
  accepted: z.array(z.string()).min(1),
  hint: z.string(),
});

const subnetCalcConfigSchema = z.object({
  type: z.literal('subnet-calc'),
  domain: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const ipv6ShrinkConfigSchema = z.object({
  type: z.literal('ipv6-shrink'),
  domain: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const portMatchConfigSchema = z.object({
  type: z.literal('port-match'),
  domain: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const minigameConfigSchema = z.discriminatedUnion('type', [
  subnetCalcConfigSchema,
  ipv6ShrinkConfigSchema,
  portMatchConfigSchema,
]);

/**
 * Astro's built-in `glob` loader treats one file as one entry. Our content is
 * split one file per topic but each file holds an array of many entries, so
 * this flattens each matched JSON array file into individual store entries.
 */
function jsonArrayLoader(name: string, modules: Record<string, unknown>): Loader {
  return {
    name,
    async load({ store, parseData }) {
      store.clear();
      for (const [filePath, mod] of Object.entries(modules)) {
        const topic = filePath.split('/').pop()!.replace(/\.json$/, '');
        const entries = (mod as { default: unknown }).default;
        if (!Array.isArray(entries)) continue;
        for (let i = 0; i < entries.length; i++) {
          const id = `${topic}--${i}`;
          const data = await parseData({ id, data: entries[i] as Record<string, unknown> });
          store.set({ id, data });
        }
      }
    },
  };
}

const flashcardModules = import.meta.glob('./content/a-plus/flashcards/*.json', { eager: true });
const mcqModules = import.meta.glob('./content/a-plus/mcq/*.json', { eager: true });
const cliModules = import.meta.glob('./content/a-plus/cli/*.json', { eager: true });

const flashcards = defineCollection({
  loader: jsonArrayLoader('flashcards', flashcardModules),
  schema: flashcardSchema,
});

const mcq = defineCollection({
  loader: jsonArrayLoader('mcq', mcqModules),
  schema: mcqQuestionSchema,
});

const cli = defineCollection({
  loader: jsonArrayLoader('cli', cliModules),
  schema: cliCommandSchema,
});

const minigames = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/a-plus/minigames' }),
  schema: minigameConfigSchema,
});

export const collections = { flashcards, mcq, cli, minigames };
