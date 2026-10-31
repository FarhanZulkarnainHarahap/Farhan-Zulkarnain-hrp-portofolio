"use client";
/* Renderer configuration uses the imperative Three.js API. */
/* eslint-disable react-hooks/immutability */
import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {SRGBColorSpace} from 'three';

/** Density follows actual canvas size; never enlarge a low-resolution buffer with CSS. */
export function RenderQuality(){
 const {gl,size,setDpr,invalidate}=useThree();
 useEffect(()=>{
  const update=()=>{
   const maximum=innerWidth<768?1.75:2;
   const preferred=Math.min(maximum,Math.max(1.5,devicePixelRatio));
   const density=Math.min(preferred,Math.sqrt(2_800_000/Math.max(1,size.width*size.height)));
   setDpr(density);gl.outputColorSpace=SRGBColorSpace;
   gl.domElement.dataset.renderDpr=density.toFixed(2);invalidate();
  };
  update();window.addEventListener('resize',update);
  return()=>window.removeEventListener('resize',update);
 },[gl,size.width,size.height,setDpr,invalidate]);
 return null;
}
