import { z } from 'zod';

/**
 * The boundary between the form and the database.
 *
 * This is an allowlist: it states what a project may contain, and anything
 * outside it is rejected rather than cleaned up. The database repeats the
 * important parts as constraints, which is deliberate. A schema here gives a
 * readable error; a constraint there means a bug in this file still cannot
 * write a malformed row.
 */

const trimmed = z.string().trim();

/** Matches the `projects_slug_format` check constraint. */
export const slugSchema = trimmed
  .min(1, 'Slug is required.')
  .max(80, 'Slug must be 80 characters or fewer.')
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Slug may contain lowercase letters, numbers, and single hyphens between them.',
  );

const optionalText = trimmed.max(4000).optional().or(z.literal('')).transform((value) =>
  value ? value : null,
);

/**
 * A link the owner typed. Many people omit the scheme, so `github.com/foo`
 * is accepted and normalised to `https://github.com/foo` rather than rejected.
 * The scheme is added only when a recognizable host follows, so a stray value
 * is still caught instead of being silently saved.
 */
const optionalUrl = trimmed
  .max(500)
  .optional()
  .or(z.literal(''))
  .transform((value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(value)) return `https://${value}`;
    return value;
  })
  .refine(
    (value) => value === null || /^https?:\/\/\S+$/i.test(value),
    'Links must be a URL, e.g. https://github.com/you',
  );

export const metricSchema = z.object({
  label: trimmed.min(1, 'A metric needs a label.').max(60),
  value: trimmed.min(1, 'A metric needs a value.').max(60),
});

export const projectSchema = z.object({
  slug: slugSchema,
  title: trimmed.min(1, 'Title is required.').max(120),
  subtitle: trimmed.min(1, 'Subtitle is required.').max(300),
  kind: optionalText,

  situation: trimmed.min(1, 'Context is required.').max(6000),
  task: trimmed.min(1, 'Your role is required.').max(2000),

  // One step per line. Blank lines are dropped rather than stored as empty
  // list items, because an empty step renders as an empty numbered row.
  action: z
    .array(trimmed.min(1).max(1200))
    .min(1, 'Add at least one process step.')
    .max(20, 'Twenty steps is more than a reader will follow.'),

  metrics: z
    .array(metricSchema)
    .max(8, 'Eight metrics is more than the spec block can show clearly.'),

  limitation: optionalText,
  testimonial: optionalText,
  testimonial_author: trimmed.max(120).optional().or(z.literal('')).transform((v) => v || null),

  repo_url: optionalUrl,
  live_url: optionalUrl,
  cover_image_url: optionalUrl,

  sort_order: z.coerce.number().int().min(0).max(9999),
  is_published: z.boolean(),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Cover image rules, enforced on the server before anything reaches storage.
 * A file input's `accept` attribute is a convenience for the person choosing a
 * file, not a control: it is trivially bypassed.
 */
export const ALLOWED_IMAGE_TYPES = ['image/webp', 'image/png', 'image/jpeg'] as const;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return 'Cover image must be a WebP, PNG, or JPEG file.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Cover image must be 2 MB or smaller.';
  }
  return null;
}

/** Turns a textarea into the string array the database column expects. */
export function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** A technology entry. The category list matches the database check
 *  constraint; adding one means changing both, which is the cost of the
 *  guarantee that a typo cannot create a silently empty column. */
export const techSchema = z.object({
  name: trimmed.min(1, 'Name is required.').max(40),
  category: z.enum(['backend', 'frontend', 'database', 'infrastructure', 'tooling']),
  sort_order: z.coerce.number().int().min(0).max(9999),
  is_published: z.boolean(),
  // Optional brand logo. Reuses the same scheme-tolerant normaliser as project
  // links, so a bare "cdn.example.com/php.svg" is accepted and stored whole.
  icon_url: optionalUrl.optional(),
});

export type TechInput = z.infer<typeof techSchema>;
