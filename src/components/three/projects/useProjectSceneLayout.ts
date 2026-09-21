"use client";
import {useSyncExternalStore} from 'react';
import type {DeviceMode} from '@/data/projects';
export function projectSceneLayout(width:number,height:number,device:DeviceMode) {
  const mobile=width<768,tablet=width>=768&&width<1024,wide=width>=1280;
  return {mobile,tablet,wide,showSecondary:wide,
    stageHeight:mobile?(device==='mobile'?Math.min(500,Math.max(380,height*.54)):Math.min(350,Math.max(260,height*.37))):Math.min(570,Math.max(310,height*.48)),
    worldWidth:wide?6.8:device==='mobile'?1.55:3.85,
    worldHeight:device==='mobile'?2.75:3.05,
    dprRange:(mobile?[1.25,1.75]:tablet?[1.25,1.5]:[1.5,2]) as [number,number],
    enablePointerTilt:!mobile};
}
function subscribe(cb:()=>void){window.addEventListener('resize',cb);return()=>window.removeEventListener('resize',cb);}
export function useProjectSceneLayout(device:DeviceMode){const size=useSyncExternalStore(subscribe,()=>`${innerWidth}:${innerHeight}`,()=> '1366:768');const [width,height]=size.split(':').map(Number);return projectSceneLayout(width,height,device);}
export type ProjectSceneLayout=ReturnType<typeof projectSceneLayout>;
