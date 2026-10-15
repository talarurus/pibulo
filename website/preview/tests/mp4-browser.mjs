import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile,copyFile} from 'node:fs/promises';
import {buildSync} from 'esbuild';
process.env.PLAYWRIGHT_BROWSERS_PATH??=new URL('../../../test-results/motion-v030/browsers',import.meta.url).pathname;
const {chromium,webkit}=await import('playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4318';
const output=new URL('../../../test-results/mp4/',import.meta.url),assets=new URL('../../../assets/',import.meta.url);
await mkdir(output,{recursive:true});await mkdir(assets,{recursive:true});
const harness=buildSync({stdin:{contents:'import * as mp4 from "./src/mp4.ts";import {compileMotionRecording} from "./src/motion.ts";import {serializeRecording} from "./src/recording.ts";window.exportProbe={...mp4,compileMotionRecording,serializeRecording};',resolveDir:process.cwd()},bundle:true,platform:'browser',format:'iife',write:false}).outputFiles[0].text;
const event=(agentId,sequence,timestamp,type)=>({version:1,agentId,sequence,timestamp,type,taskId:'task-1'});
const source={agents:[{id:'atlas',name:'Atlas'},{id:'mira',name:'Mira'},{id:'cedar',name:'Cedar'}],events:[event('atlas',1,300,'task.started'),event('mira',1,600,'task.started'),event('atlas',2,1000,'task.working'),event('cedar',1,1200,'task.started'),event('atlas',3,2000,'task.completed'),event('mira',2,2200,'task.completed'),event('cedar',2,2400,'task.completed')]};
const reports=[];
for(const kind of (process.env.MP4_BROWSER?[process.env.MP4_BROWSER]:['chrome','webkit'])){
  const browser=kind==='chrome'?await chromium.launch({channel:'chrome',headless:true}):await webkit.launch({headless:true});
  const report={engine:kind,version:browser.version(),checks:[],files:[],errors:[]};reports.push(report);
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1100},hasTouch:true,reducedMotion:'no-preference'});
    page.setDefaultTimeout(60000);page.on('pageerror',error=>report.errors.push(error.message));
    // Keep API qualification free of unrelated animated documentation demos.
    await page.goto(base+'/THIRD-PARTY-NOTICES.txt');await page.setContent('<!doctype html><html><body></body></html>');await page.addScriptTag({content:harness});
    await page.evaluate(source=>{
      const p=window.exportProbe,file=p.serializeRecording(source);window.testMotion=p.compileMotionRecording(file.json,{originMs:0}).motion;
      window.metrics={frames:[],encoders:[],urls:new Set(),canvases:[],maximumQueue:0};
      const Frame=window.VideoFrame,Encoder=window.VideoEncoder,create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL),element=document.createElement.bind(document);
      window.nativeEncoder=Encoder;
      if(Frame){window.VideoFrame=class extends Frame{constructor(...args){super(...args);window.metrics.frames.push(this);this.wasClosed=false;}close(){this.wasClosed=true;return super.close();}};}
      if(Encoder){window.VideoEncoder=class extends Encoder{constructor(options){super({...options,output:(chunk,metadata)=>{if(window.injectOutputLimit)options.output({byteLength:67108865},metadata);else if(window.injectTimestampFailure)options.output({byteLength:chunk.byteLength,timestamp:chunk.timestamp+33333},metadata);else options.output(chunk,metadata);}});window.metrics.encoders.push(this);}encode(...args){if(window.injectEncodeFailure)throw new Error('Injected encoder failure');const result=super.encode(...args);window.metrics.maximumQueue=Math.max(window.metrics.maximumQueue,this.encodeQueueSize);return result;}};}
      URL.createObjectURL=blob=>{const url=create(blob);window.metrics.urls.add(url);return url;};URL.revokeObjectURL=url=>{window.metrics.urls.delete(url);return revoke(url);};
      document.createElement=(tag,...args)=>{const node=element(tag,...args);if(tag==='canvas')window.metrics.canvases.push(node);return node;};
    },source);
    const support=await page.evaluate(()=>window.exportProbe.checkMP4Support({width:512,height:512}));report.support=support;
    if(!support.supported){report.checks.push('actual WebCodecs configuration unsupported, no export claimed');}
    else{
      for(const size of [512,1024]){
        const exported=await page.evaluate(async size=>{
          const progress=[];const p=window.exportProbe,result=await p.exportMP4(window.testMotion,{width:size,height:size},{onProgress:event=>progress.push(event)});
          window.lastExport=result;
          const bytes=new Uint8Array(await result.blob.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
          return {base64:btoa(binary),bytes:bytes.length,plan:result.plan,codec:result.codec,progress,resources:{openFrames:window.metrics.frames.filter(frame=>!frame.wasClosed).length,openEncoders:window.metrics.encoders.filter(encoder=>encoder.state!=='closed').length,urls:window.metrics.urls.size,canvases:window.metrics.canvases.filter(canvas=>canvas.width!==0).length,maximumQueue:window.metrics.maximumQueue}};
        },size);
        const filename=`${kind}-${size}.mp4`;await writeFile(new URL(filename,output),Buffer.from(exported.base64,'base64'));delete exported.base64;
        assert.equal(exported.plan.frameCount,114);assert.equal(exported.plan.durationMs,3800);
        assert.equal(exported.resources.openFrames,0);assert.equal(exported.resources.openEncoders,0);assert.equal(exported.resources.urls,0);assert.equal(exported.resources.canvases,0);assert.ok(exported.resources.maximumQueue<=4);
        assert.ok(exported.progress.some(progress=>progress.phase==='rendering'&&progress.completedFrames===114));
        const playback=await page.evaluate(async()=>{
          const {blob,plan}=window.lastExport,p=window.exportProbe;
          const url=URL.createObjectURL(blob),video=document.createElement('video');video.src=url;video.muted=true;video.playsInline=true;video.style.cssText='position:fixed;top:0;left:0;width:256px;height:256px;z-index:100';document.body.append(video);
          try{
            await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=()=>reject(new Error(video.error.message));});
            const metadata={duration:video.duration,width:video.videoWidth,height:video.videoHeight};
            await video.play();await new Promise(resolve=>{const start=performance.now();const poll=()=>{if(video.currentTime>0||performance.now()-start>5000)resolve();else setTimeout(poll,50);};poll();});video.pause();const played=video.currentTime>0;
            const fidelity=[];
            for(const index of [0,57,113]){
              const time=index/30;if(video.currentTime!==time){await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});}
              const actual=document.createElement('canvas');actual.width=plan.width;actual.height=plan.height;actual.getContext('2d').drawImage(video,0,0);
              const reference=document.createElement('canvas');reference.width=plan.width;reference.height=plan.height;
              const image=new Image(),referenceURL=URL.createObjectURL(new Blob([p.mp4FrameSVG(window.testMotion,plan,index)],{type:'image/svg+xml'}));
              try{image.src=referenceURL;await image.decode();reference.getContext('2d').drawImage(image,0,0);}finally{URL.revokeObjectURL(referenceURL);}
              const a=actual.getContext('2d').getImageData(0,0,plan.width,plan.height).data,b=reference.getContext('2d').getImageData(0,0,plan.width,plan.height).data;
              let squared=0,error=0,mask=0,foreground=0,alpha=true;
              for(let i=0;i<a.length;i+=4){alpha&&=a[i+3]===255;const foregroundPixel=Math.abs(b[i]-10)+Math.abs(b[i+1]-10)+Math.abs(b[i+2]-11)>40;for(let c=0;c<3;c++){const difference=Math.abs(a[i+c]-b[i+c]);squared+=difference*difference;error+=difference;if(foregroundPixel){foreground+=difference;mask++;}}}
              fidelity.push({index,meanAbsoluteError:error/(a.length/4*3),foregroundMAE:foreground/mask,psnr:10*Math.log10(255*255/(squared/(a.length/4*3))),opaque:alpha});
              actual.width=0;reference.width=0;
            }
            return {metadata,played,fidelity};
          }finally{video.pause();video.removeAttribute('src');video.load();video.remove();URL.revokeObjectURL(url);}
        });
        assert.equal(playback.metadata.width,size);assert.equal(playback.metadata.height,size);assert.ok(Math.abs(playback.metadata.duration-3.8)<1/30);assert.equal(playback.played,true);
        for(const frame of playback.fidelity){assert.ok(frame.opaque);assert.ok(frame.foregroundMAE<5,JSON.stringify(frame));assert.ok(frame.psnr>32,JSON.stringify(frame));}
        report.files.push({...exported,...playback,file:filename});
        // Compositor/decoder comparison canvases have been explicitly released.
      }
      report.checks.push('real 512/1024 MP4 creation, native playback and beginning/middle/end sampler fidelity');
      const faults=await page.evaluate(async()=>{
        const p=window.exportProbe;
        const code=async promise=>{try{await promise;return 'success';}catch(error){return error.code;}};
        const aborter=new AbortController();const pending=p.exportMP4(window.testMotion,{width:512,height:512},{signal:aborter.signal,onProgress:progress=>{if(progress.completedFrames===5)aborter.abort();}});
        const busy=await code(p.exportMP4(window.testMotion)),cancel=await code(pending);
        window.injectEncodeFailure=true;const failed=await code(p.exportMP4(window.testMotion,{width:512,height:512}));window.injectEncodeFailure=false;
        window.injectOutputLimit=true;const limit=await code(p.exportMP4(window.testMotion,{width:512,height:512}));window.injectOutputLimit=false;
        window.injectTimestampFailure=true;const timestamp=await code(p.exportMP4(window.testMotion,{width:512,height:512}));window.injectTimestampFailure=false;
        const decode=Image.prototype.decode;Image.prototype.decode=()=>Promise.reject(new Error('Injected raster failure'));
        const raster=await code(p.exportMP4(window.testMotion,{width:512,height:512}));Image.prototype.decode=decode;
        const original=window.VideoEncoder;window.VideoEncoder=undefined;const unsupported=await code(p.exportMP4(window.testMotion));window.VideoEncoder=original;
        const probe=original.isConfigSupported;original.isConfigSupported=async()=>({supported:false});const codecUnsupported=await code(p.exportMP4(window.testMotion));original.isConfigSupported=probe;
        const empty=p.compileMotionRecording(p.serializeRecording({agents:[{id:'atlas'}],events:[]}).json,{originMs:0}).motion;
        const result=await p.exportMP4(empty,{width:64,height:64},{onProgress:()=>{throw new Error('Observer failure');}});
        const max=await p.exportMP4(empty,{width:2048,height:2048});
        const boundary=p.compileMotionRecording(p.serializeRecording({agents:[{id:'atlas'}],events:[{version:1,agentId:'atlas',sequence:1,timestamp:28600,type:'task.started',taskId:'boundary'}]}).json,{originMs:0}).motion;
        const longest=await p.exportMP4(boundary,{width:64,height:64});
        window.extraExports=[result,max,longest];
        return {busy,cancel,failed,limit,timestamp,raster,unsupported,codecUnsupported,emptyFrames:result.plan.frameCount,emptyDuration:result.plan.durationMs,maxDimensions:[max.plan.width,max.plan.height],longestFrames:longest.plan.frameCount,longestDuration:longest.plan.durationMs,resources:{openFrames:window.metrics.frames.filter(frame=>!frame.wasClosed).length,openEncoders:window.metrics.encoders.filter(encoder=>encoder.state!=='closed').length,urls:window.metrics.urls.size,canvases:window.metrics.canvases.filter(canvas=>canvas.width!==0).length}};
      });
      assert.deepEqual({busy:faults.busy,cancel:faults.cancel,failed:faults.failed,limit:faults.limit,unsupported:faults.unsupported},{busy:'busy',cancel:'cancelled',failed:'encode-failed',limit:'output-limit',unsupported:'unsupported'});
      assert.equal(faults.timestamp,'encode-failed');
      assert.equal(faults.raster,'render-failed');
      assert.equal(faults.codecUnsupported,'unsupported');
      assert.equal(faults.emptyFrames,30);assert.equal(faults.emptyDuration,1000);assert.deepEqual(faults.maxDimensions,[2048,2048]);assert.deepEqual(faults.resources,{openFrames:0,openEncoders:0,urls:0,canvases:0});report.faults=faults;
      assert.equal(faults.longestFrames,900);assert.equal(faults.longestDuration,30000);
      console.log('CHECK',kind,'900-frame boundary and fault/cleanup cases passed');
      for(let index=0;index<3;index++){const value=await page.evaluate(async index=>{const bytes=new Uint8Array(await window.extraExports[index].blob.arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);},index);await writeFile(new URL(`${kind}-${['64-empty','2048-empty','64-boundary'][index]}.mp4`,output),Buffer.from(value,'base64'));}
      report.checks.push('concurrency, mid-export cancellation, injected encoder/output-limit failures, unsupported API, empty/min/max exports and cleanup');
    }
    await page.goto(base+'/studio');await page.getByRole('button',{name:'Motion',exact:true}).click();
    const exportButton=page.getByRole('button',{name:'Export MP4',exact:true});await exportButton.waitFor();
    if(support.supported){
      await page.evaluate(()=>{
        const metrics=window.studioResources={encoders:[],frames:[],urls:new Set()},Encoder=window.VideoEncoder,Frame=window.VideoFrame,create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
        window.VideoEncoder=class extends Encoder{constructor(options){super(options);metrics.encoders.push(this);}};
        window.VideoFrame=class extends Frame{constructor(...args){super(...args);this.wasClosed=false;metrics.frames.push(this);}close(){this.wasClosed=true;super.close();}};
        URL.createObjectURL=blob=>{const url=create(blob);metrics.urls.add(url);return url;};URL.revokeObjectURL=url=>{metrics.urls.delete(url);revoke(url);};
      });
      await page.getByRole('combobox',{name:'MP4 preset'}).selectOption('512');await exportButton.click();
      await page.getByRole('link',{name:'Download MP4 ↗',exact:true}).waitFor({timeout:60000}).catch(async error=>{console.error(kind,await page.locator('.studio-mp4').innerText(),report.errors);throw error;});
      const downloadPromise=page.waitForEvent('download');await page.getByRole('link',{name:'Download MP4 ↗',exact:true}).click();const download=await downloadPromise;await download.saveAs(new URL(`${kind}-studio.mp4`,output).pathname);
      assert.match(await page.locator('footer').innerText(),/v0\.3\.0/);
      await page.getByRole('spinbutton',{name:'Motion timestamp',exact:true}).fill('2400');
      await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
      if(kind==='chrome')await page.screenshot({path:new URL('studio-mp4-desktop.png',assets).pathname,fullPage:true});
      await exportButton.click();await page.getByRole('button',{name:'Cancel export',exact:true}).click();await page.getByText('MP4 export cancelled.',{exact:true}).waitFor();
      await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(button=>button.textContent==='Play motion'&&button.disabled));
      assert.ok(await page.getByRole('button',{name:'Play motion',exact:true}).isDisabled());
      await exportButton.tap();await page.getByRole('link',{name:'Download MP4 ↗',exact:true}).waitFor({timeout:60000});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);});
      if(kind==='chrome')await page.screenshot({path:new URL('studio-mp4-mobile.png',assets).pathname,fullPage:true});
      await page.setViewportSize({width:320,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.getByRole('button',{name:'Activity',exact:true}).click();
      await page.waitForFunction(()=>window.studioResources.urls.size===0);
      await page.getByRole('button',{name:'Motion',exact:true}).click();await exportButton.click();await page.getByRole('button',{name:'Cancel export',exact:true}).waitFor();
      await page.getByRole('button',{name:'Activity',exact:true}).click();
      await page.waitForFunction(()=>window.studioResources.encoders.every(encoder=>encoder.state==='closed')&&window.studioResources.frames.every(frame=>frame.wasClosed)&&window.studioResources.urls.size===0);
      report.checks.push('React unmount aborts active export and revokes completed download URLs');
      report.checks.push('desktop/mobile explicit export, genuine download, cancel, reduced-motion manual action and updated footer');
    }
    const unavailable=await browser.newPage();await unavailable.addInitScript(()=>{window.VideoEncoder=undefined;});await unavailable.goto(base+'/studio');await unavailable.getByRole('button',{name:'Motion',exact:true}).click();
    await unavailable.getByText(/does not provide WebCodecs H.264 video export/).waitFor();assert.ok(await unavailable.getByRole('button',{name:'Export MP4',exact:true}).isDisabled());await unavailable.close();
    report.checks.push('unsupported browser message disables export gracefully');
    assert.deepEqual(report.errors,[]);console.log('PASS',kind,JSON.stringify(report.files.map(file=>({file:file.file,bytes:file.bytes,frames:file.plan.frameCount,metadata:file.metadata,fidelity:file.fidelity})),null,2));
  }finally{await browser.close();}
}
if(reports.some(report=>report.engine==='chrome'&&report.support.supported))await copyFile(new URL('chrome-512.mp4',output),new URL('motion-export-demo.mp4',assets));
await writeFile(new URL('browser-report.json',output),JSON.stringify(reports,null,2));
