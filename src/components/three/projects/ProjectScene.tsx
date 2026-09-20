"use client";
/* R3F camera projection is an imperative Three.js API. */
/* eslint-disable react-hooks/immutability */
import {useEffect,useMemo,type RefObject} from 'react';
import {useThree} from '@react-three/fiber';
import {Environment,Lightformer,useGLTF} from '@react-three/drei';
import {OrthographicCamera} from 'three';
import {projectWindow,type VaultProject} from '@/data/projects';
import type {AssetInteraction} from '../useAssetViewport';
import {ProjectArtifact} from './ProjectArtifact';
import {ProjectRail} from './ProjectRail';
export function ProjectScene({projects,active,inspection,mobile,tablet,reduced,interaction,onSelect,hovered,onHover,onReady}:{projects:VaultProject[];active:number;inspection:boolean;mobile:boolean;tablet:boolean;reduced:boolean;interaction:RefObject<AssetInteraction>;onSelect:(i:number)=>void;hovered:string|null;onHover:(id:string|null)=>void;onReady:()=>void}) {
  const artifact=useGLTF('/models/projects/FZH_Project_Artifact.glb'),rail=useGLTF('/models/projects/FZH_Project_Rail.glb');
  const {camera,size,invalidate}=useThree();
  const visible=useMemo(()=>projectWindow(projects.length,active,mobile),[projects.length,active,mobile]);
  useEffect(()=>{const cam=camera as OrthographicCamera;cam.zoom=Math.min(size.width/(mobile?4.15:7.1),size.height/3.6);cam.position.y=-.1;cam.updateProjectionMatrix();invalidate();},[camera,size,mobile,invalidate]);
  useEffect(onReady,[onReady]);
  return <>
    <ambientLight intensity={.8}/><directionalLight position={[2,4,5]} intensity={2.4}/><directionalLight position={[-4,-1,3]} intensity={.8} color="#a4cddd"/>
    <Environment frames={1} resolution={64}><Lightformer position={[0,3,4]} scale={[5,3,1]} intensity={2}/></Environment>
    <ProjectRail template={rail.scene} reduced={reduced} mobile={mobile} inspection={inspection} interaction={interaction}/>
    {visible.map(({index,slot})=><ProjectArtifact key={projects[index].id} template={artifact.scene} project={projects[index]} index={index} slot={slot} inspection={inspection} mobile={mobile} tablet={tablet} reduced={reduced} interaction={interaction} onSelect={()=>onSelect(index)} hovered={hovered===projects[index].id} onHover={onHover}/>)}
  </>;
}
