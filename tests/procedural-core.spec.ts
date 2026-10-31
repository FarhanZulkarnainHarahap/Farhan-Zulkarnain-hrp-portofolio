import { test, expect } from '@playwright/test';

for (const width of [390, 900, 1440]) {
  test(`procedural reactor lifecycle at ${width}px`, async ({ page }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({width,height:1000});
    await page.emulateMedia({reducedMotion:'no-preference'});
    const errors:string[]=[], models:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(/FZH_Hero.*\.glb/.test(r.url()))models.push(r.url());});
    await page.route('**/api/**',route=>route.fulfill({json:{success:true,data:[]}}));
    await page.goto('/', {waitUntil:'domcontentloaded'});
    await expect(page.locator('h1')).toContainText('FARHAN');
    const stage=page.locator('[data-fzh-asset="core"]');
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-ready','true');
    const canvas=stage.locator('canvas');
    await page.mouse.move(0,0);
    const time=Number(await canvas.getAttribute('data-kinetic-time'));
    await expect.poll(async()=>Number(await canvas.getAttribute('data-kinetic-time'))).toBeGreaterThan(time+.2);
    const first=await canvas.screenshot();
    await page.waitForTimeout(500);
    expect(first.equals(await canvas.screenshot())).toBe(false);
    const box=(await stage.boundingBox())!;
    await page.mouse.move(box.x+box.width*.8,box.y+box.height*.4);
    await stage.dispatchEvent('pointerdown',{pointerType:'touch',clientX:box.x+50,clientY:box.y+70});
    await stage.dispatchEvent('pointermove',{pointerType:'touch',clientX:box.x+150,clientY:box.y+70});
    await stage.dispatchEvent('pointerup',{pointerType:'touch'});
    await expect(stage).toHaveCSS('touch-action','pan-y');
    await page.screenshot({path:info.outputPath(`reactor-${width}.png`)});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(stage).toHaveAttribute('data-running','false');
    await page.waitForTimeout(300);
    const frozen=await canvas.getAttribute('data-kinetic-time');
    await page.waitForTimeout(300);
    expect(await canvas.getAttribute('data-kinetic-time')).toBe(frozen);
    await page.emulateMedia({reducedMotion:'no-preference'});
    // Simulate the document visibility lifecycle, including pause and resume.
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
    await expect(stage).toHaveAttribute('data-running','false');
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
    await expect(stage).toHaveAttribute('data-running','true');
    const resumed=Number(await canvas.getAttribute('data-kinetic-time'));
    await expect.poll(async()=>Number(await canvas.getAttribute('data-kinetic-time'))).toBeGreaterThan(resumed+.1);
    await canvas.evaluate(el=>el.dispatchEvent(new Event('webglcontextlost')));
    await expect(stage).toHaveAttribute('data-ready','false');
    await expect(stage.locator('img')).toBeVisible();
    await page.reload({waitUntil:'domcontentloaded'});
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-ready','true');
    expect(models).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('content survives unavailable WebGL',async({page})=>{
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this: HTMLCanvasElement,type:string,...args:unknown[]) {
      if(type.startsWith('webgl'))return null;
      return Reflect.apply(original,this,[type,...args]);
    } as typeof original;
  });
  await page.goto('/', {waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toContainText('FARHAN');
  await expect(page.locator('[data-fzh-asset="core"] img')).toBeVisible();
  await expect(page.getByRole('link',{name:'Explore my work'})).toBeVisible();
});

test('hero text is delivered before JavaScript and model initialization',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();await page.goto('/', {waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toContainText('FARHAN');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.hero-core img')).toBeVisible();
  await expect(page.locator('.hero-core canvas')).toHaveCount(0);
  await context.close();
});

test('navigation remounts exactly one hero canvas',async({page})=>{
  await page.route('**/api/**',route=>route.fulfill({json:{success:true,data:[]}}));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const core=page.locator('[data-fzh-asset="core"]');
  await expect(core).toHaveAttribute('data-ready','true');
  await page.locator('.hero-copy a[href="/contact"]').click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(core).toHaveCount(0);
  await page.goBack({waitUntil:'domcontentloaded'});
  await expect(core).toHaveAttribute('data-ready','true');
  await expect(core.locator('canvas')).toHaveCount(1);
});
