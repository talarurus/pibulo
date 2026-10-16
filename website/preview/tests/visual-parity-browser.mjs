import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4318',checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await page.locator('.motion-preview-player').waitFor();
const player=page.getByRole('region',{name:'Recorded agent activity preview'});
await player.scrollIntoViewIfNeeded();
for(const state of ['Idle','Thinking','Working','Completed']){
 await player.getByRole('button',{name:state,exact:false}).click();
 assert.equal(await player.locator(`[data-agent-state="${state.toLowerCase()}"]`).count(),3);
 assert.deepEqual(await player.locator('[data-motion-agent]').evaluateAll(es=>es.map(e=>e.dataset.motionAgent)),['atlas','mira','cedar']);
}
checks.push('All four preview states sample the same three stable IDs');
await player.getByRole('button',{name:'Play preview'}).click();await page.waitForTimeout(200);
await player.getByRole('button',{name:'Pause preview'}).click();const paused=await page.locator('.preview-player-foot').innerText();await page.waitForTimeout(250);assert.equal(await page.locator('.preview-player-foot').innerText(),paused);
await player.getByRole('button',{name:'Play preview'}).click();await page.locator('footer').scrollIntoViewIfNeeded();await page.waitForTimeout(200);assert.equal(await player.getByRole('button',{name:'Pause preview'}).count(),0);
checks.push('Playback pauses on command and when scrolled out of view');
await page.emulateMedia({reducedMotion:'reduce'});await player.scrollIntoViewIfNeeded();assert.equal(await player.getByRole('button',{name:'Play preview'}).isDisabled(),true);await player.getByRole('button',{name:'Thinking',exact:false}).click();assert.equal(await player.locator('[data-agent-state=thinking]').count(),3);assert.equal(await player.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
checks.push('Reduced motion disables playback and retains manual settled states');
await page.getByRole('link',{name:'Open Studio ↗'}).click();await page.waitForURL('**/studio?mode=motion');assert.equal(await page.getByRole('button',{name:'Motion',exact:true}).getAttribute('aria-pressed'),'true');
checks.push('Homepage link opens Studio directly in Motion mode');
await page.goto(base+'/editor');
await page.getByRole('group',{name:'Visual expressions'}).getByRole('button',{name:'love',exact:true}).click();
assert.equal(await page.getByLabel('Expression',{exact:true}).inputValue(),'love');
await page.getByRole('navigation',{name:'Editor control sections'}).getByRole('button',{name:'Palette',exact:true}).click();
assert.equal(await page.getByLabel('Expression',{exact:true}).inputValue(),'love');assert.equal(new URL(page.url()).hash,'');
await page.getByRole('button',{name:'Pin hue 275 degrees',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Pin hue 275 degrees',exact:true}).getAttribute('aria-pressed'),'true');
await page.getByRole('group',{name:'Hue presets'}).getByRole('button',{name:'Auto',exact:true}).click();assert.ok(!('hue' in JSON.parse(await page.locator('#editor-avatar').getAttribute('data-record')).overrides));
checks.push('Visual expression controls sync with select; section navigation preserves config; hue feedback/reset works');
await page.getByLabel('Expression',{exact:true}).selectOption('idle');
await page.getByText('Custom palette overrides',{exact:true}).click();const color=page.getByLabel('head color override');await color.fill('#');assert.equal(await page.getByText('Something went astray.',{exact:true}).count(),0);await color.fill('#aaccbb');assert.equal(JSON.parse(await page.locator('#editor-avatar').getAttribute('data-resolved')).layout.palette.head,'#aaccbb');
checks.push('Incomplete palette entry can be corrected without losing the editor');
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:844});
 for(const path of ['/','/editor','/components','/studio','/studio?mode=motion','/agent-scenes','/docs']){
  await page.goto(base+path);await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path} ${width}`);
 }
}
checks.push('All requested routes fit desktop, mobile and narrow mobile');
await page.goto(base+'/components');
for(const link of await page.locator('.source-links a').all()){const response=await page.request.get(base+await link.getAttribute('href'));assert.equal(response.status(),200);assert.ok((await response.text()).length>100);}
checks.push('Every advertised component source download returns a real file');
const mobile=await browser.newPage({viewport:{width:320,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
await mobile.goto(base);await mobile.locator('#hero-avatar').tap();assert.notEqual(await mobile.locator('#hero-avatar').getAttribute('data-expression'),'idle');
await mobile.locator('.hero-identities summary').tap();
await mobile.locator('.hero-roster').getByRole('button',{name:'nova',exact:true}).tap();assert.equal(await mobile.locator('#hero-name').inputValue(),'nova');
checks.push('Touch reaction and identity selection work at 320px');
assert.deepEqual(errors,[]);await browser.close();
await mkdir('test-results/visual-parity',{recursive:true});await writeFile('test-results/visual-parity/report.json',JSON.stringify({checks,errors},null,2));console.log(checks);
