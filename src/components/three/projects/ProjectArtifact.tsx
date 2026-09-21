"use client";
/* These cloned Three.js objects and materials are owned imperative scene state. */
/* eslint-disable react-hooks/immutability */
import {useEffect,useMemo,useRef,type RefObject} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {Group,Mesh,MeshStandardMaterial,MathUtils,Box3,Vector3} from 'three';
import type {DeviceMode,VaultProject} from '@/data/projects';
import type {AssetInteraction} from '../useAssetViewport';
import type {ProjectSceneLayout} from './useProjectSceneLayout';
import {deviceTargets} from './deviceMotion';
import {DeviceScreen} from './DeviceScreen';
const prefixes={desktop:'Monitor',laptop:'Laptop',mobile:'Mobile'};
export function ProjectArtifact({template,project,device,main,slot,inspection,reduced,layout,interaction,transition,hovered,onHover,onSelect}:{template:Group;project:VaultProject;device:DeviceMode;main:boolean;slot:number;inspection:boolean;reduced:boolean;layout:ProjectSceneLayout;interaction:RefObject<AssetInteraction>;transition:RefObject<number>;hovered:boolean;onHover:(mode:DeviceMode|null)=>void;onSelect:()=>void}){
 const root=useRef<Group>(null),pointer=useRef<[number,number]>([0,0]),visual=useRef({opacity:0,brightness:1});
 const {camera,gl}=useThree();
 const assembly=useMemo(()=>{
  const object=template.clone(true),materials=new Map<string,MeshStandardMaterial>();
  object.traverse(o=>{if(o instanceof Mesh){const original=o.material as MeshStandardMaterial;let material=materials.get(original.uuid);if(!material){material=original.clone();material.transparent=true;materials.set(original.uuid,material);}o.material=material;}});
  const prefix=prefixes[device],lid=object.getObjectByName('Laptop_ScreenFrame');
  return {object,materials:[...materials.values()].map(material=>({material,opacity:material.opacity,depthWrite:material.depthWrite})),plane:object.getObjectByName(prefix+'_Screen') as Mesh,lid,lidRest:lid?.rotation.x||0,left:object.getObjectByName(prefix+'_Left_Module'),right:object.getObjectByName(prefix+'_Right_Module')};
 },[template,device]);
 const geometry=useMemo(()=>({box:new Box3(),corner:new Vector3()}),[]);
 const changePulse=useRef(0),lastSample=useRef(-1);
 useEffect(()=>{changePulse.current=1;},[project.id,main,inspection]);
 useEffect(()=>()=>assembly.materials.forEach(({material})=>material.dispose()),[assembly]);
 const pointerMove=(event:ThreeEvent<PointerEvent>)=>{
  if(!layout.enablePointerTilt||event.pointerType==='touch'||!root.current)return;
  const rect=gl.domElement.getBoundingClientRect();geometry.box.setFromObject(root.current);
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const x of [geometry.box.min.x,geometry.box.max.x])for(const y of [geometry.box.min.y,geometry.box.max.y])for(const z of [geometry.box.min.z,geometry.box.max.z]){
   const p=geometry.corner.set(x,y,z).project(camera);const px=(p.x+1)*rect.width/2,py=(1-p.y)*rect.height/2;minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py);
  }
  pointer.current=[MathUtils.clamp((event.clientX-rect.left-minX)/Math.max(1,maxX-minX)*2-1,-1,1),MathUtils.clamp(1-(event.clientY-rect.top-minY)/Math.max(1,maxY-minY)*2,-1,1)];
 };
 useFrame(({clock},delta)=>{
  const g=root.current;if(!g)return;const dt=Math.min(delta,.08),damp=(a:number,b:number,speed=8)=>reduced?b:MathUtils.damp(a,b,speed,dt);
  const progress=reduced?1:MathUtils.clamp((interaction.current.scroll+.97)/.75,0,1);
  const entrance=reduced?1:MathUtils.clamp((progress-(main?.15:.50))/(main?.35:.20),0,1);
  const t=deviceTargets({device,main,slot,time:clock.elapsedTime,hovered,inspection,reduced,pointer:pointer.current,scroll:interaction.current.scroll,transition:transition.current,entrance,tablet:layout.tablet});
  g.position.set(damp(g.position.x,t.x),damp(g.position.y,t.y),damp(g.position.z,t.z));g.rotation.set(damp(g.rotation.x,t.rx),damp(g.rotation.y,t.ry),0);g.scale.setScalar(damp(g.scale.x,t.scale));
  visual.current.opacity=damp(visual.current.opacity,t.opacity,12);visual.current.brightness=damp(visual.current.brightness,t.brightness,12);
  changePulse.current=reduced?0:MathUtils.damp(changePulse.current,0,5,dt);
  const activation=reduced?1:MathUtils.clamp((progress-.7)/.15,0,1);
  for(const {material,opacity,depthWrite} of assembly.materials){material.opacity=opacity*visual.current.opacity;material.depthWrite=depthWrite&&visual.current.opacity>.97;if(material.name==='Cyan_Signal')material.emissiveIntensity=(t.led+changePulse.current*.7)*activation;}
  if(assembly.left)assembly.left.position.x=damp(assembly.left.position.x,-t.rail,12);
  if(assembly.right)assembly.right.position.x=damp(assembly.right.position.x,t.rail,12);
  if(assembly.lid)assembly.lid.rotation.x=damp(assembly.lid.rotation.x,assembly.lidRest+t.lid,10);
  // Tiny depth-only differential preserves the lid/screen attachment and avoids edge gaps.
  assembly.plane.position.z=damp(assembly.plane.position.z,hovered&&!inspection&&!reduced?.0015:0,10);
  if(main&&(reduced||clock.elapsedTime-lastSample.current>.25)){
   lastSample.current=clock.elapsedTime;g.updateWorldMatrix(true,true);camera.updateMatrixWorld();geometry.box.setFromObject(g);
   let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
   for(const x of [geometry.box.min.x,geometry.box.max.x])for(const y of [geometry.box.min.y,geometry.box.max.y])for(const z of [geometry.box.min.z,geometry.box.max.z]){const p=geometry.corner.set(x,y,z).project(camera);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);}
   gl.domElement.dataset.deviceBounds=JSON.stringify([minX,minY,maxX,maxY]);
   gl.domElement.dataset.devicePose=JSON.stringify([g.position.y,g.rotation.x,g.rotation.y,g.scale.x].map(n=>Number(n.toFixed(5))));
   gl.domElement.dataset.motionState=t.state;gl.domElement.dataset.renderedDevice=device;
  }

 });
 return <group ref={root} name={`FZH_Device_${device}`} position={[slot*2.3,0,main?0:-.42]} scale={main?1:device==='mobile'?.43:.60}
  onPointerOver={e=>{e.stopPropagation();if(layout.enablePointerTilt&&e.pointerType!=='touch')onHover(device);}} onPointerMove={pointerMove} onPointerOut={()=>{onHover(null);pointer.current=[0,0];}} onClick={e=>{e.stopPropagation();if(transition.current>.97)onSelect();}}>
  <primitive object={assembly.object} dispose={null}/><DeviceScreen plane={assembly.plane} project={project} device={device} compact={layout.mobile} secondary={!main} inspection={inspection&&main} visual={visual} reduced={reduced}/>
 </group>;
}
