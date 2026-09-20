"use client";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import type {Project} from '@/services/api';
import {useCollection} from './data';
import {CollectionState,SectionHeading} from './Primitives';
import {useScene} from './SceneState';
import {ProjectDetails} from '@/components/projects/ProjectDetails';
import {ProjectNavigation} from '@/components/projects/ProjectNavigation';
const ProjectVault=dynamic(()=>import('../three/projects/ProjectVault'),{ssr:false,loading:()=> <p>Loading project preview…</p>});
export default function Projects({selectedOnly=false}:{selectedOnly?:boolean}) {
  const state=useCollection<Project>('/api/portofolios');
  const {selected,setSelected,setProjects}=useScene();
  const [inspection,setInspection]=useState(false);
  useEffect(()=>{setProjects(selectedOnly?state.data.slice(0,4):state.data);},[state.data,selectedOnly,setProjects]);
  const projects=selectedOnly?state.data.slice(0,4):state.data;
  const active=Math.max(0,Math.min(selected,projects.length-1)),current=projects[active];
  const select=(i:number)=>{setSelected(i);setInspection(true);};
  return <section className="section project-section" id="work"><SectionHeading number="04" label={selectedOnly?'SELECTED WORK':'PROJECT EXPLORER'} title="Ideas, engineered into reality." description="A closer look at the interfaces, systems, and decisions behind my work."/>
    <CollectionState {...state} empty={!projects.length}/>
    {current&&!state.error&&<div className="project-explorer project-vault-layout"><div className="vault-project-index"><ProjectNavigation projects={projects} active={active} onSelect={select}/></div><div className="project-stage"><ProjectVault projects={projects} active={active} inspection={inspection} onSelect={select} onDeselect={()=>setInspection(false)}/><ProjectDetails project={current} inspection={inspection}/></div></div>}
    {selectedOnly&&<Link className="text-link all-projects" href="/projects">View all projects <span>↗</span></Link>}
  </section>;
}
