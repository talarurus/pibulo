import type {CompiledMotion} from './motion.js';
import {createMP4Plan, mp4FrameSVG, mp4FrameTiming, MP4ExportError, MP4_LIMITS, type MP4Options, type MP4Plan} from './mp4-plan.js';
import {MP4Buffer} from './mp4-buffer.js';
export {createMP4Plan, mp4FrameSVG, mp4FrameTiming, MP4ExportError, MP4_LIMITS};
export type {MP4Options, MP4Plan, MP4ErrorCode} from './mp4-plan.js';
export interface MP4Progress {readonly phase:'checking'|'rendering'|'finalizing'; readonly completedFrames:number; readonly totalFrames:number}
export interface MP4ExportControls {readonly signal?:AbortSignal; readonly onProgress?:(progress:MP4Progress)=>void}
export interface MP4ExportResult {readonly blob:Blob; readonly plan:MP4Plan; readonly codec:string; readonly encodedBytes:number}
/** Structural configuration keeps consumers independent of WebCodecs type packages. */
export interface MP4EncoderConfig {readonly codec:string;readonly width:number;readonly height:number;readonly framerate:30;readonly bitrate:number;readonly latencyMode:'realtime';readonly avc:{readonly format:'avc'};readonly alpha:'discard'}
export type MP4Support = {readonly supported:true; readonly config:MP4EncoderConfig} | {readonly supported:false; readonly reason:string};
let exporting = false;
const cancelled = () => new MP4ExportError('cancelled','MP4 export cancelled.');
function abort(signal?:AbortSignal) {if (signal?.aborted) throw cancelled();}
function wait<T>(promise:Promise<T>, signal:AbortSignal|undefined, timeout=15000):Promise<T> {
  abort(signal);
  return new Promise((resolve,reject) => {
    const onAbort=()=>finish(()=>reject(cancelled()));
    const timer=setTimeout(()=>finish(()=>reject(new MP4ExportError('timeout','The browser stopped responding during export. Try a smaller preset.'))),timeout);
    const finish=(callback:()=>void)=>{clearTimeout(timer);signal?.removeEventListener('abort',onAbort);callback();};
    signal?.addEventListener('abort',onAbort,{once:true});
    promise.then(value=>finish(()=>resolve(value)),error=>finish(()=>reject(error)));
  });
}
/** Probe the actual AVC configuration. Does not import the muxer or open encoders. */
export async function checkMP4Support(options: Pick<MP4Options,'width'|'height'> = {}):Promise<MP4Support> {
  const {width=1024,height=1024}=options;
  if (![width,height].every(value=>Number.isInteger(value)&&value>=64&&value<=2048&&value%2===0)) return {supported:false,reason:'Choose even dimensions from 64 to 2048.'};
  if (typeof document==='undefined' || typeof VideoEncoder==='undefined' || typeof VideoFrame==='undefined' || typeof VideoEncoder.isConfigSupported!=='function')
    return {supported:false,reason:'This environment does not provide WebCodecs H.264 video export. Use a supported browser in a secure context.'};
  // Levels selected for the full pixel rate; no browser-name or hardware assumption.
  const macroblocks=Math.ceil(width/16)*Math.ceil(height/16);
  const level=macroblocks>8192||macroblocks*30>245760?'33':'28';
  for (const profile of ['4200','4d00','6400']) {
    const config:MP4EncoderConfig={codec:`avc1.${profile}${level}`,width,height,framerate:30,bitrate:Math.min(24000000,Math.max(2000000,width*height*12)),latencyMode:'realtime',avc:{format:'avc'},alpha:'discard'};
    try {const support=await wait(VideoEncoder.isConfigSupported(config),undefined,5000);if(support.supported)return {supported:true,config:Object.freeze(config)};} catch { /* Try the next compatible AVC profile. */ }
  }
  return {supported:false,reason:'The browser cannot encode H.264 at this resolution. Try 512 px or another WebCodecs-capable browser.'};
}
/** Fixed-timestamp offline export. One export per module instance; at most four
 * submitted frames between flushes. No rAF, MediaRecorder or live DOM capture.
 */
