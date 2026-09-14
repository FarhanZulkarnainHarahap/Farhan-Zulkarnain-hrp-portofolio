/** Start python3 -m http.server 8767 --directory . from web first. */
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl']});
try {
 const page=await browser.newPage({viewport:{width:1000,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8767/docs/FZH_Hero_Kinetic_Core_preview.html');
 await page.waitForFunction(()=>window.fzh?.model);
 await page.screenshot({path:'previews/FZH_Hero_Kinetic_Core_web.png'});
 console.log('DESKTOP',await page.evaluate(()=>({clips:window.fzh.animations,drawCalls:window.fzh.renderer.info.render.calls,triangles:window.fzh.renderer.info.render.triangles})));
 await page.selectOption('#quality','_LOD');
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Mobile'));
 console.log('MOBILE',await page.evaluate(()=>({drawCalls:window.fzh.renderer.info.render.calls,triangles:window.fzh.renderer.info.render.triangles})));
 console.log('ERRORS',errors);
 if(errors.length)throw new Error(errors.join('\n'));
} finally { await browser.close(); }
