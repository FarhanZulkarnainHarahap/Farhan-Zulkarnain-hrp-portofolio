import { CanvasTexture, MeshPhysicalMaterial, MeshStandardMaterial, RepeatWrapping } from 'three';

export function createMaterials() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#999'; ctx.fillRect(0,0,128,128);
  for(let i=0;i<128;i++) {
    const gray = 105 + ((i * 73) % 65);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(0,i,128,1);
  }
  const grain = new CanvasTexture(canvas);
  grain.wrapS = grain.wrapT = RepeatWrapping; grain.repeat.set(3,3);
  const metal = (color: string, roughness: number) => new MeshStandardMaterial({ color, metalness: .88, roughness, roughnessMap: grain, bumpMap: grain, bumpScale: .008 });
  const materials = {
    titanium: metal('#354652', .48), silver: metal('#afbdc6', .32), gunmetal: metal('#192630', .5), blue: metal('#416479', .4),
    graphite: metal('#101820', .62),
    energy: new MeshStandardMaterial({ color: '#72efff', emissive: '#12cbe5', emissiveIntensity: 2.2, roughness: .3, metalness: .25 }),
    glass: new MeshPhysicalMaterial({ color: '#279cae', metalness: .15, roughness: .15, transparent: true, opacity: .18, depthWrite: false, clearcoat: 1 }),
  };
  return { ...materials, dispose() { Object.values(materials).forEach(m => m.dispose()); grain.dispose(); } };
}
