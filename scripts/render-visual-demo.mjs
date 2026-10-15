// Reproducible media composition around the existing public recording sampler.
// No avatar paths or identities are authored here. Run after npm run build.
import {buildSync} from 'esbuild';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const output='assets',frames='test-results/visual-demo-frames';
await mkdir(frames,{recursive:true});
const harness=buildSync({stdin:{contents:`import {demoMotion,demoRecording,demoDuration} from './website/preview/src/demo-recording.ts';import {Muxer,ArrayBufferTarget} from 'mp4-muxer';window.demo={motion:demoMotion,recording:demoRecording,duration:demoDuration,Muxer,ArrayBufferTarget};`,resolveDir:process.cwd()},bundle:true,platform:'browser',format:'iife',write:false}).outputFiles[0].text;
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:768,height:432}});
await page.goto((process.env.PREVIEW_URL||'http://127.0.0.1:4318')+'/THIRD-PARTY-NOTICES.txt');
await page.setContent('<html><body style="margin:0;background:#0a0a0b"></body></html>');await page.addScriptTag({content:harness});
await page.exposeFunction('saveFrame',async(index,data)=>writeFile(`${frames}/${String(index).padStart(3,'0')}.png`,Buffer.from(data.split(',')[1],'base64')));
const result=await page.evaluate(async()=>{
 const {motion,recording,duration,Muxer,ArrayBufferTarget}=window.demo;
 const width=768,height=432,fps=30,count=Math.ceil(duration*fps/1000);
 const target=new ArrayBufferTarget(),muxer=new Muxer({target,video:{codec:'avc',width,height},fastStart:'in-memory'});
 let error;const encoder=new VideoEncoder({output:(chunk,meta)=>muxer.addVideoChunk(chunk,meta),error:e=>{error=e;}});
 const config={codec:'avc1.42001f',width,height,bitrate:1800000,framerate:fps};
 if(!(await VideoEncoder.isConfigSupported(config)).supported)throw Error('H.264 unavailable');encoder.configure(config);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;document.body.append(canvas);const ctx=canvas.getContext('2d');
 const labels=['Idle','Thinking','Working','Completed'];
 function frameSVG(time){
  const samples=motion.sampleAll(time);const phase=labels.map(x=>x.toLowerCase()).indexOf(samples[0].snapshot.state);
  const avatars=samples.map((sample,i)=>{
   const x=24+i*244,avatar=motion.svgFor(sample.agentId??sample.snapshot.id,time,{size:190,decorative:true}).replace('<svg ',`<svg x="${x+25}" y="108" `);
   return `<rect x="${x}" y="106" width="232" height="236" rx="13" fill="#141416" stroke="#34343b"/>${avatar}<text x="${x+116}" y="302" text-anchor="middle" font-size="17" fill="#fafaf8">${sample.snapshot.name}</text><text x="${x+116}" y="325" text-anchor="middle" font-size="13" fill="#bbc6b5">${labels[phase]}</text>`;
  }).join('');
  const steps=labels.map((label,i)=>`<rect x="${24+i*183}" y="362" width="171" height="39" rx="7" fill="${phase===i?'#d1dfc9':'#141416'}" stroke="${phase===i?'#d1dfc9':'#34343b'}"/><text x="${38+i*183}" y="387" font-size="13" fill="${phase===i?'#182315':'#b3b3bd'}">0${i+1}  ${label}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="432"><rect width="768" height="432" fill="#0a0a0b"/><g font-family="Arial,sans-serif"><text x="24" y="46" font-size="29" font-weight="600" fill="#fafaf8">whoami</text><text x="744" y="43" text-anchor="end" font-size="11" letter-spacing="1.5" fill="#b8c4b2">RECORDED AGENT ACTIVITY</text><text x="24" y="78" font-size="17" fill="#a7a7b1">One identity. From thought to done.</text>${avatars}${steps}<rect x="24" y="414" width="720" height="2" rx="1" fill="#2b2b31"/><rect x="24" y="414" width="${720*Math.min(1,time/duration)}" height="2" rx="1" fill="#a9bd9d"/></g></svg>`;
 }
 try{for(let i=0;i<count;i++){
  if(error)throw error;
  const url=URL.createObjectURL(new Blob([frameSVG(i*1000/fps)],{type:'image/svg+xml'}));
  try{const image=new Image();image.src=url;await image.decode();ctx.drawImage(image,0,0);}finally{URL.revokeObjectURL(url);}
  if(i%2===0)await window.saveFrame(i/2,canvas.toDataURL('image/png'));
  const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1000000/fps),duration:Math.round((i+1)*1000000/fps)-Math.round(i*1000000/fps)});
  try{encoder.encode(frame,{keyFrame:i%60===0});}finally{frame.close();}
  if(encoder.encodeQueueSize>4)await encoder.flush();
 }
 await encoder.flush();muxer.finalize();
 const bytes=new Uint8Array(target.buffer);let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
 window.demoVideo=new Blob([target.buffer],{type:'video/mp4'});
 return {base64:btoa(binary),recording,durationMs:count*1000/fps,width,height,frameCount:count,gifFrameCount:Math.ceil(count/2)};
 }finally{encoder.close();}
});
await writeFile(`${output}/whoami-activity-demo.mp4`,Buffer.from(result.base64,'base64'));delete result.base64;
await writeFile(`${output}/whoami-activity-demo.recording.json`,result.recording);delete result.recording;
const playback=await page.evaluate(async()=>{
 const video=document.createElement('video');video.src=URL.createObjectURL(window.demoVideo);video.muted=true;video.playsInline=true;document.body.replaceChildren(video);
 await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});
 await video.play();await new Promise(r=>setTimeout(r,300));video.pause();
 const meta={width:video.videoWidth,height:video.videoHeight,duration:video.duration,played:video.currentTime>0};
 await new Promise(r=>{video.onseeked=r;video.currentTime=3.1;});return meta;
});
await page.screenshot({path:`${frames}/mp4-decoded.png`});await browser.close();
if(!playback.played||playback.width!==768||Math.abs(playback.duration-result.durationMs/1000)>.04)throw Error('MP4 playback mismatch');
await writeFile(`${output}/visual-parity-v0.3.1/demo.json`,JSON.stringify({...result,playback},null,2));console.log({...result,playback});
