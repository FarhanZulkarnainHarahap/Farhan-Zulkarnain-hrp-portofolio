/** Run from web: node scripts/blender/validate_fzh_kinetic_core.mjs */
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer, Box3, Vector3 } from 'three';
const base = new URL('../../', import.meta.url), results = [];
for (const suffix of ['', '_LOD']) {
  const file = `public/models/fzh-kinetic-core/FZH_Hero_Kinetic_Core${suffix}.glb`;
  const buffer = await fs.readFile(new URL(file, base));
  assert.equal(buffer.toString('ascii', 0, 4), 'glTF');
  assert.equal(buffer.readUInt32LE(4), 2);
  assert.equal(buffer.readUInt32LE(8), buffer.length);
  const json = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)));
  assert.equal(json.materials.length, 6);
  assert.equal(json.images?.length ?? 0, 0);
  assert.equal(json.cameras?.length ?? 0, 0);
  assert(!json.extensions?.KHR_lights_punctual);
  assert(json.buffers.every(b => !b.uri));
  const names = json.nodes.map(n => n.name);
  assert.equal(new Set(names).size, names.length);
  for (const name of ['FZH_Core_ROOT','Ring_Outer','Ring_Structure','Ring_Data','Ring_Gyro','Core_Shell','Core_Energy','Glass_Core','FZH_Brand_Plate']) assert(names.includes(name), name);
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
  assert(triangles <= (suffix ? 40000 : 120000));
  const size = new Box3().setFromObject(gltf.scene).getSize(new Vector3());
  assert(Math.max(...size.toArray()) >= 2 && Math.max(...size.toArray()) <= 4);
  const durations = { idle: 10, core_pulse: 3, boot: 3 };
  assert.equal(gltf.animations.length, 3);
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
  results.push({file, bytes:buffer.length, triangles, mesh_objects:meshes, nodes:json.nodes.length, materials:materials.size, dimensions:size.toArray(), animations:durations, result:'PASS: Three.js GLTFLoader, AnimationMixer, geometry, materials, hierarchy, loop endpoints, budgets'});
}
await fs.writeFile(new URL('docs/FZH_Hero_Kinetic_Core_validation.json', base), JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));
