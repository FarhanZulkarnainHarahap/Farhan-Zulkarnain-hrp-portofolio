import {test,expect,type BrowserContext,type Locator} from '@playwright/test';
import projects from './fixtures/projects.json';
import skills from './fixtures/skills.json';
async function fixture(context:BrowserContext){
 await context.route('**/api/**',r=>r.fulfill({json:{success:true,data:r.request().url().includes('portofolios')?projects.data:r.request().url().includes('skills')?skills.data:[]}}));
 await context.route('**/image/upload/f_webp,**',r=>r.fulfill({path:'tests/fixtures/project-device-preview.webp',contentType:'image/webp',headers:{'access-control-allow-origin':'*'}}));
}
async function quality(canvas:Locator,width:number){
 const r=await canvas.evaluate(el=>{const c=el as HTMLCanvasElement,b=c.getBoundingClientRect();return{ratio:c.width/b.width,pixels:c.width*c.height,aa:c.getContext('webgl2')?.getContextAttributes()?.antialias,transform:getComputedStyle(c).transform};});
 expect(r.ratio).toBeGreaterThanOrEqual(1.49);expect(r.ratio).toBeLessThanOrEqual(width<768?1.76:2.01);expect(r.pixels).toBeLessThanOrEqual(2_801_000);expect(r.aa).toBe(true);expect(r.transform).toBe('none');
}
for(const width of [390,820,1366,1920])test.describe(`all assets ${width}`,()=>{
 test.use({viewport:{width,height:1000},deviceScaleFactor:2,hasTouch:width<1024});
 test('sharp continuously animated assets without pointer input',async({page,context},info)=>{
  test.setTimeout(240_000);await fixture(context);await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/');
  for(const selector of ['[data-fzh-asset=core]','[data-fzh-asset=identity]','.matrix-stage','.vault-canvas']){
   const stage=page.locator(selector);await stage.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await expect(stage).toHaveAttribute('data-ready','true');await expect(stage).toHaveAttribute('data-running','true');const canvas=stage.locator('canvas');await quality(canvas,width);
   await page.waitForTimeout(1800);const first=await canvas.screenshot();await page.waitForTimeout(1200);expect(first.equals(await canvas.screenshot())).toBe(false);
   await page.screenshot({path:info.outputPath(`${selector.replace(/[^a-z]/g,'')}.png`)});
  }
  await expect(page.getByRole('group',{name:'Project device'})).toHaveCount(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
});
test('motion preference explains standby and permits explicit override',async({page,context})=>{
 await fixture(context);await page.goto('/');const core=page.locator('[data-fzh-asset=core]');await expect(core).toHaveAttribute('data-ready','true');await expect(core).toHaveAttribute('data-running','false');
 await page.getByRole('button',{name:'Enable 3D animations',exact:true}).click();await core.scrollIntoViewIfNeeded();await expect(core).toHaveAttribute('data-running','true');
 await page.getByRole('button',{name:'Use device setting',exact:true}).click();await core.scrollIntoViewIfNeeded();await expect(core).toHaveAttribute('data-running','false');
});
test('pending artwork moves while GLB is delayed',async({page,context})=>{
 await fixture(context);let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});await context.route('**/models/fzh-kinetic-core/*.glb',async route=>{await pending;await route.continue();});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/',{waitUntil:'domcontentloaded'});
 try{const poster=page.locator('.hero .asset-poster-pending').first();await expect(poster).toBeVisible();await expect(poster).toHaveCSS('animation-name','asset-poster-standby');const first=await poster.evaluate(el=>getComputedStyle(el).transform);await expect.poll(()=>poster.evaluate(el=>getComputedStyle(el).transform)).not.toBe(first);}finally{release();}
 await expect(page.locator('[data-fzh-asset=core]')).toHaveAttribute('data-ready','true');
});
for(const [width,height] of [[360,800],[375,812],[390,844],[412,915],[430,932],[768,1024],[820,1180],[1024,768],[1024,1366],[1366,768],[1440,900],[1536,864],[1920,1080],[2560,1440],[2560,1600],[3840,2160]])test.describe(`artifact ${width}x${height}`,()=>{
 test.use({viewport:{width,height},deviceScaleFactor:2});
 test('responsive project keeps artifact design and readable navigation',async({page,context},info)=>{
  await fixture(context);await page.goto('/projects');const stage=page.locator('.vault-canvas');await stage.scrollIntoViewIfNeeded();await expect(stage).toHaveAttribute('data-ready','true');await expect(page.locator('[data-screenshot=ready]')).toHaveCount(width<1024?1:3);await quality(stage.locator('canvas'),width);
  await expect(page.getByRole('group',{name:'Project device'})).toHaveCount(0);await expect(page.locator('.project-stage .project-description')).toHaveCount(0);
  expect(await page.locator('.project-list button').evaluateAll(buttons=>buttons.every(b=>{const label=b.querySelector('span:nth-child(2)')!,r=b.getBoundingClientRect(),l=label.getBoundingClientRect();return l.top>=r.top&&l.bottom<=r.bottom;}))).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('artifact.png')});
 });
});
