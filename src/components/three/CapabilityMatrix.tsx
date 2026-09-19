"use client";
/* Three.js owns these mutable scene objects and shared refs; useFrame updates them outside React rendering. */
/* eslint-disable react-hooks/immutability */
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Group, MathUtils, OrthographicCamera } from "three";
import type { CapabilitySkill } from "@/data/techStack";
import { CapabilityCore } from "./CapabilityCore";
import { SkillNode } from "./SkillNode";
import { CapabilityConnections } from "./CapabilityConnections";
import { capabilityLayout, CAPABILITY_PATH } from "./capabilityLayout";
import { useAssetViewport, type AssetInteraction } from "./useAssetViewport";
function useMedia(query: string) {
  return useSyncExternalStore(callback => { const m=matchMedia(query); m.addEventListener("change",callback); return () => m.removeEventListener("change",callback); }, () => matchMedia(query).matches, () => false);
}
class Boundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state={ failed:false };
  static getDerivedStateFromError() { return { failed:true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function MatrixScene({ category, skills, mobile, tablet, reduced, selected, hovered, onHover, onSelect, interaction, onReady }: {
  category:string; skills:CapabilitySkill[]; mobile:boolean; tablet:boolean; reduced:boolean; selected:string|null; hovered:string|null;
  onHover:(id:string|null)=>void; onSelect:(id:string|null)=>void; interaction:RefObject<AssetInteraction>; onReady:()=>void;
}) {
  const core=useGLTF(`${CAPABILITY_PATH}FZH_Capability_Core.glb`);
  const node=useGLTF(`${CAPABILITY_PATH}FZH_Skill_Node.glb`);
  const support=useGLTF(`${CAPABILITY_PATH}FZH_Capability_Support.glb`);
  const background=useMemo(()=>{ const object=support.scene.clone(true); const detail=object.getObjectByName("Background_Data_Ring"); if(detail) detail.visible=!tablet; return object; },[support.scene,tablet]);
  const request=useMemo(()=>({category,skills,token:category+skills.map(s=>s.id).join("|")}),[category,skills]);
  const [displayed,setDisplayed]=useState(request);
  const changing=displayed.token!==request.token;
  useEffect(()=>{
    if (!changing) return;
    const timer=setTimeout(()=>setDisplayed(request),reduced?0:320);
    return ()=>clearTimeout(timer);
  },[changing,request,reduced]);
  useEffect(onReady,[onReady]);
  const positions=useMemo(()=>capabilityLayout(displayed.skills.length,mobile),[displayed.skills.length,mobile]);
  const group=useRef<Group>(null), progress=useRef(0), blend=useRef(1), nodeRefs=useRef<(Group|null)[]>([]);
  const { camera,size,invalidate }=useThree();
  useEffect(()=>{
    const cam=camera as OrthographicCamera;
    const width=Math.max(2.7,...positions.map(p=>Math.abs(p[0])*2+1.1));
    cam.zoom=Math.min(size.width/width,size.height/(mobile?2.8:3.65));
    cam.position.y=mobile?-0.35:0;
    cam.updateProjectionMatrix();invalidate();
  },[camera,size,positions,mobile,invalidate]);
  useFrame((_,delta)=>{
    const dt=Math.min(delta,.1);
    blend.current=reduced?1:MathUtils.damp(blend.current,changing?0:1,12,dt);
    const entrance=reduced?1:MathUtils.clamp((interaction.current.scroll+.95)/.72,0,1);
    progress.current=entrance*blend.current;
    if(group.current){
      group.current.rotation.x=reduced?0:MathUtils.damp(group.current.rotation.x,interaction.current.scroll*.07,4,dt);
      group.current.rotation.y=reduced?0:MathUtils.damp(group.current.rotation.y,interaction.current.pointerX*(mobile?0:tablet?.025:.04),4,dt);
      group.current.position.y=reduced?0:interaction.current.scroll*.035;
    }
    background.rotation.z=reduced?0:Math.sin(performance.now()/18000)*.018;
  });
  const active=selected||hovered;
  return <group ref={group} name="FZH_Capability_ROOT">
    {!mobile && <primitive object={background} dispose={null} />}
    <CapabilityConnections count={positions.length} nodeRefs={nodeRefs} activeIndex={displayed.skills.findIndex(s=>s.id===active)} reduced={reduced} progress={progress} />
    <CapabilityCore template={core.scene} animations={core.animations} category={displayed.category} active={Boolean(active)} direction={positions[displayed.skills.findIndex(s=>s.id===selected)]?.[0] || 0} reduced={reduced} progress={progress} />
    {displayed.skills.map((skill,i)=><SkillNode key={skill.id} template={node.scene} skill={skill} index={i} position={positions[i]} selected={selected===skill.id} hovered={hovered===skill.id} subdued={Boolean(active)&&active!==skill.id} reduced={reduced} mobile={mobile} progress={progress} nodeRefs={nodeRefs} onHover={onHover} onSelect={id=>onSelect(selected===id?null:id)} disabled={changing} />)}
  </group>;
}
export default function CapabilityMatrix({ category,skills,selectedSkillId,onSelect }: { category:string; skills:CapabilitySkill[]; selectedSkillId:string|null; onSelect:(id:string|null)=>void }) {
  const mobile=useMedia("(max-width: 767px)"), tablet=useMedia("(min-width:768px) and (max-width:1023px)"), reduced=useMedia("(prefers-reduced-motion: reduce)");
  const { ref:viewportRef,interaction,onPointerEnter,onPointerMove,onPointerLeave,onPointerDown,onPointerUp,entered,running,failed,onFailure }=useAssetViewport();
  const hydrated=useSyncExternalStore(()=>()=>{},()=>true,()=>false);
  const [ready,setReady]=useState(false),[hovered,setHovered]=useState<string|null>(null),[page,setPage]=useState({category,index:0});
  const onReady=useCallback(()=>setReady(true),[]);
  const pageSize=mobile?3:8, pages=Math.max(1,Math.ceil(skills.length/pageSize));
  const currentPage=page.category===category?Math.min(page.index,pages-1):0;
  const visible=useMemo(()=>skills.slice(currentPage*pageSize,(currentPage+1)*pageSize),[skills,currentPage,pageSize]);
  const selected=skills.find(s=>s.id===selectedSkillId);
  const select=(id:string|null)=>{ onSelect(id); if(id){const index=skills.findIndex(s=>s.id===id);setPage({category,index:Math.floor(index/pageSize)});} };
  return <div className="capability-matrix" data-category={category} data-selected={selectedSkillId||""}>
    <div ref={viewportRef} className="matrix-stage" aria-hidden="true" data-ready={ready&&!failed} data-running={running&&!reduced&&!failed}
      onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerLeave}>
      {(!ready||failed)&&<div className="matrix-placeholder"><span className="eyebrow">{category.toUpperCase()} / CAPABILITY MATRIX</span><p>{skills.length} connected technologies</p></div>}
      {hydrated&&entered&&!failed&&<Boundary onFailure={onFailure}><Canvas orthographic camera={{position:[0,0,8],zoom:100,near:.1,far:30}} dpr={mobile?1:[1,1.5]} frameloop={!running?"never":reduced?"demand":"always"} gl={{alpha:true,antialias:!mobile,powerPreference:"low-power"}}
        onPointerMissed={()=>onSelect(null)} fallback={<span />} onCreated={({gl})=>gl.domElement.addEventListener("webglcontextlost",onFailure,{once:true})}>
        <ambientLight intensity={.75}/><directionalLight position={[2,4,5]} intensity={2.5}/><directionalLight position={[-3,-2,4]} intensity={1.1} color="#a5dfff"/>
        <Suspense fallback={null}>
          <Environment frames={1} resolution={64}><Lightformer position={[0,3,4]} scale={[5,3,1]} intensity={2}/></Environment>
          <MatrixScene category={category} skills={visible} mobile={mobile} tablet={tablet} reduced={reduced} selected={selectedSkillId} hovered={visible.some(s=>s.id===hovered)?hovered:null} onHover={setHovered} onSelect={onSelect} interaction={interaction} onReady={onReady}/>
        </Suspense>
      </Canvas></Boundary>}
    </div>
    {pages>1&&<div className="matrix-pager"><button aria-label="Previous skill nodes" disabled={currentPage===0} onClick={()=>setPage({category,index:currentPage-1})}>←</button><span>{currentPage+1} / {pages}</span><button aria-label="Next skill nodes" disabled={currentPage===pages-1} onClick={()=>setPage({category,index:currentPage+1})}>→</button></div>}
    <div className="matrix-skills" aria-label={`${category} technologies`}>
      {skills.map(skill=><button key={skill.id} aria-pressed={selectedSkillId===skill.id} onFocus={()=>setHovered(skill.id)} onBlur={()=>setHovered(null)} onPointerEnter={()=>setHovered(skill.id)} onPointerLeave={()=>setHovered(null)} onClick={()=>select(selectedSkillId===skill.id?null:skill.id)}>{skill.name}</button>)}
    </div>
    <div className="matrix-detail" aria-live="polite">
      {selected?<><span className="eyebrow">NODE LOCKED / {category.toUpperCase()}</span><strong>{selected.name}</strong><p>Connected to the {category.toLowerCase()} capability layer.</p><button onClick={()=>select(null)}>Clear selection</button></>:<><span className="eyebrow">{skills.length} CONNECTED NODES / {category.toUpperCase()} LAYER</span><p>{skills.length?"Select a technology to inspect its connection.":"No technologies in this category yet."}</p></>}
    </div>
  </div>;
}
