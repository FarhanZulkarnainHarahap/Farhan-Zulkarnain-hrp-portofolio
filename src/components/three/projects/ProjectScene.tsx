"use client";
/* R3F camera and renderer state are updated through their imperative APIs. */
/* eslint-disable react-hooks/immutability */
import {useEffect,useRef,useState,type RefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Environment,Lightformer,useGLTF} from '@react-three/drei';
import {MathUtils,OrthographicCamera,SRGBColorSpace} from 'three';
import {deviceModes,type DeviceMode,type VaultProject} from '@/data/projects';
import type {AssetInteraction} from '../useAssetViewport';
import type {ProjectSceneLayout} from './useProjectSceneLayout';
import {ProjectArtifact} from './ProjectArtifact';
import {ProjectRail} from './ProjectRail';
export function ProjectScene({project,device,inspection,reduced,layout,interaction,onInspect,onDevice,hovered,onHover,onReady}:{project:VaultProject;device:DeviceMode;inspection:boolean;reduced:boolean;layout:ProjectSceneLayout;interaction:RefObject<AssetInteraction>;onInspect:()=>void;onDevice:(d:DeviceMode)=>void;hovered:DeviceMode|null;onHover:(id:DeviceMode|null)=>void;onReady:()=>void}){
 const monitor=useGLTF('/models/projects/devices/FZH_Kinetic_Monitor.glb'),laptop=useGLTF('/models/projects/devices/FZH_Kinetic_Laptop.glb'),mobile=useGLTF('/models/projects/devices/FZH_Kinetic_Mobile.glb'),rail=useGLTF('/models/projects/FZH_Project_Rail.glb');
 const assets={desktop:monitor.scene,laptop:laptop.scene,mobile:mobile.scene};
 const [displayed,setDisplayed]=useState({project,device});const changing=displayed.project.id!==project.id||displayed.device!==device;
 const transition=useRef(1),quality=useRef({time:0,frames:0,slow:0,scale:1});
 const {camera,size,gl,setDpr,invalidate}=useThree();
 useEffect(()=>{if(!changing)return;const timer=setTimeout(()=>{transition.current=reduced?1:0;setDisplayed({project,device});},reduced?0:280);return()=>clearTimeout(timer);},[project,device,changing,reduced]);
 useEffect(onReady,[onReady]);
 useEffect(()=>{gl.outputColorSpace=SRGBColorSpace;},[gl]);
 const applyQuality=(scale:number)=>{
  const preferred=MathUtils.clamp(window.devicePixelRatio,...layout.dprRange)*scale;
  const dpr=Math.max(1.15,Math.min(preferred,Math.sqrt(2_800_000/Math.max(1,size.width*size.height))));
  setDpr(dpr);gl.domElement.dataset.renderDpr=dpr.toFixed(2);
 };
 useEffect(()=>{applyQuality(quality.current.scale);invalidate();},[size.width,size.height,layout.dprRange[0],layout.dprRange[1]]); // eslint-disable-line react-hooks/exhaustive-deps
 useFrame((_,delta)=>{
  const dt=Math.min(delta,.08);transition.current=reduced?1:MathUtils.damp(transition.current,changing?0:1,12,dt);
  const cam=camera as OrthographicCamera;
  const worldWidth=layout.showSecondary?6.8:displayed.device==='mobile'?1.55:3.85;
  const worldHeight=displayed.device==='mobile'?2.75:3.05;
  const zoom=Math.min(size.width/worldWidth,size.height/worldHeight);
  cam.zoom=reduced?zoom:MathUtils.damp(cam.zoom,zoom,9,dt);
  const cameraY=displayed.device==='laptop'?3.0:.35;
  cam.position.y=reduced?cameraY:MathUtils.damp(cam.position.y,cameraY,8,dt);cam.lookAt(0,-.05,0);cam.updateProjectionMatrix();
  // Sustained slow frames reduce density one bounded step; CSS size never changes.
  if(!reduced){const q=quality.current;q.time+=delta;q.frames++;if(delta>.04)q.slow++;if(q.time>4){if(q.slow/q.frames>.35&&q.scale>.8){q.scale=.8;applyQuality(q.scale);}q.time=0;q.frames=0;q.slow=0;}}
 });
 const modes=layout.showSecondary?deviceModes:[displayed.device];
 const secondary=modes.filter(d=>d!==displayed.device);
 return <>
  <ambientLight intensity={.8}/><directionalLight position={[2,4,5]} intensity={2.4}/><directionalLight position={[-4,-1,3]} intensity={.8} color="#a4cddd"/>
  <Environment frames={1} resolution={64}><Lightformer position={[0,3,4]} scale={[5,3,1]} intensity={2}/></Environment>
  <ProjectRail template={rail.scene} reduced={reduced} mobile={!layout.showSecondary} inspection={inspection} interaction={interaction} compactScale={displayed.device==='mobile'?.20:.53}/>
  {modes.map(mode=><ProjectArtifact key={mode} template={assets[mode]} project={displayed.project} device={mode} main={mode===displayed.device} slot={mode===displayed.device?0:secondary.indexOf(mode)===0?-1:1} inspection={inspection} reduced={reduced} layout={layout} interaction={interaction} transition={transition} hovered={hovered===mode&&!changing} onHover={onHover} onSelect={()=>mode===displayed.device?onInspect():onDevice(mode)}/>)}
 </>;
}