export async function exportMP4(motion:CompiledMotion, options:MP4Options={}, controls:MP4ExportControls={}):Promise<MP4ExportResult> {
  if (exporting) throw new MP4ExportError('busy','An MP4 export is already running. Cancel it or wait for completion.');
  const plan=createMP4Plan(motion,options); abort(controls.signal); exporting=true;
  const buffer=new MP4Buffer();
  let muxer:import('mp4-muxer').Muxer<import('mp4-muxer').StreamTarget>|undefined;
  let encoder:VideoEncoder|undefined, canvas:HTMLCanvasElement|undefined, failure:unknown, encodedBytes=0, outputFrames=0, finished=false;
  const progress=(phase:MP4Progress['phase'],completedFrames:number)=>{try{controls.onProgress?.(Object.freeze({phase,completedFrames,totalFrames:plan.frameCount}));}catch{/* Observers cannot corrupt an export. */}};
  try {
    progress('checking',0);
    const support=await wait(checkMP4Support(plan),controls.signal); abort(controls.signal);
    if(!support.supported)throw new MP4ExportError('unsupported',support.reason);
    const {Muxer,StreamTarget}=await wait(import('mp4-muxer'),controls.signal); abort(controls.signal);
    muxer=new Muxer({target:new StreamTarget({onData:(data,position)=>buffer.write(data,position),chunked:false}),
      video:{codec:'avc',width:plan.width,height:plan.height,frameRate:30},fastStart:{expectedVideoChunks:plan.frameCount},firstTimestampBehavior:'strict'});
    encoder=new VideoEncoder({output:(chunk,metadata)=>{
      if(finished||failure||!muxer)return;
      try {
        encodedBytes+=chunk.byteLength;
        if(encodedBytes>MP4_LIMITS.maxBytes)throw new MP4ExportError('output-limit','Video exceeds the 64 MiB output limit.');
        const timing=mp4FrameTiming(plan,outputFrames);
        // WebKit's native encoder can truncate a microsecond during rational
        // timestamp conversion (observed 4033332 for submitted 4033333). A
        // one-microsecond tolerance still uniquely identifies each 30 fps frame.
        // The muxer receives the original contract timestamp, never that jitter.
        if(Math.abs(chunk.timestamp-timing.timestampUs)>1)throw new MP4ExportError('encode-failed',`Encoder returned frame ${outputFrames} at ${chunk.timestamp} µs; expected ${timing.timestampUs} µs.`);
        // Supply contract duration explicitly, even if an implementation omits it.
        const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);
        muxer.addVideoChunkRaw(data,chunk.type,timing.timestampUs,timing.durationUs,metadata);outputFrames++;
      }catch(error){failure=error;}
    },error:error=>{failure=error;}});
    encoder.configure(support.config);
    canvas=document.createElement('canvas');canvas.width=plan.width;canvas.height=plan.height;
    const context=canvas.getContext('2d',{alpha:false});
    if(!context)throw new MP4ExportError('render-failed','The browser could not create a video canvas.');
    for(let index=0;index<plan.frameCount;index++) {
      abort(controls.signal);if(failure)throw failure;
      const markup=mp4FrameSVG(motion,plan,index), url=URL.createObjectURL(new Blob([markup],{type:'image/svg+xml'})), image=new Image();
      try {
        image.src=url;await wait(image.decode(),controls.signal);abort(controls.signal);
        context.fillStyle=plan.background;context.fillRect(0,0,plan.width,plan.height);context.drawImage(image,0,0,plan.width,plan.height);
      }catch(error){if(error instanceof MP4ExportError)throw error;throw new MP4ExportError('render-failed','The browser could not rasterize the sampled avatar frame.');}
      finally{image.removeAttribute('src');URL.revokeObjectURL(url);}
      const timing=mp4FrameTiming(plan,index), frame=new VideoFrame(canvas,{timestamp:timing.timestampUs,duration:timing.durationUs});
      try{encoder.encode(frame,{keyFrame:index%30===0});}finally{frame.close();}
      if((index+1)%4===0||index+1===plan.frameCount) {await wait(encoder.flush(),controls.signal);if(failure)throw failure;}
      progress('rendering',index+1);
    }
    abort(controls.signal);if(outputFrames!==plan.frameCount)throw new MP4ExportError('encode-failed','Encoder did not return every sampled frame.');
    progress('finalizing',plan.frameCount);abort(controls.signal);muxer.finalize();abort(controls.signal);
    const blob=buffer.blob();
    if(!blob.size)throw new MP4ExportError('encode-failed','The muxer produced an empty file.');
    return Object.freeze({blob,plan,codec:support.config.codec,encodedBytes});
  } catch(error) {
    if(controls.signal?.aborted)throw cancelled();
    if(error instanceof MP4ExportError)throw error;
    throw new MP4ExportError('encode-failed',`MP4 encoding failed: ${error instanceof Error?error.message:'unknown encoder failure'}`);
  } finally {
    finished=true;
    try {if(encoder&&encoder.state!=='closed')encoder.close();}
    finally {muxer=undefined;if(canvas){canvas.width=0;canvas.height=0;}buffer.clear();exporting=false;}
  }
}
