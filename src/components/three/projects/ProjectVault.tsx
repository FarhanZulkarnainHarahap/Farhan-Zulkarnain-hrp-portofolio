"use client";
import {Component,Suspense,useCallback,useEffect,useState,useSyncExternalStore,type ReactNode} from 'react';
import {Canvas} from '@react-three/fiber';
import {deviceModes,projectScreenshot,type DeviceMode,type VaultProject} from '@/data/projects';
import {Media} from '@/components/kinetic/Primitives';
import {useAssetViewport} from '../useAssetViewport';
import {ProjectScene} from './ProjectScene';
import {useProjectSceneLayout} from './useProjectSceneLayout';
function reducedSubscribe(cb:()=>void){const m=matchMedia('(prefers-reduced-motion: reduce)');m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb);}
class Boundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}componentDidCatch(){this.props.onFailure();}render(){return this.state.failed?null:this.props.children;}}
export default function ProjectVault({projects,active,inspection,onSelect,onDeselect}:{projects:VaultProject[];active:number;inspection:boolean;onSelect:(i:number)=>void;onDeselect:()=>void}){
 const [device,setDevice]=useState<DeviceMode>('laptop'),layout=useProjectSceneLayout(device);
 const reduced=useSyncExternalStore(reducedSubscribe,()=>matchMedia('(prefers-reduced-motion: reduce)').matches,()=>false);
 const {ref,interaction,entered,running,failed,onFailure,onPointerEnter,onPointerMove,onPointerLeave,onPointerDown,onPointerUp}=useAssetViewport();
 const [ready,setReady]=useState(false),[hovered,setHovered]=useState<DeviceMode|null>(null);
 const onReady=useCallback(()=>setReady(true),[]),project=projects[active];
 // Preload only the next project's chosen device into the HTTP cache, near the viewport.
 useEffect(()=>{
  if(!entered||!running||projects.length<2)return;
  const next=projects[(active+1)%projects.length],url=projectScreenshot(next,device,layout.mobile).url;
  if(!url)return;const controller=new AbortController();
  const timer=setTimeout(()=>{void fetch(url,{signal:controller.signal,cache:'force-cache'}).then(r=>r.ok?r.arrayBuffer():undefined).catch(()=>{});},700);
  return()=>{clearTimeout(timer);controller.abort();};
 },[projects,active,device,layout.mobile,entered,running]);
 const chooseDevice=(mode:DeviceMode)=>{setHovered(null);setDevice(mode);};
 const portraitFallback=projectScreenshot(project,device,layout.mobile).portraitFallback;
 return <div className="project-vault" data-active={project.id} data-device={device} data-inspection={inspection} data-hovered={hovered||''}>
  <div ref={ref} className="vault-canvas" style={{height:layout.stageHeight}} data-ready={ready&&!failed} data-running={running&&!reduced&&!failed} onPointerEnter={onPointerEnter} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerLeave}>
   {(!ready||failed)&&<div className="vault-fallback"><Media key={project.imageUrl} src={project.imageUrl} alt={`${project.title} project screenshot`}/></div>}
   {entered&&!failed&&<div className="vault-webgl" aria-hidden="true"><Boundary onFailure={onFailure}><Canvas orthographic camera={{position:[0,3,10],zoom:100,near:.1,far:40}} dpr={layout.dprRange} frameloop={!running?'never':reduced?'demand':'always'} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} onPointerMissed={onDeselect} onCreated={({gl})=>gl.domElement.addEventListener('webglcontextlost',onFailure,{once:true})}>
    <Suspense fallback={null}><ProjectScene project={project} device={device} inspection={inspection} reduced={reduced} layout={layout} interaction={interaction} onInspect={()=>onSelect(active)} onDevice={chooseDevice} hovered={hovered} onHover={setHovered} onReady={onReady}/></Suspense>
   </Canvas></Boundary></div>}
  </div>
  <div className="vault-device-selector" role="group" aria-label="Project device">{deviceModes.map(mode=><button key={mode} aria-pressed={device===mode} onClick={()=>chooseDevice(mode)}>{mode==='desktop'?'Desktop':mode==='laptop'?'Laptop':'Mobile'}</button>)}</div>
  {device==='mobile'&&portraitFallback&&<p className="vault-preview-note">Desktop preview cropped to this screen.</p>}
  <button className="vault-inspect" aria-pressed={inspection} onClick={()=>inspection?onDeselect():onSelect(active)}>{inspection?'Exit inspection':'Inspect project'}</button>
 </div>;
}
