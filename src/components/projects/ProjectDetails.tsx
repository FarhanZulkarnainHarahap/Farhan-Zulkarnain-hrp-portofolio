import Link from 'next/link';
import type { VaultProject } from '@/data/projects';
import { getProjectSlug } from '@/lib/portfolio/projects';

/** Keep the showcase compact; the dedicated project route owns all details. */
export function ProjectDetails({ project }: { project: VaultProject }) {
  return (
    <div className="vault-details" aria-live="polite">
      <div className="project-summary">
        <h3>{project.title}</h3>
        <Link className="text-link" href={`/projects/${getProjectSlug(project)}`}>
          Explore project ↗
        </Link>
      </div>
    </div>
  );
}
