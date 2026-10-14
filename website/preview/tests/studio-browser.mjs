import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
const base=process.env.PREVIEW_URL||'http://localhost:4318', out=process.env.WHOAMI_STUDIO_ARTIFACTS||'/tmp/whoami-v020-studio';
mkdirSync(out,{recursive:true});mkdirSync('assets',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1100},permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();page.setDefaultTimeout(10000);
const errors=[],checks=[];page.on('pageerror',error=>errors.push(error.message));
const card=id=>page.locator(`[data-agent-id="${id}"]`);
const state=id=>card(id).locator('[data-agent-state]').getAttribute('data-agent-state');
const click=name=>page.getByRole('button',{name,exact:true}).click();
const assertState=async(id,value)=>assert.equal(await state(id),value);
async function check(name,fn){await fn();checks.push(name);console.log('PASS',name);}
try {
 await page.goto(base+'/studio');await page.getByRole('heading',{name:'Identity, in motion.'}).waitFor();
 await check('Studio loads three independent stable identities using the public scene API',async()=>{
  assert.equal(await card('atlas').locator('svg').count(),1);await assertState('atlas','working');await assertState('mira','needs-input');await assertState('cedar','completed');
  assert.match(await page.locator('.studio-notice').innerText(),/Simulated events/);
  assert.equal(await card('atlas').getByRole('status').innerText(),'Atlas · Working');
  assert.equal(await card('mira').getByRole('status').getAttribute('aria-live'),'polite');
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);
  await page.screenshot({path:'assets/studio-desktop.png',fullPage:true});
 });
 await check('Input resolution, completion, thinking, waiting, errors and resets update only their agent',async()=>{
  await click('Select Mira');await click('Resolve input');await assertState('mira','working');await assertState('atlas','working');
  await click('Complete');await assertState('mira','completed');await click('Start task ↗');await assertState('mira','thinking');
  await click('Wait');await assertState('mira','waiting');assert.equal(await page.getByRole('button',{name:'Wait',exact:true}).isDisabled(),true);await click('Work');await click('Request input');await assertState('mira','needs-input');
  assert.equal(await page.getByRole('button',{name:'Complete',exact:true}).isDisabled(),true);
  await click('Trigger error');await assertState('mira','error');await assertState('cedar','completed');
  await click('Reset agent');await assertState('mira','idle');
  assert.equal(await page.getByRole('button',{name:'Start task ↗',exact:true}).isEnabled(),true);
  assert.equal(await page.locator('.studio-event-list li').count(),14);
 });
 await check('Replay, pause, step and seeking reproduce event history and return to live state',async()=>{
  await click('Replay recording');await click('Pause');
  await page.getByRole('slider',{name:'Replay position'}).fill('0');
  await assertState('atlas','idle');await assertState('mira','idle');await assertState('cedar','idle');
  assert.equal(await page.getByRole('button',{name:'Start task ↗',exact:true}).isDisabled(),true);
  await click('Step');await assertState('atlas','thinking');
  await page.getByRole('slider',{name:'Replay position'}).fill('6');await assertState('atlas','working');await assertState('mira','needs-input');await assertState('cedar','completed');
  await page.getByRole('slider',{name:'Replay position'}).fill('14');await assertState('mira','idle');
  await click('Return to live');await assertState('mira','idle');
 });
 await check('Code examples and recording JSON copy through the clipboard',async()=>{
  await click('Copy Studio code');assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/createActivityEngine/);
  await click('Recorded events');await click('Copy Studio code');const events=JSON.parse(await page.evaluate(()=>navigator.clipboard.readText()));assert.equal(events.length,14);assert.equal(events.at(-1).type,'agent.reset');
  await click('React integration');
 });
 await check('Reduced motion is stable, status text remains available, and viewport pauses scenes',async()=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
  const geometry=()=>card('atlas').locator('svg').evaluate(svg=>[...svg.querySelectorAll('path')].map(p=>p.getScreenCTM().toString()));
  const before=await geometry();await page.waitForTimeout(400);assert.deepEqual(await geometry(),before);
  assert.equal(await page.locator('.studio-scene').evaluateAll(nodes=>nodes.flatMap(n=>n.getAnimations({subtree:true})).filter(a=>a.playState==='running').length),0);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.studio-integration').scrollIntoViewIfNeeded();await page.waitForTimeout(200);
  assert.ok(await card('atlas').locator('.preview-no-idle').count());
  await page.getByRole('heading',{name:'Identity, in motion.'}).scrollIntoViewIfNeeded();
 });
 await check('320, 390, 768 and 1440 pixel layouts fit without horizontal overflow',async()=>{
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:width<700?844:1100});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}px overflow`);
  }
 });
 await check('Fresh sessions preserve identity and support the full simulated lifecycle',async()=>{
  await click('New session');assert.equal(await page.locator('.studio-event-list li').innerText(),'Your next action starts the story.');
  await assertState('atlas','idle');await assertState('mira','idle');
  await click('Select Atlas');await page.getByLabel('Task description').fill('Verify owner review');await click('Start task ↗');await assertState('atlas','thinking');await click('Work');await click('Complete');await assertState('atlas','completed');
 });
 await check('Recording capacity prevents eviction and a new session restores controls',async()=>{
  for(let count=3;count<120;count++)await click('Reset agent');
  assert.equal(await page.locator('.studio-event-list li').count(),120);
  assert.equal(await page.getByRole('button',{name:'Reset agent',exact:true}).isDisabled(),true);
  assert.equal(await page.getByRole('button',{name:'Start task ↗',exact:true}).isDisabled(),true);
  assert.match(await page.getByRole('status').filter({hasText:'Recording full'}).innerText(),/new session/);
  await click('New session');assert.equal(await page.getByRole('button',{name:'Start task ↗',exact:true}).isEnabled(),true);
 });
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),mp=await mobile.newPage();mp.on('pageerror',error=>errors.push(error.message));
 await check('Touch mobile can resolve input, start tasks and inspect replay',async()=>{
  await mp.goto(base+'/studio');await mp.getByRole('heading',{name:'Identity, in motion.'}).waitFor();await mp.evaluate(()=>document.fonts.ready);
  await mp.screenshot({path:'assets/studio-mobile.png',fullPage:true});
  await mp.getByRole('button',{name:'Select Mira',exact:true}).click();await mp.getByRole('button',{name:'Resolve input',exact:true}).click();
  assert.equal(await mp.locator('[data-agent-id="mira"] [data-agent-state]').getAttribute('data-agent-state'),'working');
  await mp.getByRole('button',{name:'Complete',exact:true}).click();await mp.getByRole('button',{name:'Start task ↗',exact:true}).click();
  await mp.getByRole('button',{name:'Replay recording',exact:true}).click();await mp.getByRole('button',{name:'Pause',exact:true}).click();
  await mp.getByRole('slider',{name:'Replay position'}).fill('0');assert.equal(await mp.locator('[data-agent-id="mira"] [data-agent-state]').getAttribute('data-agent-state'),'idle');
  assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.close();
 });
 assert.deepEqual(errors,[]);checks.push('No browser runtime errors');
 writeFileSync(out+'/report.json',JSON.stringify({browser:browser.version(),checks,errors,screenshots:['assets/studio-desktop.png','assets/studio-mobile.png']},null,2));
 console.log('Artifacts:',out);
} catch(error){await page.screenshot({path:out+'/failure.png',fullPage:true});throw error;}
finally {await browser.close();}
