/** Serve web/ on localhost:8768, then run from web with Playwright installed. */
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl']});
const errors=[],results=[];
try {
 const page=await browser.newPage({viewport:{width:900,height:1100}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/docs/FZH_Identity_Capsule_preview.html');
 await page.waitForFunction(()=>window.fzh?.model);
 await page.click('#motion');
 await page.click('#uv');
 await page.waitForFunction(()=>window.fzh?.uvCheck);
 await page.screenshot({path:'previews/FZH_Identity_Capsule_web_uv.png'});
 results.push(await page.evaluate(()=>({variant:'desktop',clips:window.fzh.animations,drawCalls:window.fzh.renderer.info.render.calls,triangles:window.fzh.renderer.info.render.triangles,portraitMapped:!!window.fzh.model.getObjectByName('Portrait_Plane').material.map})));
 await page.selectOption('#quality','_LOD');
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Mobile'));
 await page.click('#uv');
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'previews/FZH_Identity_Capsule_mobile_uv.png'});
 results.push(await page.evaluate(()=>({variant:'mobile',drawCalls:window.fzh.renderer.info.render.calls,triangles:window.fzh.renderer.info.render.triangles,portraitMapped:!!window.fzh.model.getObjectByName('Portrait_Plane').material.map})));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 await page.waitForFunction(()=>window.fzh?.model);
 assert.equal(await page.locator('#motion').innerText(),'Play');
 const before=await page.evaluate(()=>window.fzh.mixer.time);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 assert.equal(await page.evaluate(()=>window.fzh.mixer.time),before);
 assert.deepEqual(errors,[]);
 const report={renderer:'Chromium SwiftShader (software WebGL)',results,reducedMotion:'PASS: static on load',pageErrors:errors};
 await fs.writeFile('docs/FZH_Identity_Capsule_browser_validation.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
} finally {await browser.close();}
