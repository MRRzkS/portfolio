import { notFound } from 'next/navigation';
import { ProjectForm } from '@/components/admin/project-form';
import { getAllTech, getProjectById, getProjectTechIds } from '@/lib/admin-queries';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id } = await params;

  const [project, allTech, selectedTechIds] = await Promise.all([
    getProjectById(id),
    getAllTech(),
    getProjectTechIds(id),
  ]);

  if (!project) notFound();

  return <ProjectForm project={project} allTech={allTech} selectedTechIds={selectedTechIds} />;
}
