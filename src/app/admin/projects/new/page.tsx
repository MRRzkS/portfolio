import { ProjectForm } from '@/components/admin/project-form';
import { getAllTech } from '@/lib/admin-queries';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  const allTech = await getAllTech();

  return <ProjectForm project={null} allTech={allTech} selectedTechIds={[]} />;
}
