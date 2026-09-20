import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const stats={};
for(const name of ['FZH_Project_Artifact','FZH_Project_Rail']){
 const data=await fs.readFile(`public/models/projects/${name}.glb`),json=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)));
 assert.equal(data.readUInt32LE(8),data.length);assert(!json.images?.length&&!json.cameras?.length&&!json.animations?.length);assert(!json.extensions?.KHR_lights_punctual);
 const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 let triangles=0,meshes=0;gltf.scene.traverse(o=>{if(!o.isMesh)return;meshes++;const g=o.geometry;triangles+=g.index.count/3;assert(g.attributes.position.array.every(Number.isFinite));assert(g.attributes.normal.array.every(Number.isFinite));assert(g.index.array.every(i=>i<g.attributes.position.count));});
 if(name.includes('Artifact')){
  for(const n of ['PROJECT_ROOT','Artifact_Chassis','Artifact_Frame','Screen_Frame','Screenshot_Plane','Screen_Glass','Left_Rail','Right_Rail','Tech_Slot_Group','Tech_Slot_05','Status_Display_Surface','Project_Index_Surface','Mechanical_Back','Connection_Anchor'])assert(gltf.scene.getObjectByName(n),n);
  const plane=gltf.scene.getObjectByName('Screenshot_Plane').geometry;assert.equal(plane.index.count,6);const p=plane.attributes.position,uv=plane.attributes.uv;
  for(let i=0;i<p.count;i++){assert(Math.abs(uv.getX(i)-(p.getX(i)+1.4)/2.8)<1e-5);assert(Math.abs(uv.getY(i)-(1-(p.getY(i)+.7875)/1.575))<1e-5);assert(plane.attributes.normal.getZ(i)>.99);}
  assert(gltf.scene.getObjectByName('Screen_Glass').material.opacity<.05);assert(triangles>=8000&&triangles<=20000);assert(json.materials.length<=6);
 }
 stats[name]={triangles,meshes,nodes:json.nodes.length,materials:json.materials.length,bytes:data.length};
}
assert(stats.FZH_Project_Artifact.triangles*3+stats.FZH_Project_Rail.triangles<70000);
console.log(JSON.stringify(stats,null,2));
