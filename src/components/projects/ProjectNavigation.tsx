"use client";
import type {VaultProject} from '@/data/projects';
export function ProjectNavigation({projects,active,onSelect}:{projects:VaultProject[];active:number;onSelect:(i:number)=>void}) {
  return <><div className="project-list" aria-label="Select a project">{projects.map((p,i)=><button key={p.id} className={active===i?'selected':''} aria-pressed={active===i} onClick={()=>onSelect(i)}><span className="eyebrow">{String(i+1).padStart(2,'0')}</span><span>{p.title}</span><span>↗</span></button>)}</div><div className="vault-navigation"><button aria-label="Previous project" disabled={projects.length<2} onClick={()=>onSelect((active+projects.length-1)%projects.length)}>← Previous</button><span>{active+1} / {projects.length}</span><button aria-label="Next project" disabled={projects.length<2} onClick={()=>onSelect((active+1)%projects.length)}>Next →</button></div></>;
}
