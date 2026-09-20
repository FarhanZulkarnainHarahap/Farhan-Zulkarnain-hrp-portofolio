import Link from 'next/link';
import type {VaultProject} from '@/data/projects';
import {getProjectSlug} from '@/lib/portfolio/projects';
import {safeHref} from '@/components/kinetic/data';
export function ProjectDetails({project:p,inspection}:{project:VaultProject;inspection:boolean}) {
  return <div className="vault-details" aria-live="polite">
    <div className="project-summary"><div>{p.caseType&&<p className="eyebrow">{p.caseType}</p>}<h3>{p.title}</h3></div><Link className="text-link" href={`/projects/${getProjectSlug(p)}`}>Explore project ↗</Link></div>
    <p className="project-description">{p.description}</p><div className="tags">{[...new Set(p.tags)].map(tag=><span key={tag}>{tag}</span>)}</div>
    {inspection&&<div className="vault-case-details">{p.caseProblem&&<div><h4>Problem</h4><p>{p.caseProblem}</p></div>}{p.caseSolution&&<div><h4>Solution</h4><p>{p.caseSolution}</p></div>}{p.caseResult&&<div><h4>Outcome</h4><p>{p.caseResult}</p></div>}{p.features?.length>0&&<div><h4>Key features</h4><ul>{[...new Set(p.features)].map(f=><li key={f}>{f}</li>)}</ul></div>}</div>}
    <div className="project-links">{safeHref(p.demoUrl)&&<a href={safeHref(p.demoUrl)} target="_blank" rel="noreferrer">Live website ↗</a>}{safeHref(p.repoUrl)&&<a href={safeHref(p.repoUrl)} target="_blank" rel="noreferrer">Source code ↗</a>}</div>
  </div>;
}
