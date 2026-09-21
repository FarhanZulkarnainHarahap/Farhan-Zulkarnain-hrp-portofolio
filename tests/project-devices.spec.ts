import {test,expect,type BrowserContext} from '@playwright/test';
import projects from './fixtures/projects.json';
import {deviceTargets} from '../src/components/three/projects/deviceMotion';
import {projectSceneLayout} from '../src/components/three/projects/useProjectSceneLayout';
async function fixture(context:BrowserContext){
 await context.route('**/api/**',route=>route.fulfill({json:{success:true,data:route.request().url().includes('portofolios')?projects.data:[]}}));
 await context.route('**/image/upload/f_webp,**',route=>route.fulfill({path:'tests/fixtures/project-device-preview.webp',contentType:'image/webp',headers:{'access-control-allow-origin':'*'}}));
}
const sizes=[[1366,768],[1440,900],[1536,864],[1920,1080],[1024,768],[768,1024],[820,1180],[1024,1366],[360,800],[375,812],[390,844],[412,915],[430,932],[2560,1440],[2560,1600],[3840,2160]];
for(const [width,height] of sizes)test.describe(`${width}x${height}`,()=>{
 test.use({viewport:{width,height},deviceScaleFactor:2,hasTouch:width<1024});
 test('device quality and responsive framing',async({page,context},info)=>{
  await fixture(context);await page.goto('/projects');const stage=page.locator('.vault-canvas');await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-ready','true');await expect(page.locator('[data-screenshot=ready]')).toHaveCount(width>=1280?3:1);
  const canvas=stage.locator('canvas');await expect(canvas).toHaveAttribute('data-rendered-device','laptop');
  const rendering=await canvas.evaluate(el=>{const c=el as HTMLCanvasElement,r=c.getBoundingClientRect();return{ratio:c.width/r.width,pixels:c.width*c.height,aa:c.getContext('webgl2')?.getContextAttributes()?.antialias,transform:getComputedStyle(c).transform};});
  expect(rendering.ratio).toBeGreaterThanOrEqual(width<1024?1.24:1.49);expect(rendering.ratio).toBeLessThanOrEqual(width<768?1.76:2.01);expect(rendering.pixels).toBeLessThanOrEqual(2_801_000);expect(rendering.aa).toBe(true);expect(rendering.transform).toBe('none');
  const bounds=JSON.parse((await canvas.getAttribute('data-device-bounds'))!);for(const n of bounds)expect(Math.abs(n)).toBeLessThan(1.01);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const labelsFit=await page.locator('.vault-project-index .project-list button').evaluateAll(buttons=>buttons.every(button=>{const label=button.querySelector('span:nth-child(2)');if(!label)return false;const b=button.getBoundingClientRect(),l=label.getBoundingClientRect();return l.top>=b.top&&l.bottom<=b.bottom;}));
  expect(labelsFit).toBe(true);
  await page.screenshot({path:info.outputPath(`laptop-${width}.png`)});
  await page.getByRole('button',{name:'Mobile',exact:true}).click();await expect(canvas).toHaveAttribute('data-rendered-device','mobile');await stage.scrollIntoViewIfNeeded();
  await expect(page.locator('[data-screenshot=ready][data-device=mobile]')).toHaveCount(1);
  const mobileBounds=JSON.parse((await canvas.getAttribute('data-device-bounds'))!);for(const n of mobileBounds)expect(Math.abs(n)).toBeLessThan(1.01);
  await page.screenshot({path:info.outputPath(`mobile-device-${width}.png`)});
 });
});
test('device animation, switching, texture settings and fallback keep one canvas',async({page,context})=>{
 test.setTimeout(180_000);await fixture(context);await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/projects');const stage=page.locator('.vault-canvas');await stage.scrollIntoViewIfNeeded();await expect(stage).toHaveAttribute('data-ready','true');
 const canvas=stage.locator('canvas');await expect(canvas).toHaveAttribute('data-motion-state','idle');await canvas.evaluate(el=>el.setAttribute('data-persistent','yes'));
 const first=await canvas.getAttribute('data-device-pose');await expect.poll(()=>canvas.getAttribute('data-device-pose')).not.toBe(first);
 await expect(page.locator('[data-device=laptop][data-screenshot=ready]')).toHaveAttribute('data-anisotropy',/[2-8]/);
 const box=await stage.boundingBox();await page.mouse.move(box!.x+box!.width*.51,box!.y+box!.height*.42);await expect(page.locator('.project-vault')).toHaveAttribute('data-hovered','laptop');
 await page.getByRole('button',{name:'Inspect project',exact:true}).click();await expect(canvas).toHaveAttribute('data-motion-state','selected');
 await page.getByRole('button',{name:'Desktop',exact:true}).click();await expect(canvas).toHaveAttribute('data-rendered-device','desktop');await expect(canvas).toHaveAttribute('data-motion-state','selected');
 await page.getByRole('button',{name:'Next project',exact:true}).click();await expect(page.locator('.project-summary h3')).toHaveText(projects.data[1].title);await expect(canvas).toHaveAttribute('data-persistent','yes');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(stage).toHaveAttribute('data-running','false');
 await canvas.evaluate(el=>el.dispatchEvent(new Event('webglcontextlost')));await expect(page.locator('.vault-fallback')).toBeVisible();await expect(page.locator('.project-summary a')).toBeVisible();
});
test('device motion priorities and layout budgets',()=>{
 const base={device:'laptop' as const,main:true,slot:0,time:1,hovered:false,inspection:false,reduced:false,pointer:[1,1] as [number,number],scroll:0,transition:1,entrance:1,tablet:false};
 const a=deviceTargets(base),b=deviceTargets({...base,time:3});expect(a.y).not.toBe(b.y);expect(Math.abs(a.y)).toBeLessThan(.036);
 const selected=deviceTargets({...base,hovered:true,inspection:true});expect(selected.state).toBe('selected');expect(selected.rx).toBe(0);expect(selected.ry).toBe(0);expect(selected.scale).toBeGreaterThanOrEqual(1.08);
 const quiet=deviceTargets({...base,reduced:true,time:3});expect(quiet.y).toBe(0);expect(quiet.lid).toBe(0);
 for(const [w,h] of sizes){const layout=projectSceneLayout(w,h,'laptop');expect(layout.stageHeight).toBeLessThan(h);expect(layout.dprRange[1]).toBeLessThanOrEqual(2);}
});
