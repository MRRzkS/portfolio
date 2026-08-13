/** Shapes returned by the database. Kept in one file so a schema change has
 *  one place to land. */

export interface Metric {
  label: string;
  value: string;
}

export type TechCategory =
  | 'backend'
  | 'frontend'
  | 'database'
  | 'infrastructure'
  | 'tooling';

export interface TechStackItem {
  id: string;
  name: string;
  category: TechCategory;
  sort_order: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  kind: string | null;
  cover_image_url: string | null;
  situation: string;
  task: string;
  action: string[];
  metrics: Metric[];
  /** An honest note about where the project stops short. Optional, and shown
   *  beside the results rather than buried, because naming a boundary reads
   *  as confidence and hiding it does not. */
  limitation: string | null;
  testimonial: string | null;
  testimonial_author: string | null;
  repo_url: string | null;
  live_url: string | null;
  sort_order: number;
}

/** A project with the technologies attached to it, flattened for rendering. */
export interface ProjectWithTech extends Project {
  tech: TechStackItem[];
}

/** The order categories appear in on the page. Declared rather than sorted
 *  alphabetically, because the reading order is a design decision. */
export const CATEGORY_ORDER: TechCategory[] = [
  'backend',
  'database',
  'frontend',
  'infrastructure',
  'tooling',
];

export const CATEGORY_LABEL: Record<TechCategory, string> = {
  backend: 'Backend',
  database: 'Database',
  frontend: 'Frontend',
  infrastructure: 'Infrastructure',
  tooling: 'Tooling',
};
