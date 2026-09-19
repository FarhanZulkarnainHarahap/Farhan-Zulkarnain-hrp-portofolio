import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const results = {};
for (const [key, name, required] of [
  ['core','FZH_Capability_Core',['Category_Core','Category_Core_Frame','Category_Core_Inner','Category_Label_Surface','Core_Connection_Anchor_08']],
  ['node','FZH_Skill_Node',['Skill_Node_Template','Skill_Node_Frame','Skill_Node_LogoPlane','Connection_Anchor']],
  ['support','FZH_Capability_Support',['Orbit_Rail_Main','Orbit_Rail_Secondary','Background_Data_Ring','Micro_Data_Node']],
  ['rail','FZH_Energy_Rail',['Energy_Rail']]
]) {
  const buffer=await fs.readFile(`public/models/capability/${name}.glb`);
  assert.equal(buffer.readUInt32LE(8),buffer.length);
  const json=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)));
  assert(!json.images?.length && !json.cameras?.length && !json.extensions?.KHR_lights_punctual);
  assert(json.materials.length<=6);
  const gltf=await new GLTFLoader().parseAsync(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
  for(const name of required) assert(gltf.scene.getObjectByName(name),name);
  let triangles=0,meshes=0;
  gltf.scene.traverse(o=>{if(!o.isMesh)return;meshes++;const g=o.geometry;triangles+=g.index.count/3;assert(g.attributes.position.array.every(Number.isFinite));assert(g.attributes.normal.array.every(Number.isFinite));assert(g.index.array.every(i=>i<g.attributes.position.count));});
  if(key==='node') {const p=gltf.scene.getObjectByName('Skill_Node_LogoPlane').geometry;assert.equal(p.index.count,6);assert(p.attributes.uv.array.every(v=>v>=0&&v<=1));assert(p.attributes.normal.getZ(0)>.99);assert(triangles>=1500&&triangles<=4000);}
  if(key==='core'){assert(triangles>=10000&&triangles<=25000);assert.equal(gltf.animations.length,1);assert.equal(gltf.animations[0].name,'idle');assert(Math.abs(gltf.animations[0].duration-10)<.01);}
  results[key]={triangles,meshes,nodes:json.nodes.length,materials:json.materials.length,bytes:buffer.length,clips:gltf.animations.map(c=>({name:c.name,duration:c.duration}))};
}
const max=results.core.triangles+8*results.node.triangles+results.support.triangles+8*96;
assert(max<80000);console.log(JSON.stringify({components:results,maxDesktopTriangles:max},null,2));
