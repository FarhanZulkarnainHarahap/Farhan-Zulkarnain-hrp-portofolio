"use client";
import {Component,Suspense,useCallback,useState,useSyncExternalStore,type ReactNode} from 'react';
import {Canvas} from '@react-three/fiber';
import type {VaultProject} from '@/data/projects';
import {Media} from '@/components/kinetic/Primitives';
import {useAssetViewport} from '../useAssetViewport';
import {ProjectScene} from './ProjectScene';
function useMedia(query:string){return useSyncExternalStore(cb=>{const m=matchMedia(query);m.addEventListener('change',cb);return()=>m.removeEventListener('change',cb);},()=>matchMedia(query).matches,()=>false);}
class Boundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}componentDidCatch(){this.props.onFailure();}render(){return this.state.failed?null:this.props.children;}}
export default function ProjectVault({projects,active,inspection,onSelect,onDeselect}:{projects:VaultProject[];active:number;inspection:boolean;onSelect:(i:number)=>void;onDeselect:()=>void}) {
  const mobile=useMedia('(max-width: 767px)'),tablet=useMedia('(min-width:768px) and (max-width:1023px)'),reduced=useMedia('(prefers-reduced-motion: reduce)');
  const {ref,interaction,entered,running,failed,onFailure,onPointerEnter,onPointerMove,onPointerLeave,onPointerDown,onPointerUp}=useAssetViewport();
  const [ready,setReady]=useState(false),[hovered,setHovered]=useState<string|null>(null);
  const onReady=useCallback(()=>setReady(true),[]);
  return <div className="project-vault" data-active={projects[active].id} data-inspection={inspection} data-hovered={hovered||''}>
    <div ref={ref} className="vault-canvas" data-ready={ready&&!failed} data-running={running&&!reduced&&!failed} onPointerEnter={onPointerEnter} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerLeave}>
      {(!ready||failed)&&<div className="vault-fallback"><Media key={projects[active].imageUrl} src={projects[active].imageUrl} alt={`${projects[active].title} project screenshot`}/></div>}
      {entered&&!failed&&<div className="vault-webgl" aria-hidden="true"><Boundary onFailure={onFailure}><Canvas orthographic camera={{position:[0,0,8],zoom:90,near:.1,far:30}} dpr={mobile?1:[1,1.5]} frameloop={!running?'never':reduced?'demand':'always'} gl={{alpha:true,antialias:!mobile,powerPreference:'low-power'}} onPointerMissed={onDeselect} onCreated={({gl})=>gl.domElement.addEventListener('webglcontextlost',onFailure,{once:true})}>
        <Suspense fallback={null}><ProjectScene projects={projects} active={active} inspection={inspection} mobile={mobile} tablet={tablet} reduced={reduced} interaction={interaction} onSelect={onSelect} hovered={hovered} onHover={setHovered} onReady={onReady}/></Suspense>
      </Canvas></Boundary></div>}
    </div>
    <button className="vault-inspect" aria-pressed={inspection} onClick={()=>inspection?onDeselect():onSelect(active)}>{inspection?'Exit inspection':'Inspect project'}</button>
  </div>;
}
