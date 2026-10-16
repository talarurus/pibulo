import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const mode=process.argv[2]||'after', upstream=mode==='upstream',only=process.argv[3];
if(mode==='upstream-interactions'){await import('./inspect-blobatar.mjs');process.exit(0);}
const root=process.env.PIBULO_CAPTURE_DIR||`test-results/visual-parity/${mode}`;
await mkdir(root,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={mode,browser:browser.version(),pages:[],errors:[]};
for(const width of (upstream?[1440,390]:[1440,390,320])){
 const page=await browser.newPage({viewport:{width,height:width===1440?1000:844},reducedMotion:'reduce',isMobile:width<500,hasTouch:width<500});
 page.on('pageerror',e=>report.errors.push(e.message));
 for(const [name,path] of (upstream?[['home','/'],['editor','/editor'],['components','/components'],['wall','/#wall'],['docs','/docs']]:[['home','/'],['editor','/editor'],['components','/components'],['studio-activity','/studio'],['studio-motion','/studio'],['agent-scenes','/agent-scenes'],['docs','/docs']])){
  if(only && !only.split(',').includes(name))continue;
  await page.goto((upstream?'https://blobatar.dev':process.env.PREVIEW_URL||'http://127.0.0.1:4318')+path);
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(700);
  if(name==='studio-motion'){await page.getByRole('button',{name:'Motion',exact:true}).click();await page.locator('.studio-mp4').waitFor();await page.getByText('Checking H.264 export support…',{exact:true}).waitFor({state:'hidden'});}
  if(name==='wall')await page.locator('#wall').scrollIntoViewIfNeeded();
  if(name==='editor'&&upstream)await page.screenshot({path:`${root}/editor-full-${width}.png`,fullPage:true});
  await page.screenshot({path:`${root}/${name}-${width}.png`,fullPage:name.startsWith('studio-')});
  if(mode==='rebrand'&&name==='home')await page.locator('.motion-preview').screenshot({path:`${root}/recorded-preview-${width}.png`});
  if(!upstream && ['after','restored'].includes(mode)){
   if(name==='home'){
    await page.screenshot({path:`${root}/home-full-${width}.png`,fullPage:true});
    await page.locator('.motion-preview').screenshot({path:`${root}/recorded-preview-${width}.png`});
    await page.locator('.wall-section').screenshot({path:`${root}/wall-${width}.png`});
   }
   if(name==='editor'){
    await page.getByRole('navigation',{name:'Editor control sections'}).getByRole('button',{name:'Expression',exact:true}).click();
    await page.screenshot({path:`${root}/editor-expressions-${width}.png`});
    await page.getByRole('navigation',{name:'Editor control sections'}).getByRole('button',{name:'Palette',exact:true}).click();
    await page.screenshot({path:`${root}/editor-palette-${width}.png`});
   }
  }
  report.pages.push({name,width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),title:await page.title()});
 }
 await page.close();
}
await writeFile(`${root}/capture.json`,JSON.stringify(report,null,2));
await browser.close();console.log(report);
