import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';import {Box3,Vector3} from 'three';
const out={};
for(const [name,prefix,ratio,parts] of [['Monitor','Monitor',16/9,['Monitor_Chassis','Monitor_Bezel','Monitor_Back']],['Laptop','Laptop',16/9,['Laptop_Base','Laptop_ScreenFrame','Laptop_KeyboardDeck','Laptop_Trackpad','Laptop_Hinge_L','Laptop_Hinge_R']],['Mobile','Mobile',9/19.5,['Mobile_Chassis','Mobile_Top_Module','Mobile_Bottom_Module']]]){
 const b=await fs.readFile(`public/models/projects/devices/FZH_Kinetic_${name}.glb`),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert.equal(b.readUInt32LE(8),b.length);assert(!j.images?.length&&!j.cameras?.length&&!j.animations?.length);assert(j.materials.length<=6);
 const g=await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.length),'');let triangles=0;
 g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry;triangles+=geo.index.count/3;assert(geo.attributes.position.array.every(Number.isFinite));assert(geo.attributes.normal.array.every(Number.isFinite));assert(geo.index.array.every(i=>i<geo.attributes.position.count));});
 for(const p of parts)assert(g.scene.getObjectByName(p),p);
 const screen=g.scene.getObjectByName(prefix+'_Screen'),geo=screen.geometry;assert.equal(geo.index.count,6);geo.computeBoundingBox();const s=geo.boundingBox.getSize(new Vector3());assert(Math.abs(s.x/s.y-ratio)<.001);const p=geo.attributes.position,uv=geo.attributes.uv;
 for(let i=0;i<p.count;i++){assert(Math.abs(uv.getX(i)-(p.getX(i)+s.x/2)/s.x)<.001);assert(Math.abs(uv.getY(i)-(1-(p.getY(i)+s.y/2)/s.y))<.001);assert(geo.attributes.normal.getZ(i)>.99);}
 assert(g.scene.getObjectByName(prefix+'_Glass').material.opacity<.02);
 if(name==='Laptop'){assert(Math.abs(g.scene.getObjectByName('Laptop_ScreenFrame').rotation.x+Math.PI/12)<.001);}
 assert(triangles<16000);out[name]={triangles,bytes:b.length,materials:j.materials.length,nodes:j.nodes.length,bounds:new Box3().setFromObject(g.scene).getSize(new Vector3()).toArray()};
}
console.log(JSON.stringify(out,null,2));
