import React, {useEffect, useRef, useState} from 'react';
import type {CompiledMotion} from '@talarurus/whoami/motion';
import {checkMP4Support, createMP4Plan, exportMP4, MP4ExportError, type MP4Progress} from '@talarurus/whoami/export/mp4';

export default function MotionMP4Export({motion,reducedMotion}:{motion:CompiledMotion;reducedMotion:boolean}) {
  const [size,setSize]=useState(1024), [support,setSupport]=useState<string|null>(null), [checking,setChecking]=useState(true);
  const [busy,setBusy]=useState(false), [progress,setProgress]=useState<MP4Progress|null>(null), [notice,setNotice]=useState('');
  const [download,setDownload]=useState<{url:string;bytes:number;durationMs:number;width:number;height:number}|null>(null);
  const controller=useRef<AbortController|null>(null), token=useRef(0), url=useRef<string|null>(null);
  const options={width:size,height:size,background:'#0a0a0b',reducedMotion};
  let planError='';
  try{createMP4Plan(motion,options);}catch(error){planError=error instanceof Error?error.message:'This recording cannot be exported.';}
  useEffect(()=>{
    let active=true;setChecking(true);setSupport(null);
    void checkMP4Support({width:size,height:size}).then(result=>{if(active){setSupport(result.supported?null:result.reason);setChecking(false);}},()=>{if(active){setSupport('Video export capabilities could not be checked.');setChecking(false);}});
    return()=>{active=false;};
  },[size]);
  useEffect(()=>{
    token.current++;controller.current?.abort();controller.current=null;setBusy(false);setProgress(null);setNotice('');setDownload(null);
    if(url.current){URL.revokeObjectURL(url.current);url.current=null;}
    return()=>{token.current++;controller.current?.abort();if(url.current){URL.revokeObjectURL(url.current);url.current=null;}};
  },[motion]);
  async function start() {
    if(controller.current||checking||support||planError)return;
    const mine=++token.current, aborter=new AbortController();controller.current=aborter;
    setBusy(true);setNotice('');setProgress(null);setDownload(null);
    if(url.current){URL.revokeObjectURL(url.current);url.current=null;}
    try {
      const result=await exportMP4(motion,options,{signal:aborter.signal,onProgress:value=>{if(token.current===mine)setProgress(value);}});
      if(token.current!==mine)return;
      url.current=URL.createObjectURL(result.blob);setDownload({url:url.current,bytes:result.blob.size,durationMs:result.plan.durationMs,width:result.plan.width,height:result.plan.height});setNotice('MP4 ready. Download it below.');
    }catch(error){if(token.current===mine)setNotice(error instanceof MP4ExportError?error.message:'Video export failed. Try the compact preset.');}
    finally{if(token.current===mine){controller.current=null;setBusy(false);}}
  }
  const percentage=progress?Math.round(progress.completedFrames/progress.totalFrames*100):0;
  return <section className="studio-mp4" aria-label="MP4 export">
    <div className="studio-mp4-heading"><div><h3>Keep it in motion.</h3><p>All agents · 30 fps · opaque background · up to 30 seconds.</p></div><div className="studio-mp4-actions"><label>Video size <select aria-label="MP4 preset" value={size} disabled={busy} onChange={event=>setSize(Number(event.target.value))}><option value={512}>Compact · 512 px</option><option value={1024}>Standard · 1024 px</option></select></label><button type="button" className="studio-primary" onClick={()=>void start()} disabled={busy||checking||!!support||!!planError}>Export MP4</button>{busy&&<button type="button" onClick={()=>{controller.current?.abort();setNotice('Cancelling export…');}}>Cancel export</button>}</div></div>
    <p className="studio-mp4-privacy">Caller-supplied labels and task information may appear in exported media. Review before sharing.</p>
    {checking&&<p role="status">Checking H.264 export support…</p>}
    {(support||planError)&&<p role="status">{planError||support}</p>}
    {busy&&<div className="studio-mp4-progress"><progress aria-label="MP4 export progress" max={100} value={percentage}/><span role="status">{progress?.phase==='finalizing'?'Finishing MP4':`Rendering ${progress?.completedFrames??0} / ${progress?.totalFrames??0} frames`} · {percentage}%</span></div>}
    {notice&&<p role="status" className="studio-mp4-notice">{notice}</p>}
    {download&&<div className="studio-mp4-download"><a href={download.url} download="whoami-motion.mp4">Download MP4 ↗</a><span>{download.width} × {download.height} · {(download.durationMs/1000).toFixed(2)} s · {(download.bytes/1048576).toFixed(2)} MiB</span></div>}
  </section>;
}
