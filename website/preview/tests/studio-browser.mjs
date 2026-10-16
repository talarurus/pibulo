import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {parseRecording, serializeRecording} from '@talarurus/pibulo/recording';
import {svgFor} from '@talarurus/pibulo';
import {mkdirSync, writeFileSync, readFileSync} from 'node:fs';
const base=process.env.PREVIEW_URL||'http://localhost:4318', out=(process.env.PIBULO_STUDIO_ARTIFACTS||process.env.WHOAMI_STUDIO_ARTIFACTS)||'/tmp/pibulo-v020-studio';
const assets=(process.env.PIBULO_MEDIA_DIR||process.env.WHOAMI_MEDIA_DIR)||'test-results/pibulo-media';
mkdirSync(out,{recursive:true});mkdirSync(assets,{recursive:true});
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
  await page.screenshot({path:assets+'/studio-refined-desktop.png',fullPage:true});
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
  await click('Recorded events');await click('Copy Studio code');const events=JSON.parse(await page.evaluate(()=>navigator.clipboard.readText()));assert.equal(events.events.length,14);assert.equal(events.events.at(-1).type,'agent.reset');assert.equal(parseRecording(JSON.stringify(events)).ok,true);
  await click('React integration');
 });
 await check('Timeline buttons and keyboard navigation expose selected event details and clear replay mode',async()=>{
  await page.getByRole('button',{name:'Event 1: Task started, atlas',exact:true}).click();
  assert.equal(await page.locator('.studio-mode').innerText(),'Replay mode');await assertState('atlas','thinking');
  const row=page.getByRole('button',{name:'Event 1: Task started, atlas',exact:true});await row.focus();await row.press('ArrowDown');
  assert.match(await page.getByRole('region',{name:'Selected event details'}).innerText(),/Work in progress/);await assertState('atlas','working');
  await page.locator('.studio-event-list button:focus').press('End');assert.equal(await page.getByRole('slider',{name:'Replay position'}).inputValue(),'14');
  await page.locator('.studio-event-list button:focus').press('Home');assert.equal(await page.getByRole('slider',{name:'Replay position'}).inputValue(),'1');
  await page.getByRole('slider',{name:'Replay position'}).focus();await page.keyboard.press('ArrowRight');assert.equal(await page.getByRole('slider',{name:'Replay position'}).inputValue(),'2');
  await click('Previous');assert.equal(await page.getByRole('slider',{name:'Replay position'}).inputValue(),'1');
  await click('Return to live');assert.equal(await page.locator('.studio-mode').innerText(),'Live session');await assertState('mira','idle');
 });
 await check('Recording export/import round-trip uses the versioned public format and preserves independent live state',async()=>{
  assert.match(await page.locator('.studio-privacy').innerText(),/task descriptions/);
  const [download]=await Promise.all([page.waitForEvent('download'),click('Export recording')]);await download.saveAs(out+'/roundtrip.json');
  const json=readFileSync(out+'/roundtrip.json','utf8'),validated=parseRecording(json);assert.equal(validated.ok,true);assert.equal(validated.recording.events.length,14);
  const [chooser]=await Promise.all([page.waitForEvent('filechooser'),click('Import recording')]);await chooser.setFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(json)});
  await page.getByRole('status').filter({hasText:'Imported 14 events'}).waitFor();await assertState('atlas','idle');await assertState('mira','idle');
  await click('Return to live');await assertState('atlas','working');await assertState('mira','idle');await assertState('cedar','completed');
  const [again]=await Promise.all([page.waitForEvent('download'),click('Export recording')]);await again.saveAs(out+'/roundtrip-again.json');assert.equal(readFileSync(out+'/roundtrip-again.json','utf8'),json);
 });
 await check('Malformed, unsupported, unordered, oversized and invalid-UTF8 files preserve the current session',async()=>{
  const json=readFileSync(out+'/roundtrip.json','utf8'),payload=JSON.parse(json),before=await state('atlas');
  const cases=[Buffer.from('{bad'),Buffer.from(JSON.stringify({...payload,version:2})),Buffer.from(JSON.stringify({...payload,events:[payload.events[0],payload.events[0]]})),Buffer.alloc(262145,32),Buffer.from(json.replace('atlas','atXas')).map(byte=>byte===88?255:byte)];
  for(const buffer of cases){await page.getByLabel('Import recording JSON',{exact:true}).setInputFiles({name:'bad.json',mimeType:'application/json',buffer});await page.getByRole('alert').filter({hasText:'Current session kept'}).waitFor();assert.equal(await state('atlas'),before);assert.equal(await page.locator('.studio-event-list li').count(),14);}
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
   if(width<700){await page.evaluate(()=>scrollTo(0,0));assert.ok((await page.getByRole('group',{name:'Choose an agent'}).boundingBox()).height<220);assert.ok((await page.getByRole('region',{name:'Task controls'}).boundingBox()).y<1050,'controls require excessive scrolling');}
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
  await mp.screenshot({path:assets+'/studio-refined-mobile.png',fullPage:true});
  await mp.getByRole('button',{name:'Select Mira',exact:true}).focus();await mp.keyboard.press('Enter');assert.equal(await mp.getByRole('button',{name:'Select Mira',exact:true}).getAttribute('aria-pressed'),'true');await mp.getByRole('button',{name:'Resolve input',exact:true}).click();
  assert.equal(await mp.locator('[data-agent-id="mira"] [data-agent-state]').getAttribute('data-agent-state'),'working');
  await mp.getByRole('button',{name:'Complete',exact:true}).click();await mp.getByRole('button',{name:'Start task ↗',exact:true}).click();
  await mp.getByRole('button',{name:'Replay recording',exact:true}).click();await mp.getByRole('button',{name:'Pause',exact:true}).click();
  await mp.getByRole('slider',{name:'Replay position'}).fill('0');assert.equal(await mp.locator('[data-agent-id="mira"] [data-agent-state]').getAttribute('data-agent-state'),'idle');
  assert.ok(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await mp.getByRole('button',{name:'Return to live',exact:true}).click();
  const [download]=await Promise.all([mp.waitForEvent('download'),mp.getByRole('button',{name:'Export recording',exact:true}).click()]);await download.saveAs(out+'/mobile-roundtrip.json');
  await mp.getByLabel('Import recording JSON',{exact:true}).setInputFiles(out+'/mobile-roundtrip.json');await mp.getByRole('status').filter({hasText:'Imported 9 events'}).waitFor();
  await mp.getByRole('button',{name:'Return to live',exact:true}).click();assert.equal(await mp.locator('[data-agent-id="mira"] [data-agent-state]').getAttribute('data-agent-state'),'thinking');
  const longName='A'.repeat(128),longId='a'.repeat(128),secondId='b'.repeat(128);
  const long=serializeRecording({agents:[{id:longId,name:longName},{id:secondId,name:longName}],events:[]});assert.equal(long.ok,true);
  await mp.getByLabel('Import recording JSON',{exact:true}).setInputFiles({name:'long.json',mimeType:'application/json',buffer:Buffer.from(long.json)});await mp.getByRole('status').filter({hasText:'Imported 0 events'}).waitFor();
  assert.ok((await mp.getByRole('group',{name:'Choose an agent'}).boundingBox()).height<220);
  assert.equal(await mp.getByRole('button',{name:`Select ${longName} (${secondId})`,exact:true}).count(),1);
  await mobile.close();
 });
 await check('Custom imported identities, escaped integration code and future timestamps remain usable',async()=>{
  const agentId='owner"agent',name="Agent's \"quoted\" name";
  const record=serializeRecording({agents:[{id:agentId,name}],events:[{version:1,type:'task.started',agentId,taskId:'initial',sequence:1,timestamp:1900000000000},{version:1,type:'task.completed',agentId,taskId:'initial',sequence:2,timestamp:1900000000000}]});assert.equal(record.ok,true);
  await page.getByLabel('Import recording JSON',{exact:true}).setInputFiles({name:'custom.json',mimeType:'application/json',buffer:Buffer.from(record.json)});await page.getByRole('status').filter({hasText:'Imported 2 events'}).waitFor();
  await click('Return to live');await click('Start task ↗');assert.equal(await page.locator('.studio-scene').getAttribute('data-agent-state'),'thinking');
  await click('Copy Studio code');const code=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(code.includes(JSON.stringify(name)));assert.ok(code.includes(JSON.stringify(agentId)));
  const [download]=await Promise.all([page.waitForEvent('download'),click('Export recording')]);await download.saveAs(out+'/custom.json');assert.equal(parseRecording(readFileSync(out+'/custom.json','utf8')).ok,true);
 });
 await check('Existing editor share links and SVG/PNG export still reproduce the original renderer',async()=>{
  await page.goto(base+'/editor');await page.getByRole('button',{name:'None',exact:true}).click();
  await page.getByLabel('Expression',{exact:true}).selectOption('happy');
  await page.getByRole('button',{name:'Copy share link'}).click();const link=await page.evaluate(()=>navigator.clipboard.readText());
  const payload=JSON.parse(decodeURIComponent(new URL(link).hash.replace('#config=',''))),expected=svgFor(payload.config,512);
  await page.locator('.export-menu summary').click();const [svg]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:/^SVG Vector/}).click()]);await svg.saveAs(out+'/editor.svg');assert.equal(readFileSync(out+'/editor.svg','utf8'),expected);
  const [png]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:/^PNG 512/}).click()]);await png.saveAs(out+'/editor.png');
  const differences=await page.evaluate(async({svg,png})=>{async function pixels(src){const image=new Image();image.src=src;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d');c.drawImage(image,0,0,512,512);return c.getImageData(0,0,512,512).data;}const a=await pixels('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)),b=await pixels(png);return a.reduce((count,value,i)=>count+(value!==b[i]?1:0),0);},{svg:expected,png:'data:image/png;base64,'+readFileSync(out+'/editor.png').toString('base64')});assert.equal(differences,0);
  await page.goto(link);assert.equal(JSON.parse(await page.locator('#editor-avatar').getAttribute('data-record')).seed,'atlas');
 });
 await check('Recording documentation exposes a copyable public integration on small screens',async()=>{
  await page.setViewportSize({width:320,height:844});await page.goto(base+'/docs#activity');
  await page.getByRole('button',{name:'Copy recording integration',exact:true}).click();
  assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/pibulo\/recording/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 });
 assert.deepEqual(errors,[]);checks.push('No browser runtime errors');
 writeFileSync(out+'/report.json',JSON.stringify({browser:browser.version(),checks,errors,screenshots:[assets+'/studio-refined-desktop.png',assets+'/studio-refined-mobile.png']},null,2));
 console.log('Artifacts:',out);
} catch(error){await page.screenshot({path:out+'/failure.png',fullPage:true});writeFileSync(out+'/report.json',JSON.stringify({browser:browser.version(),checks,errors,failure:String(error)},null,2));throw error;}
finally {await browser.close();}
