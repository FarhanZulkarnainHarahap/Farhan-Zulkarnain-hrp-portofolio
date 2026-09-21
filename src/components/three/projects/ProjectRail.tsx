"use client";
import {useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,MathUtils} from 'three';
import type {AssetInteraction} from '../useAssetViewport';
import {ProjectConnections} from './ProjectConnections';
export function ProjectRail({template,reduced,mobile,inspection,interaction,compactScale=.53}:{template:Group;reduced:boolean;mobile:boolean;inspection:boolean;interaction:RefObject<AssetInteraction>;compactScale?:number}) {
  const object=useMemo(()=>template.clone(true),[template]),root=useRef<Group>(null);
  useFrame(()=>{if(!root.current)return;const progress=reduced?1:MathUtils.clamp((interaction.current.scroll+.95)/.72/.15,0,1);root.current.scale.set((mobile?compactScale:1)*progress,1,1);root.current.position.y=reduced?0:interaction.current.scroll*.01;});
  return <group ref={root}><primitive object={object} dispose={null}/><ProjectConnections reduced={reduced} inspection={inspection}/></group>;
}
