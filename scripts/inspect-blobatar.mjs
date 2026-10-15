import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const report={checks:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message));
const out='assets/visual-parity-v0.3.1/upstream';
async function check(name,fn){try{report.checks.push({name,result:await fn()});}catch(e){report.checks.push({name,error:e.message});}}
const geometry=()=>page.getByRole('button',{name:'React',exact:true}).locator('.mo-eye path').evaluateAll(nodes=>nodes.map(n=>({d:n.getAttribute('d'),bounds:n.getBoundingClientRect().toJSON()})));
await page.goto('https://blobatar.dev/');await page.waitForTimeout(700);
await check('Live hover, click morph and gaze',async()=>{
 const hero=page.getByRole('button',{name:'React',exact:true});await hero.hover();await page.waitForTimeout(500);
 const before=await geometry();await hero.click();await page.waitForTimeout(80);const early=await geometry();await page.waitForTimeout(650);const held=await geometry();await page.screenshot({path:`${out}/hero-reacting.png`});await page.waitForTimeout(1400);
 const box=await hero.boundingBox();await page.mouse.move(box.x-100,box.y+100);await page.waitForTimeout(500);const left=await geometry();await page.mouse.move(box.x+box.width+100,box.y+100);await page.waitForTimeout(500);const right=await geometry();
 return {before,early,held,left,right,animations:await hero.evaluate(e=>e.getAnimations({subtree:true}).length)};
});
await check('Visual hero controls',async()=>{
 await page.getByRole('button',{name:'Blobatar options'}).click();await page.waitForTimeout(300);await page.screenshot({path:`${out}/hero-controls-1440.png`});
 await page.getByRole('group',{name:'Expression',exact:true}).getByRole('button',{name:'happy',exact:true}).click();
 await page.getByRole('button',{name:'Hue 275 degrees',exact:true}).click();
 return {selected:await page.locator('[aria-pressed=true]').allTextContents(),url:page.url()};
});
await check('Reduced-motion click reaction',async()=>{
 await page.keyboard.press('Escape');await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'React',exact:true}).click();await page.waitForTimeout(300);
 return {animations:await page.getByRole('button',{name:'React',exact:true}).evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)};
});
await check('Editor controls and motion choices',async()=>{
 await page.goto('https://blobatar.dev/editor');await page.waitForTimeout(500);
 const before=await page.locator('button[aria-pressed=true]').allTextContents();
 const button=page.getByRole('button',{name:'boxy',exact:true});await button.click();
 await page.getByRole('radio',{name:'always',exact:true}).click();
 return {before,after:await page.locator('button[aria-pressed=true]').allTextContents(),sliders:await page.getByRole('slider').count(),url:page.url()};
});
await check('Component showcase interactions',async()=>{
 await page.goto('https://blobatar.dev/components');await page.waitForTimeout(500);
 await page.getByRole('button',{name:'planner',exact:false}).click();
 const controls=await page.locator('input,button,select').evaluateAll(ns=>ns.map(n=>({tag:n.tagName,text:n.textContent,aria:n.getAttribute('aria-label'),type:n.getAttribute('type')})));
 const pass=page.locator('input[type=password]').first();if(await pass.count()){await pass.fill('demo-only');await page.getByRole('button',{name:/show password/i}).first().click();}
 return {controls};
});
await check('Live wall hover/click and panel',async()=>{
 await page.goto('https://blobatar.dev/#wall');await page.locator('#wall').scrollIntoViewIfNeeded();await page.waitForTimeout(1500);
 const canvas=page.locator('#wall canvas').first();const box=await canvas.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(250);await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(500);await page.screenshot({path:`${out}/wall-interaction.png`});return {text:(await page.locator('#wall').innerText()).slice(0,1600)};
});
await page.setViewportSize({width:390,height:844});await page.goto('https://blobatar.dev/');await page.getByRole('button',{name:'Blobatar options'}).click();await page.waitForTimeout(300);await page.screenshot({path:`${out}/hero-controls-390.png`});
await browser.close();await writeFile(`${out}/interactions.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
