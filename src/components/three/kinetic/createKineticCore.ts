import { BufferGeometry, CylinderGeometry, Group, InstancedMesh, Material, Mesh, Object3D, SphereGeometry, TorusGeometry } from 'three';
import { sector, emblem } from './geometry';
import { createMaterials } from './materials';

/** Each instance owns its resources; repeated fittings use GPU instancing. */
export function createKineticCore(mobile: boolean) {
  const materials = createMaterials();
  const geometries = new Set<BufferGeometry>();
  const root = new Group(), outer = new Group(), secondary = new Group(), inner = new Group(), core = new Group();
  root.name = 'KineticCore';
  root.add(outer, secondary, inner, core);
  const detail = mobile ? 12 : 24;
  const own = <T extends BufferGeometry>(g:T) => { geometries.add(g); return g; };
  const mesh = (parent: Group, geometry: BufferGeometry, material: Material, z = 0) => {
    const item = new Mesh(geometry, material); item.position.z = z; parent.add(item); return item;
  };
  const repeat = (parent: Group, geometry: BufferGeometry, material: Material, count: number, radius: number, z: number, offset = 0) => {
    const instances = new InstancedMesh(geometry, material, count), pose = new Object3D();
    for(let i=0;i<count;i++) { const a=i/count*Math.PI*2+offset; pose.position.set(radius*Math.cos(a),radius*Math.sin(a),z); pose.rotation.set(0,0,a); pose.updateMatrix(); instances.setMatrixAt(i,pose.matrix); }
    instances.instanceMatrix.needsUpdate=true; parent.add(instances); return instances;
  };
  const panels=own(sector(1.65,1.96,Math.PI*2/16-.055,.22,detail));
  repeat(outer,panels,materials.titanium,16,0,0);
  repeat(outer,own(sector(1.72,1.91,.21,.035,detail)),materials.gunmetal,16,0,.14);
  repeat(outer,own(sector(1.68,1.70,.17,.025,detail)),materials.energy,16,0,.14);
  const bolt=own(new CylinderGeometry(.024,.024,.035,6)); bolt.rotateX(Math.PI/2);
  repeat(outer,bolt,materials.silver,32,1.82,.18,.09);
  // Engraved radial calibration ticks sit recessed within the face plate.
  repeat(outer,own(sector(1.77,1.87,.009,.009,4)),materials.graphite,64,0,.161);
  repeat(secondary,own(sector(1.38,1.55,Math.PI/6-.035,.13,detail)),materials.silver,12,0,-.1);
  repeat(secondary,own(sector(1.39,1.52,.12,.035,detail)),materials.blue,12,0,.0);
  repeat(secondary,own(sector(1.49,1.67,.075,.12,detail)),materials.gunmetal,8,0,-.12);
  repeat(secondary,bolt,materials.silver,16,1.58,-.04);
  repeat(inner,own(sector(.99,1.24,Math.PI/16-.045,.17,detail)),materials.blue,32,0,.05);
  repeat(inner,own(sector(1.04,1.19,.09,.055,detail)),materials.silver,16,0,.18);
  repeat(inner,own(sector(1.0,1.035,.065,.025,detail)),materials.energy,32,0,.16);
  repeat(inner,bolt,materials.graphite,32,1.15,.23);
  const orbitals = [0,1,2].map(i => {
    const pivot = new Group(), ring = new Group(); root.add(pivot); pivot.add(ring);
    // Separate spherical radii keep swept orbital envelopes apart.
    const r=.65+i*.11;
    mesh(ring,own(new TorusGeometry(r,.022,mobile?6:10,mobile?64:112)),materials.silver);
    repeat(ring,own(sector(r-.055,r+.055,.18,.065,8)),materials.gunmetal,6,0,0);
    repeat(ring,bolt,materials.energy,6,r,.05);
    pivot.rotation.set(.5+i*.65,.4+i*.7,i*.7);
    return {pivot,ring};
  });
  const hub=mesh(core,own(new CylinderGeometry(.48,.48,.18,6)),materials.gunmetal,-.12); hub.rotation.x=Math.PI/2;
  const shield=mesh(core,own(new CylinderGeometry(.40,.44,.08,6)),materials.silver,.02); shield.rotation.x=Math.PI/2;
  mesh(core,own(new SphereGeometry(.29,mobile?16:32,16)),materials.energy,.12);
  mesh(core,own(new SphereGeometry(.35,mobile?16:32,16)),materials.glass,.12);
  mesh(core,own(emblem()),materials.titanium,.36);
  const vanes = new Group(); core.add(vanes);
  repeat(vanes,own(sector(.48,.57,.34,.12,detail)),materials.blue,6,0,-.08);
  root.rotation.set(.12,-.22,-.12);
  return {root,outer,secondary,inner,core,orbitals,vanes,materials,
    dispose() { geometries.forEach(g=>g.dispose()); root.traverse(o=>{if(o instanceof InstancedMesh)o.dispose();}); materials.dispose(); }
  };
}
export type KineticAssembly = ReturnType<typeof createKineticCore>;
