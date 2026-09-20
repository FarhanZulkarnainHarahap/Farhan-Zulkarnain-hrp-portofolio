"use client";
/* Owned Three.js objects are intentionally mutated inside the render loop. */
/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, MathUtils, Mesh, MeshStandardMaterial, MeshBasicMaterial, Texture, TextureLoader, SRGBColorSpace } from 'three';
import { projectScreenshot, type VaultProject } from '@/data/projects';
import type { AssetInteraction } from '../useAssetViewport';
function Screenshot({plane,src,mobile}:{plane:Mesh;src:string;mobile:boolean}) {
  const [loaded,setLoaded]=useState<{url:string;texture:Texture}|null>(null);
  const [failedUrl,setFailedUrl]=useState<string|null>(null);
  const url=projectScreenshot(src,mobile);
  useEffect(()=>{
    if(!url)return;
    let alive=true;
    const texture=new TextureLoader().load(url,t=>{t.flipY=false;t.colorSpace=SRGBColorSpace;t.needsUpdate=true;if(alive)setLoaded({url,texture:t});},undefined,()=>{if(alive)setFailedUrl(url);});
    return()=>{alive=false;texture.dispose();};
  },[url]);
  const ready=loaded?.url===url;
  return <>{createPortal(<meshBasicMaterial key={ready?url:'placeholder'} attach="material" map={ready?loaded.texture:null} color={ready?'white':'#17212b'} toneMapped={false}/>,plane)}
    <Html center position={[0,0,.23]} style={{pointerEvents:'none'}}><span className="vault-texture-status" data-screenshot={ready?'ready':failedUrl===url||!url?'failed':'loading'}>{ready?'':failedUrl===url||!url?'Preview unavailable':'Loading preview…'}</span></Html>
  </>;
}
export function ProjectArtifact({template,project,index,slot,inspection,mobile,tablet,reduced,interaction,onSelect,onHover,hovered}:{template:Group;project:VaultProject;index:number;slot:number;inspection:boolean;mobile:boolean;tablet:boolean;reduced:boolean;interaction:RefObject<AssetInteraction>;onSelect:()=>void;onHover:(id:string|null)=>void;hovered:boolean}) {
  const root=useRef<Group>(null),arrival=useRef(0);
  const assembly=useMemo(()=>{
    const object=template.clone(true),owned:MeshStandardMaterial[]=[];
    object.traverse(o=>{if(o instanceof Mesh && (o.material as MeshStandardMaterial).name==='Cyan_Signal'){const material=o.material.clone();o.material=material;owned.push(material);}});
    return {object,owned,plane:object.getObjectByName('Screenshot_Plane') as Mesh,left:object.getObjectByName('Left_Rail')!,right:object.getObjectByName('Right_Rail')!};
  },[template]);
  useEffect(()=>()=>assembly.owned.forEach(m=>m.dispose()),[assembly]);
  useFrame(({clock},delta)=>{
    const g=root.current;if(!g)return;
    const dt=Math.min(delta,.1), active=slot===0, selected=active&&inspection, hover=hovered&&!mobile;
    const depth=tablet?.65:1;
    const damp=(a:number,b:number,speed=9)=>reduced?b:MathUtils.damp(a,b,speed,dt);
    const progress=reduced?1:MathUtils.clamp((interaction.current.scroll+.95)/.72,0,1);
    arrival.current=reduced?1:MathUtils.damp(arrival.current,1,8,dt);
    const entrance=arrival.current*MathUtils.clamp((progress-(active?.15:.35))/(active?.2:.25),0,1);
    const float=reduced?0:Math.sin(clock.elapsedTime*.65+index)* (active?.019:.007);
    g.position.set(damp(g.position.x,slot*(inspection?2.57:2.43),6),damp(g.position.y,(active?0:.20)+float-(1-entrance)*.35),damp(g.position.z,((active?(selected?.25:hover?.12:0):inspection?-.65:-.4)-(1-entrance)*.3)*depth,7));
    const size=(active?(selected?1.12:hover?1.045:1):.55)*Math.max(.001,entrance);
    g.scale.setScalar(damp(g.scale.x,size,7));
    g.rotation.x=damp(g.rotation.x,reduced?0:selected?0:((hover?-interaction.current.pointerY*.043:0)+interaction.current.scroll*.035)*depth);
    g.rotation.y=damp(g.rotation.y,reduced?0:selected?0:(slot*-.10+(hover?interaction.current.pointerX*.069:0))*depth);
    assembly.left.position.x=damp(assembly.left.position.x,selected?-.03:hover?-.02:0,12);
    assembly.right.position.x=damp(assembly.right.position.x,selected?.03:hover?.02:0,12);
    const screenMaterial=assembly.plane.material;
    if(screenMaterial instanceof MeshBasicMaterial && screenMaterial.map)screenMaterial.color.setScalar(active||hover?1:.88);
    for(let i=1;i<=5;i++){const slotMesh=assembly.object.getObjectByName(`Tech_Slot_${String(i).padStart(2,'0')}`);if(slotMesh)slotMesh.visible=i<=new Set(project.tags).size;}
    assembly.owned.forEach(mat=>{mat.emissiveIntensity=(selected?3.4:hover?2.9:active?2.2:1.5)+(reduced?0:Math.sin(clock.elapsedTime*.7)*.16);});
  });
  return <group ref={root} name={`Artifact_${project.id}`} position={[slot*2.43,slot===0?0:.2,slot===0?0:-.4]} scale={slot===0?1:.55}
    onPointerOver={e=>{e.stopPropagation();if(!mobile)onHover(project.id);}} onPointerOut={()=>onHover(null)} onClick={e=>{e.stopPropagation();onSelect();}}>
    <primitive object={assembly.object} dispose={null}/><Screenshot plane={assembly.plane} src={project.imageUrl} mobile={mobile}/>
    <Html center position={[-1.02,-.94,.24]} style={{pointerEvents:'none',whiteSpace:'nowrap'}}><span className="vault-index-label">ARTIFACT // {String(index+1).padStart(2,'0')}</span></Html>
    <Html center position={[0,-1.23,.22]} style={{pointerEvents:'none',whiteSpace:'nowrap'}}><span className="vault-title-label">{project.title}</span></Html>
  </group>;
}
