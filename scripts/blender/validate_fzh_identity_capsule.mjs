/** Run from web: node scripts/blender/validate_fzh_identity_capsule.mjs */
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer, Box3, Vector3 } from 'three';
const base = new URL('../../', import.meta.url), results = [];
for (const suffix of ['', '_LOD']) {
  const file = `public/models/fzh-identity-capsule/FZH_About_Identity_Capsule${suffix}.glb`;
  const buffer = await fs.readFile(new URL(file, base));
  assert.equal(buffer.toString('ascii', 0, 4), 'glTF');
  assert.equal(buffer.readUInt32LE(4), 2);
  assert.equal(buffer.readUInt32LE(8), buffer.length);
  const json = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)));
  assert.equal(json.materials.length, 7);
  assert.equal(json.images?.length ?? 0, 0);
  assert.equal(json.cameras?.length ?? 0, 0);
  assert(!json.extensions?.KHR_lights_punctual);
  assert(json.buffers.every(b => !b.uri));
  const names = json.nodes.map(n => n.name);
  assert.equal(new Set(names).size, names.length);
  for (const name of ['FZH_Identity_ROOT','Identity_Frame','Identity_Display','Identity_Display_Glass','Portrait_Plane','Identity_Orbit','Base_Module','Arm_L','Arm_R','Brand_Plate']) assert(names.includes(name), name);
  const gltf = await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset+buffer.byteLength), '');
  let triangles = 0, meshes = 0;
  const materials = new Set();
  gltf.scene.traverse(o => {
    assert(o.scale.toArray().every(n => n > 0));
    if (!o.isMesh) return;
    meshes++;
    materials.add(o.material.uuid);
    const g = o.geometry, p = g.attributes.position;
    assert(p.array.every(Number.isFinite));
    assert(g.attributes.normal.array.every(Number.isFinite));
    assert(g.index.array.every(i => i < p.count));
    triangles += g.index.count / 3;
  });
  assert(triangles <= (suffix ? 20000 : 50000));
  const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
  assert(Math.max(...size.toArray()) >= 2 && Math.max(...size.toArray()) <= 4);
  assert(size.x >= 1.3 && size.x <= 1.9);
  assert(size.y >= 2.5 && size.y <= 3.0);
  assert(size.z <= 1);
  const plane = gltf.scene.getObjectByName('Portrait_Plane');
  assert(plane.isMesh && plane.geometry.index.count === 6);
  const uv = plane.geometry.attributes.uv;
  assert(uv && uv.array.every(n => n >= 0 && n <= 1));
  const pos = plane.geometry.attributes.position;
  const normal = plane.geometry.attributes.normal;
  // glTF exporter flips Blender V. Top of the image is V=0 for flipY=false.
  for(let i=0;i<pos.count;i++) {
    assert(Math.abs(uv.getX(i)-(pos.getX(i)+.56)/1.12) < 1e-5);
    assert(Math.abs(uv.getY(i)-(1-(pos.getY(i)+.66)/1.40)) < 1e-5);
    assert(normal.getZ(i) > .99);
  }
  const glass = gltf.scene.getObjectByName('Identity_Display_Glass').material;
  assert(glass.transparent && Math.abs(glass.opacity-.12) < .001);
  const refBuffer = await fs.readFile(new URL('public/models/fzh-kinetic-core/FZH_Hero_Kinetic_Core.glb',base));
  const ref = JSON.parse(refBuffer.subarray(20,20+refBuffer.readUInt32LE(12)));
  for(const name of ['Dark_Matte','Brushed_Gunmetal','Polished_Graphite','Cyan_Signal','Titanium_Accent']) {
    const normalized = list => { const m = list.find(m=>m.name.replace(/\.\d+$/, '')===name); assert(m); return {...m, name}; };
    assert.deepEqual(normalized(json.materials),normalized(ref.materials), `Material family mismatch: ${name}`);
  }
  const durations = { idle: 10, identity_scan: 3 };
  assert.equal(gltf.animations.length, 2);
  for (const clip of gltf.animations) {
    assert(Math.abs(clip.duration-durations[clip.name]) < 1e-5, `${clip.name}: ${clip.duration}`);
    for (const track of clip.tracks) {
      assert.equal(track.times[0], 0);
      assert(track.values.every(Number.isFinite));
      if (clip.name !== 'boot') {
        const n = track.getValueSize();
        for (let i=0; i<n; i++) assert(Math.abs(track.values[i]-track.values[track.values.length-n+i]) < 1e-5, `Loop mismatch: ${track.name}`);
      }
    }
    const mixer = new AnimationMixer(gltf.scene);
    mixer.clipAction(clip).play();
    mixer.update(clip.duration / 2);
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse(o => assert(o.matrixWorld.elements.every(Number.isFinite)));
    mixer.stopAllAction();
    mixer.uncacheRoot(gltf.scene);
  }
  results.push({file, bytes:buffer.length, triangles, mesh_objects:meshes, nodes:json.nodes.length, materials:materials.size, dimensions:size.toArray(), animations:durations, result:'PASS: Three.js GLTFLoader, AnimationMixer, geometry, materials, hierarchy, loop endpoints, budgets, portrait UV/orientation, alpha glass, exact shared materials'});
}
await fs.writeFile(new URL('docs/FZH_Identity_Capsule_validation.json', base), JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
