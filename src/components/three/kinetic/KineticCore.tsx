'use client';
import { useEffect, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { createKineticCore, type KineticAssembly } from './createKineticCore';
import type { AssetInteraction } from '../useAssetViewport';

/** One Fiber subscription animates all assemblies; no timers or private RAF loop. */
export default function KineticCore({ mobile=false, reducedMotion=false, onReady, interaction }: {
  mobile?: boolean; tablet?: boolean; reducedMotion?: boolean; onReady?: () => void; interaction?: RefObject<AssetInteraction>;
}) {
  const host = useRef<Group>(null), assembly = useRef<KineticAssembly | null>(null);
  const time = useRef(0), reported = useRef(false);
  const { invalidate, gl } = useThree();
  useEffect(() => {
    const model = createKineticCore(mobile);
    const parent = host.current!;
    assembly.current = model; parent.add(model.root); reported.current = false;
    invalidate();
    return () => { parent.remove(model.root); model.dispose(); assembly.current = null; };
  }, [mobile, invalidate]);
  useEffect(() => { invalidate(); }, [reducedMotion, invalidate]);
  useFrame(({ camera }, delta) => {
    const a=assembly.current; if(!a)return;
    if(!reported.current) { reported.current=true; onReady?.(); }
    const dt=Math.min(delta,.05);
    if(!reducedMotion)time.current+=dt;
    const t=time.current;
    const input=interaction?.current;
    const px=!reducedMotion && input?.hovered ? input.pointerX : 0;
    const py=!reducedMotion && input?.hovered ? input.pointerY : 0;
    const scroll=reducedMotion?0:input?.scroll??0;
    a.root.rotation.x=MathUtils.damp(a.root.rotation.x,.12-py*.17,5,dt);
    a.root.rotation.y=MathUtils.damp(a.root.rotation.y,-.22+px*.24+scroll*.12,5,dt);
    a.outer.rotation.z=t*.085;
    a.secondary.rotation.z=-t*.14;
    a.inner.rotation.z=t*.21;
    a.orbitals.forEach(({pivot,ring},i)=>{
      pivot.rotation.x=.5+i*.65+Math.sin(t*.24+i)*.18;
      pivot.rotation.y=.4+i*.7+t*(i%2?-.17:.13);
      ring.rotation.z=t*(.22+i*.06);
      pivot.rotation.z=MathUtils.damp(pivot.rotation.z,i*.7+scroll*.35,4,dt);
    });
    a.core.position.y=Math.sin(t*1.1)*.035;
    a.core.rotation.y=Math.sin(t*.48)*.14;
    a.vanes.rotation.z=-t*.18;
    a.materials.energy.emissiveIntensity=1.6+Math.sin(t*1.6)*.3;
    camera.position.x=MathUtils.damp(camera.position.x,px*.12,4,dt);
    camera.position.y=MathUtils.damp(camera.position.y,.15+py*.09,4,dt);
    camera.lookAt(0,0,0);
    // Low-frequency diagnostics enable real-frame QA without React updates.
    gl.domElement.dataset.kineticTime=t.toFixed(3);
  });
  return <group ref={host} />;
}
