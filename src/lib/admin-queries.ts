import { createSupabaseServerClient } from './supabase-server';
import type { Project, TechCategory } from './types';

/**
 * Reads for the dashboard.
 *
 * Same tables, different client: this one carries the owner's session, so the
 * policies return drafts as well as published rows. The public queries in
 * `queries.ts` use the anonymous client and cannot see either of those things,
 * which is why the two files stay separate rather than sharing a flag.
 */

export interface AdminProject extends Project {
  is_published: boolean;
  updated_at: string;
}

const ADMIN_COLUMNS = `
  id, slug, title, subtitle, kind, cover_image_url,
  situation, task, action, metrics, limitation,
  testimonial, testimonial_author,
  repo_url, live_url, sort_order, is_published, updated_at
`;

export async function getAllProjects(): Promise<AdminProject[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('projects')
    .select(ADMIN_COLUMNS)
    .order('sort_order', { ascending: true })
    .returns<AdminProject[]>();

  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return data ?? [];
}

export async function getProjectById(id: string): Promise<AdminProject | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('projects')
    .select(ADMIN_COLUMNS)
    .eq('id', id)
    .maybeSingle<AdminProject>();

  if (error) throw new Error(`Failed to load project: ${error.message}`);
  return data ?? null;
}

export interface AdminTech {
  id: string;
  name: string;
  category: TechCategory;
  sort_order: number;
  is_published: boolean;
  icon_url: string | null;
}

export async function getAllTech(): Promise<AdminTech[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('tech_stack')
    .select('id, name, category, sort_order, is_published, icon_url')
    .order('sort_order', { ascending: true })
    .returns<AdminTech[]>();

  if (error) throw new Error(`Failed to load tech stack: ${error.message}`);
  return data ?? [];
}

/** Which projects a technology is attached to. Used to explain a refused
 *  delete by naming them, rather than reporting a foreign key violation. */
export async function getTechUsage(techId: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('project_tech')
    .select('projects ( title )')
    .eq('tech_id', techId)
    .returns<{ projects: { title: string } | null }[]>();

  if (error) return [];
  return (data ?? []).map((row) => row.projects?.title).filter((t): t is string => Boolean(t));
}

/** The technology ids attached to one project. */
export async function getProjectTechIds(projectId: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('project_tech')
    .select('tech_id')
    .eq('project_id', projectId)
    .returns<{ tech_id: string }[]>();

  if (error) throw new Error(`Failed to load attachments: ${error.message}`);
  return (data ?? []).map((row) => row.tech_id);
}
