'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTechUsage } from '@/lib/admin-queries';
import { createSupabaseServerClient, getSignedInUser } from '@/lib/supabase-server';
import {
  linesToArray,
  projectSchema,
  techSchema,
  validateImage,
  type ProjectInput,
} from '@/lib/validation';

export interface ActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
  /** Echoed back so a rejected login does not clear the address as well. */
  email?: string;
}

const COVERS_BUCKET = 'covers';
const TECH_ICONS_BUCKET = 'tech-icons';

/**
 * Every mutation below starts by confirming a user. That check is redundant
 * with the middleware and with the row level security policies, and it stays
 * anyway: a server action is a public endpoint, and the middleware only guards
 * page navigations.
 */
async function requireUser() {
  const user = await getSignedInUser();
  if (!user) redirect('/admin/login');
  return user;
}

// =====================================================================
// Session
// =====================================================================

export async function signIn(_previous: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/admin');

  if (!email || !password) {
    return { error: 'Enter your email and password.', email };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // One message for a wrong password and for an unknown address, so this
    // form cannot be used to discover which accounts exist.
    return { error: 'Those credentials were not accepted.', email };
  }

  // Only redirect to a path within this site; an open redirect here would let
  // a crafted link bounce a signed-in owner somewhere else entirely.
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// =====================================================================
// Projects
// =====================================================================

/** Republishes every page whose content could have changed. */
function revalidateProject(slug: string, previousSlug?: string | null) {
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  revalidatePath(`/work/${slug}`);

  // A renamed project leaves its old page cached under the old address.
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/work/${previousSlug}`);
  }
}

function parseForm(formData: FormData) {
  const metricLabels = formData.getAll('metric_label').map(String);
  const metricValues = formData.getAll('metric_value').map(String);

  const metrics = metricLabels
    .map((label, index) => ({ label: label.trim(), value: (metricValues[index] ?? '').trim() }))
    // A row where both boxes are empty is a row the owner did not fill in, not
    // an error worth stopping the save for.
    .filter((metric) => metric.label !== '' || metric.value !== '');

  return projectSchema.safeParse({
    slug: formData.get('slug'),
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    kind: formData.get('kind'),
    situation: formData.get('situation'),
    task: formData.get('task'),
    action: linesToArray(String(formData.get('action') ?? '')),
    metrics,
    limitation: formData.get('limitation'),
    testimonial: formData.get('testimonial'),
    testimonial_author: formData.get('testimonial_author'),
    repo_url: formData.get('repo_url'),
    live_url: formData.get('live_url'),
    cover_image_url: formData.get('cover_image_url'),
    sort_order: formData.get('sort_order') ?? 0,
    is_published: formData.get('is_published') === 'on',
  });
}

function collectFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

export async function saveProject(
  projectId: string | null,
  previousSlug: string | null,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: 'Some fields need attention.', fieldErrors: collectFieldErrors(parsed.error) };
  }

  const values: ProjectInput = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = projectId
    ? await supabase.from('projects').update(values).eq('id', projectId).select('id').single()
    : await supabase.from('projects').insert(values).select('id').single();

  if (error) {
    // The unique index on slug is the collision worth naming; anything else is
    // reported as it came back rather than guessed at.
    if (error.code === '23505') {
      return { fieldErrors: { slug: 'Another project already uses this slug.' } };
    }
    return { error: `Save failed: ${error.message}` };
  }

  const techIds = formData.getAll('tech_id').map(String).filter(Boolean);
  const attachmentProblem = await syncProjectTech(data.id, techIds);

  if (attachmentProblem) {
    // The project itself saved. Say so, rather than implying nothing happened.
    return { error: `${attachmentProblem} The rest of the project was saved.` };
  }

  revalidateProject(values.slug, previousSlug);
  redirect('/admin');
}

export async function setPublished(
  projectId: string,
  slug: string,
  isPublished: boolean,
): Promise<ActionResult> {
  await requireUser();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('projects')
    .update({ is_published: isPublished })
    .eq('id', projectId);

  if (error) return { error: `Could not change visibility: ${error.message}` };

  revalidateProject(slug);
  revalidatePath('/admin');
  return {};
}

export async function deleteProject(projectId: string, slug: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) return { error: `Could not delete: ${error.message}` };

  revalidateProject(slug);
  revalidatePath('/admin');
  redirect('/admin');
}

// =====================================================================
// Cover images
// =====================================================================

export async function uploadCover(
  _previous: { url?: string; error?: string },
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireUser();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image first.' };
  }

  const problem = validateImage(file);
  if (problem) return { error: problem };

  const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${crypto.randomUUID()}.${extension}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from(COVERS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: `Upload failed: ${error.message}` };

  const { data } = supabase.storage.from(COVERS_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

/** Technology logos land in their own bucket, separate from cover images, so
 *  the two lists can never cross. Shares the same server-side checks. */
export async function uploadTechIcon(
  _previous: { url?: string; error?: string },
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  await requireUser();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose an image first.' };
  }

  const problem = validateImage(file);
  if (problem) return { error: problem };

  const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${crypto.randomUUID()}.${extension}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from(TECH_ICONS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: `Upload failed: ${error.message}` };

  const { data } = supabase.storage.from(TECH_ICONS_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

// =====================================================================
// Tech stack
// =====================================================================

/** Attachments change what the public pages render, so both are republished. */
function revalidateStack() {
  revalidatePath('/');
  revalidatePath('/work', 'layout');
  revalidatePath('/admin/stack');
}

export async function saveTech(
  techId: string | null,
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();

  const parsed = techSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    sort_order: formData.get('sort_order') ?? 0,
    is_published: formData.get('is_published') === 'on',
    icon_url: (formData.get('icon_url') as string | null) || null,
  });

  if (!parsed.success) {
    return { error: 'Some fields need attention.', fieldErrors: collectFieldErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = techId
    ? await supabase.from('tech_stack').update(parsed.data).eq('id', techId)
    : await supabase.from('tech_stack').insert(parsed.data);

  if (error) {
    if (error.code === '23505') {
      return { fieldErrors: { name: 'That technology is already in the list.' } };
    }
    return { error: `Save failed: ${error.message}` };
  }

  revalidateStack();
  return {};
}

export async function deleteTech(techId: string): Promise<ActionResult> {
  await requireUser();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('tech_stack').delete().eq('id', techId);

  if (error) {
    // The foreign key refused it. Report which projects are in the way rather
    // than the constraint name, which tells the owner nothing actionable.
    if (error.code === '23503') {
      const inUse = await getTechUsage(techId);
      return {
        error: inUse.length
          ? `Still attached to ${inUse.join(', ')}. Detach it there first.`
          : 'Still attached to a project. Detach it first.',
      };
    }
    return { error: `Could not delete: ${error.message}` };
  }

  revalidateStack();
  return {};
}

/**
 * Replaces a project's attachments with exactly the ids given.
 *
 * Delete-then-insert rather than a diff: a project has a handful of
 * technologies, so working out which changed costs more code than redoing all
 * of them, and the result is easier to be sure about.
 */
async function syncProjectTech(projectId: string, techIds: string[]) {
  const supabase = await createSupabaseServerClient();

  const { error: clearError } = await supabase
    .from('project_tech')
    .delete()
    .eq('project_id', projectId);

  if (clearError) return `Could not update technologies: ${clearError.message}`;
  if (techIds.length === 0) return null;

  const { error: insertError } = await supabase
    .from('project_tech')
    .insert(techIds.map((techId) => ({ project_id: projectId, tech_id: techId })));

  if (insertError) return `Could not attach technologies: ${insertError.message}`;
  return null;
}
