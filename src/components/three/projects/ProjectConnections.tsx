"use client";
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Mesh} from 'three';
export function ProjectConnections({reduced,inspection}:{reduced:boolean;inspection:boolean}) {
  const pulse=useRef<Mesh>(null);
  useFrame(({clock})=>{if(!pulse.current)return;const cycle=clock.elapsedTime%9;pulse.current.visible=!reduced&&cycle<2.5;pulse.current.position.x=-3+cycle/2.5*6;});
  return <group name="Project_Connections"><mesh position={[0,-1.23,-.1]}><boxGeometry args={[.012,.29,.012]}/><meshBasicMaterial color={inspection?'#52d6ed':'#245967'}/></mesh><mesh ref={pulse} position={[0,-1.42,-.18]}><boxGeometry args={[.10,.019,.019]}/><meshBasicMaterial color="#4ad8ee"/></mesh></group>;
}
