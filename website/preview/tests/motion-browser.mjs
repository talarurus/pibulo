import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {buildSync} from 'esbuild';
import {compileMotionRecording} from '@talarurus/whoami/motion';
import {serializeRecording} from '@talarurus/whoami/recording';
import {svgFor} from '@talarurus/whoami';
await import('../../../scripts/motion-baseline.mjs');
const {svgFor: baselineSVG} = await import('../../../test-results/motion-v030/baseline.mjs');
process.env.PLAYWRIGHT_BROWSERS_PATH ??= new URL('../../../test-results/motion-v030/browsers', import.meta.url).pathname;
const {chromium, webkit} = await import('playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4318';
const output = new URL('../../../test-results/motion-v030/', import.meta.url);
const shots = new URL('../../../assets/', import.meta.url);
await mkdir(output, {recursive:true}); await mkdir(shots, {recursive:true});
const event = (id, sequence, timestamp, type, taskId='task') => ({version:1,agentId:id,sequence,timestamp,type,...(type==='agent.reset'?{}:{taskId})});
const source={agents:[{id:'atlas',name:'Atlas'},{id:'mira',name:'Mira'},{id:'cedar',name:'Cedar'}],events:[
  event('atlas',1,800,'task.started'),event('atlas',2,1800,'task.working'),
  event('mira',1,1200,'task.started'),event('cedar',1,1800,'task.started'),
  event('atlas',3,3300,'task.completed'),event('mira',2,3700,'task.completed'),event('cedar',2,4200,'task.completed'),
]};
const encoded=serializeRecording(source); assert.ok(encoded.ok);
const compiled=compileMotionRecording(encoded.json,{originMs:0});assert.ok(compiled.ok);
const motion=compiled.motion;
const helper=buildSync({stdin:{contents:'export {_layout} from "./website/preview/vendor/blobatar/src/blobatar.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false}).outputFiles[0].text;
const module={exports:{}};new Function('module','exports',helper)(module,module.exports);
const representatives=new Map();for(let i=0;representatives.size<10&&i<1000;i++){const id=`contain-${i}`;representatives.set(module.exports._layout(id,{normalize:false}).shape,id);}
const names=['idle','happy','sad','mad','surprised','wink','sleepy','smug','unsure','scared','love','shy','sick','thinking'];
const containment=[];
for(const [shape,id] of representatives)for(const expression of names){
  const json=serializeRecording({agents:[{id}],events:[event(id,1,100,'task.started')]}).json;
  const result=compileMotionRecording(json,{originMs:0,policy:{expressions:{thinking:expression}}});assert.ok(result.ok);
  for(const time of [100,180,300,420,500])containment.push({shape,expression,time,svg:result.motion.svgFor(id,time,{size:100,decorative:true})});
}
const harness = buildSync({stdin:{contents:`
import React from 'react'; import {createRoot} from 'react-dom/client'; import {flushSync} from 'react-dom';
import {compileMotionRecording} from './src/motion.ts'; import {RecordedAgentAvatar} from './src/motion-react.tsx';
import {useMotionPlayback} from './website/preview/src/useMotionPlayback.ts';
let root, motion;
function Player(){const player=useMotionPlayback(motion.durationMs,true,false);return <div><button id="probe-play" onClick={player.play}>Play</button><RecordedAgentAvatar motion={motion} agentId="atlas" playbackMs={player.time}/></div>}
window.motionProbe={mount(json){const result=compileMotionRecording(json,{originMs:0});motion=result.motion;const host=document.createElement('div');host.id='motion-probe';document.body.append(host);root=createRoot(host);flushSync(()=>root.render(<Player/>));},unmount(){flushSync(()=>root.unmount());document.getElementById('motion-probe').remove();}};
`,loader:'tsx',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'iife',write:false,define:{'process.env.NODE_ENV':'"production"'}}).outputFiles[0].text;
const report=[];
for(const engine of ['chrome','webkit']){
  const browser=engine==='chrome'?await chromium.launch({channel:'chrome',headless:true}):await webkit.launch({headless:true});
  const result={engine,version:browser.version(),checks:[],errors:[]};
  report.push(result);
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference',hasTouch:true});
    page.on('pageerror',error=>result.errors.push(error.message));page.setDefaultTimeout(10000);
    const card=id=>page.locator(`[data-agent-id="${id}"]`);
    const state=async id=>card(id).locator('[data-agent-state]').getAttribute('data-agent-state');
    const timestamp=page.getByRole('spinbutton',{name:'Motion timestamp',exact:true});
    const seek=async time=>{await timestamp.fill(String(time));await timestamp.press('Tab');};
    const frames=()=>page.locator('[data-motion-agent] svg').evaluateAll(svgs=>svgs.map(svg=>new XMLSerializer().serializeToString(svg)));
    await page.goto(base+'/studio');await page.getByRole('heading',{name:'Identity, in motion.'}).waitFor();
    const liveStates=await Promise.all(['atlas','mira','cedar'].map(state));
    await page.getByRole('button',{name:'Motion',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Start task ↗',exact:true}).count(),0);
    await page.getByLabel('Import recording JSON',{exact:true}).setInputFiles({name:'motion.json',mimeType:'application/json',buffer:Buffer.from(encoded.json)});
    await page.locator('.studio-file-notice').filter({hasText:'Imported 7 events'}).waitFor();
    // Set the explicit origin rather than depending on Studio's inferred idle lead-in.
    await page.getByText('Playback origin',{exact:true}).click();await page.getByRole('spinbutton',{name:'Playback origin',exact:true}).fill('0');
    await page.getByRole('button',{name:'Apply origin',exact:true}).click();await seek(2200);
    assert.equal(await state('atlas'),'working');assert.equal(await state('mira'),'thinking');
    assert.match(await card('atlas').innerText(),/Executing task/);assert.match(await card('mira').innerText(),/Planning/);
    await page.getByText('Playback origin',{exact:true}).click();
    await page.evaluate(()=>document.fonts.ready);
    if(engine==='chrome')await page.screenshot({path:new URL('studio-motion-desktop.png',shots).pathname,fullPage:true});
    result.checks.push('v1 import, shared clock and distinct static planning/execution cues');
    const expected=await frames();
    for(const time of [4000,0,900,2200])await seek(time);
    assert.deepEqual(await frames(),expected);
    for(let i=0;i<3;i++){await page.getByRole('button',{name:'Restart motion',exact:true}).click();assert.equal(await timestamp.inputValue(),'0');await seek(2200);assert.deepEqual(await frames(),expected);}
    result.checks.push('backward/forward seeks and repeated restart');
    await page.getByRole('combobox',{name:'Playback speed',exact:true}).selectOption('2');await seek(0);
    await page.getByRole('button',{name:'Play motion',exact:true}).click();await page.waitForTimeout(240);await page.getByRole('button',{name:'Pause motion',exact:true}).click();
    const paused=Number(await timestamp.inputValue());assert.ok(paused>200&&paused<1600);
    const pausedFrames=await frames();await page.waitForTimeout(180);assert.equal(Number(await timestamp.inputValue()),paused);assert.deepEqual(await frames(),pausedFrames);
    result.checks.push('speed control, play and stable pause');
    await page.getByRole('region',{name:'Recorded motion controls'}).focus();await page.keyboard.press('ArrowRight');assert.equal(Number(await timestamp.inputValue()),paused+100);
    const events=page.locator('.studio-event-list button');await events.nth(0).click();await page.keyboard.press('ArrowDown');
    assert.match(await page.getByRole('region',{name:'Selected event details'}).innerText(),/Work in progress/);
    assert.equal(await timestamp.inputValue(),'1800');
    await page.getByRole('slider',{name:'Motion playback position',exact:true}).fill('2200');assert.equal(await timestamp.inputValue(),'2200');
    result.checks.push('keyboard timeline, keyboard timestamp nudges and touch-sized seek controls');
    await page.getByText('Playback origin',{exact:true}).click();await page.getByRole('spinbutton',{name:'Playback origin',exact:true}).fill('10000');await page.getByRole('button',{name:'Apply origin',exact:true}).click();
    assert.match(await page.getByRole('alert').innerText(),/precedes/);assert.equal(await timestamp.inputValue(),'2200');await page.getByText('Playback origin',{exact:true}).click();
    await page.getByLabel('Import recording JSON',{exact:true}).setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{')});
    assert.equal(await state('atlas'),'working');assert.match(await page.locator('.studio-file-notice').innerText(),/kept/);
    result.checks.push('atomic failed import and origin changes');
    await page.getByRole('button',{name:'Activity',exact:true}).click();await page.getByRole('button',{name:'Return to live',exact:true}).click();
    assert.deepEqual(await Promise.all(['atlas','mira','cedar'].map(state)),['completed','completed','completed']);
    // A motion round-trip leaves this live session and its accepted recording intact.
    await page.getByRole('button',{name:'Motion',exact:true}).click();await seek(0);await page.getByRole('button',{name:'Activity',exact:true}).click();
    assert.deepEqual(await Promise.all(['atlas','mira','cedar'].map(state)),['completed','completed','completed']);
    result.checks.push('motion cannot mutate live state');
    await page.getByRole('button',{name:'Motion',exact:true}).click();await page.emulateMedia({reducedMotion:'reduce'});await seek(1800);
    assert.ok(await page.getByRole('button',{name:'Play motion',exact:true}).isDisabled());const reducedFrames=await frames();await seek(2000);assert.deepEqual(await frames(),reducedFrames);
    await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await card('mira').getByRole('button',{name:'Select Mira',exact:true}).tap();assert.match(await page.locator('.studio-controls h2').innerText(),/Mira/);
    // Restore a useful screenshot without failed-input banners.
    await page.getByLabel('Import recording JSON',{exact:true}).setInputFiles({name:'motion.json',mimeType:'application/json',buffer:Buffer.from(encoded.json)});
    await page.locator('.studio-file-notice').filter({hasText:'Imported 7 events'}).waitFor();
    await seek(2200);
    await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
    if(engine==='chrome')await page.screenshot({path:new URL('studio-motion-mobile.png',shots).pathname,fullPage:true});
    await page.setViewportSize({width:320,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    result.checks.push('reduced-motion settled frames and 390/320px responsive interaction');
    const empty=serializeRecording({agents:[{id:'atlas',name:'Atlas'}],events:[]});
    await page.getByLabel('Import recording JSON',{exact:true}).setInputFiles({name:'empty.json',mimeType:'application/json',buffer:Buffer.from(empty.json)});
    await page.locator('.studio-file-notice').filter({hasText:'Imported 0 events'}).waitFor();
    assert.equal(await state('atlas'),'idle');assert.ok(await page.getByRole('button',{name:'Play motion',exact:true}).isDisabled());
    result.checks.push('empty recording fallback');

    await page.goto(base+'/docs');
    const bounds=await page.evaluate(items=>{
      const host=document.createElement('div');host.style.cssText='position:absolute;left:0;top:0';document.body.append(host);
      let failures=[],range={x:100,y:100,right:0,bottom:0};
      for(const item of items){host.innerHTML=item.svg;const box=host.querySelector('svg').getBBox();range.x=Math.min(range.x,box.x);range.y=Math.min(range.y,box.y);range.right=Math.max(range.right,box.x+box.width);range.bottom=Math.max(range.bottom,box.y+box.height);if(box.x < -0.01 || box.y < -0.01 || box.x+box.width > 100.01 || box.y+box.height > 100.01)failures.push({...item,svg:undefined,box:{x:box.x,y:box.y,w:box.width,h:box.height}});}
      host.remove();return {samples:items.length,failures,range};
    },containment);
    assert.deepEqual(bounds.failures,[]);result.containment=bounds;
    result.checks.push('700 geometric samples: all ten silhouettes and fourteen expression targets contained');
    const fixtures=JSON.parse(await readFile(new URL('../../../tests/fixtures/preview-identity.json',import.meta.url)));
    result.fixtures=[];
    for(const fixture of fixtures.cases){
      const before=baselineSVG(fixture.config,fixture.size),after=svgFor(fixture.config,fixture.size);assert.equal(before,after);
      const difference=await page.evaluate(async ({before,after,size})=>{
        async function raster(svg){const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));const bitmap=await createImageBitmap(blob);ctx.clearRect(0,0,size,size);ctx.drawImage(bitmap,0,0);bitmap.close();return ctx.getImageData(0,0,size,size).data;}finally{URL.revokeObjectURL(url);}}
        const a=await raster(before),b=await raster(after);return a.reduce((sum,value,i)=>sum+Number(value!==b[i]),0);
      },{before,after,size:fixture.size});assert.equal(difference,0);result.fixtures.push(difference);
    }
    result.checks.push('seven baseline/current SVG and decoded PNG parity comparisons');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>{
      window.probeResources={frames:new Set(),media:0};const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
      window.requestAnimationFrame=callback=>{const id=raf(time=>{window.probeResources.frames.delete(id);callback(time);});window.probeResources.frames.add(id);return id;};window.cancelAnimationFrame=id=>{window.probeResources.frames.delete(id);cancel(id);};
      const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener=function(type,...args){if(this.media==='(prefers-reduced-motion: reduce)'&&type==='change')window.probeResources.media++;return add.call(this,type,...args);};
      EventTarget.prototype.removeEventListener=function(type,...args){if(this.media==='(prefers-reduced-motion: reduce)'&&type==='change')window.probeResources.media--;return remove.call(this,type,...args);};
    });
    await page.addScriptTag({content:harness});
    for(let i=0;i<3;i++){
      await page.evaluate(json=>window.motionProbe.mount(json),encoded.json);await page.locator('#probe-play').click();await page.waitForTimeout(80);
      await page.evaluate(()=>window.motionProbe.unmount());await page.waitForTimeout(40);
      assert.deepEqual(await page.evaluate(()=>({frames:window.probeResources.frames.size,media:window.probeResources.media})),{frames:0,media:0});
    }
    result.checks.push('three React mount/play/unmount cycles release rAF and media listeners');
    assert.deepEqual(result.errors,[]);
    console.log('PASS',engine,result.checks.length,'checks',bounds.samples,'containment samples');
  }finally{await browser.close();}
}
await writeFile(new URL('browser-report.json',output),JSON.stringify(report,null,2));
