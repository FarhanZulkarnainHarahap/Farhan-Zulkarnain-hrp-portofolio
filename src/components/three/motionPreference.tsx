"use client";
import {useSyncExternalStore} from 'react';
const key='fzh-3d-motion';
function enabled(){try{return localStorage.getItem(key)==='on';}catch{return false;}}
function subscribe(notify:()=>void){
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 media.addEventListener('change',notify);window.addEventListener('storage',notify);window.addEventListener('fzh-motion',notify);
 return()=>{media.removeEventListener('change',notify);window.removeEventListener('storage',notify);window.removeEventListener('fzh-motion',notify);};
}
export function useReduced3DMotion(){return useSyncExternalStore(subscribe,()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&!enabled(),()=>false);}
export function MotionPreference(){
 const systemReduced=useSyncExternalStore(subscribe,()=>matchMedia('(prefers-reduced-motion: reduce)').matches,()=>false);
 const override=useSyncExternalStore(subscribe,enabled,()=>false);
 if(!systemReduced)return null;
 return <div className="motion-preference"><span>{override?'3D animations enabled.':'3D animations paused by your device’s motion setting.'}</span><button type="button" onClick={()=>{try{if(override)localStorage.removeItem(key);else localStorage.setItem(key,'on');}catch{return;}window.dispatchEvent(new Event('fzh-motion'));}}>{override?'Use device setting':'Enable 3D animations'}</button></div>;
}
