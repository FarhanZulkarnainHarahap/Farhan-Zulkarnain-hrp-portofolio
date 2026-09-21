"use client";
/* Screen material, texture and mesh are owned by this component's Three.js clone. */
/* eslint-disable react-hooks/immutability */
import {useEffect,useRef,useState,type RefObject} from 'react';
import {createPortal,useFrame,useThree} from '@react-three/fiber';
import {Html} from '@react-three/drei';
import {Mesh,MeshBasicMaterial,Texture,TextureLoader,MathUtils,SRGBColorSpace,LinearFilter,LinearMipmapLinearFilter} from 'three';
import {projectScreenshot,type VaultProject,type DeviceMode} from '@/data/projects';
export function DeviceScreen({plane,project,device,compact,secondary,inspection,visual,reduced}:{plane:Mesh;project:VaultProject;device:DeviceMode;compact:boolean;secondary:boolean;inspection:boolean;reduced:boolean;visual:RefObject<{opacity:number;brightness:number}>}){
 const {gl,invalidate}=useThree();const source=projectScreenshot(project,device,compact,secondary,inspection);
 const [image,setImage]=useState<{url:string;texture:Texture;width:number;height:number}|null>(null),[failed,setFailed]=useState('');
 const reveal=useRef(0);
 const url=source.url,fit=source.fit;
 useEffect(()=>{
  if(!url)return;let alive=true;
  const texture=new TextureLoader().load(url,t=>{
   if(!alive){t.dispose();return;}
   t.flipY=false;t.colorSpace=SRGBColorSpace;t.minFilter=LinearMipmapLinearFilter;t.magFilter=LinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(gl.capabilities.getMaxAnisotropy(),8);
   const width=t.image.width,height=t.image.height,aspect=width/height,target=device==='mobile'?9/19.5:16/9;
   if(fit==='cover'){if(aspect>target){t.repeat.x=target/aspect;t.offset.x=(1-t.repeat.x)/2;}else{t.repeat.y=aspect/target;t.offset.y=(1-t.repeat.y)/2;}}
   t.needsUpdate=true;setImage({url,texture:t,width,height});invalidate();
  },undefined,()=>{if(alive){setFailed(url);invalidate();}});
  return()=>{alive=false;texture.dispose();};
 },[url,fit,device,gl,invalidate]);
 const ready=image?.url===url;
 useEffect(()=>{
  reveal.current=0;plane.scale.set(1,1,1);
  if(ready&&fit==='contain'){
   const aspect=image.width/image.height,target=16/9;
   if(aspect>target)plane.scale.y=target/aspect;else plane.scale.x=aspect/target;
  }
  invalidate();
 },[plane,ready,image,fit,invalidate]);
 useFrame((_,dt)=>{reveal.current=reduced?1:MathUtils.damp(reveal.current,1,10,Math.min(dt,.08));const material=plane.material;if(material instanceof MeshBasicMaterial){material.opacity=visual.current.opacity*(ready?reveal.current:1);material.color.setScalar(ready?visual.current.brightness:.10);}});
 return <>{createPortal(<meshBasicMaterial key={ready?url:'placeholder'} attach="material" map={ready?image.texture:null} color={ready?'white':'#18232e'} transparent depthWrite={false} toneMapped={false}/>,plane)}
  <Html center position={[0,-1.60,.12]} style={{pointerEvents:'none'}}><span className="vault-texture-status" data-screenshot={ready?'ready':failed===url||!url?'failed':'loading'} data-device={device} data-texture-width={ready?image.width:0} data-texture-height={ready?image.height:0} data-anisotropy={ready?image.texture.anisotropy:0}>{ready?'':failed===url||!url?'Preview unavailable':'Loading preview…'}</span></Html>
 </>;
}
