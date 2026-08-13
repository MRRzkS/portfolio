import { supabase } from './supabase';
import { CATEGORY_ORDER } from './types';
import type { Project, ProjectWithTech, TechStackItem } from './types';

/**
 * Turns a database error into something actionable.
 *
 * These queries run at build time, so a failure here fails a deploy. The two
 * causes that actually happen are a schema that predates the code and a
 * project URL pointing somewhere else, and neither is obvious from PostgREST's
 * own wording.
 */
function describe(error: { message: string; code?: string }, what: string): Error {
  if (error.code === '42P01') {
    return new Error(
      `${what}: the tables do not exist. Run db/schema.sql in the Supabase SQL editor, then redeploy.`,
    );
  }
  if (error.code === '42703') {
    return new Error(
      `${what}: ${error.message}. The database is older than this code. ` +
        'Run db/schema.sql again; it is safe to re-run and will add what is missing.',
    );
  }
  return new Error(`${what}: ${error.message}`);
}

/**
 * Every query below omits a filter on `is_published`. That is deliberate: the
 * row level security policy already restricts an anonymous reader to published
 * rows, and repeating the condition here would create a second place for the
 * rule to live and drift from the first.
 */

const PROJECT_COLUMNS = `
  id, slug, title, subtitle, kind, cover_image_url,
  situation, task, action, metrics, limitation,
  testimonial, testimonial_author,
  repo_url, live_url, sort_order
`;

/** Rows arrive with the join nested; the page wants a flat list. */
interface ProjectRow extends Project {
  project_tech: { tech_stack: TechStackItem | null }[] | null;
}

function flattenTech(row: ProjectRow): ProjectWithTech {
  const { project_tech, ...project } = row;

  // `sort_order` restarts within each category, so sorting on it alone leaves
  // ties across categories and the chip order changes between builds. Grouping
  // by category first makes it stable and reads better: languages, then data
  // stores, then the rest.
  const tech = (project_tech ?? [])
    .map((join) => join.tech_stack)
    .filter((item): item is TechStackItem => item !== null)
    .sort((a, b) => {
      const byCategory =
        CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      return byCategory !== 0 ? byCategory : a.sort_order - b.sort_order;
    });

  return { ...project, tech };
}

export async function getProjects(): Promise<ProjectWithTech[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`${PROJECT_COLUMNS}, project_tech ( tech_stack ( id, name, category, sort_order ) )`)
    .order('sort_order', { ascending: true })
    .returns<ProjectRow[]>();

  if (error) throw describe(error, 'Failed to load projects');

  return (data ?? []).map(flattenTech);
}

/** Returns null rather than throwing, so the page can render a 404. */
export async function getProjectBySlug(slug: string): Promise<ProjectWithTech | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`${PROJECT_COLUMNS}, project_tech ( tech_stack ( id, name, category, sort_order ) )`)
    .eq('slug', slug)
    .maybeSingle<ProjectRow>();

  if (error) throw describe(error, `Failed to load project ${slug}`);
  if (!data) return null;

  return flattenTech(data);
}

export async function getTechStack(): Promise<TechStackItem[]> {
  const { data, error } = await supabase
    .from('tech_stack')
    .select('id, name, category, sort_order')
    .order('sort_order', { ascending: true })
    .returns<TechStackItem[]>();

  if (error) throw describe(error, 'Failed to load tech stack');

  return data ?? [];
}
