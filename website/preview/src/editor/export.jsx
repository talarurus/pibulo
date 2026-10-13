/*! Browser export utilities adapted from Blobatar apps/site/src/components/editor/export.tsx, Copyright (c) 2026 Alain, MIT. */
import {BRAND} from '../brand.mjs';
import React,{useState} from 'react';
import {svgFor} from '../adapter.mjs';
const PNG_SIZE=512;
const svgBlob=svg=>new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
function save(blob,as){const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=as;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function filename(name){const safe=name.trim().normalize('NFC').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'-').replace(/\s+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);return safe?BRAND.slug+'-'+safe:BRAND.slug}
function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Could not load SVG'));image.src=src})}
function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not encode PNG')),'image/png'))}
export function ExportMenu({config}){const [notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
  function svg(){try{save(svgBlob(svgFor(config,512)),filename(config.name)+'.svg');setNotice('SVG downloaded')}catch{setNotice('Could not export. Check the configuration.')}}
  async function png(){let url;setBusy(true);try{url=URL.createObjectURL(svgBlob(svgFor(config,PNG_SIZE)));const image=await loadImage(url),canvas=document.createElement('canvas');canvas.width=PNG_SIZE;canvas.height=PNG_SIZE;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No canvas');ctx.drawImage(image,0,0,PNG_SIZE,PNG_SIZE);save(await canvasBlob(canvas),filename(config.name)+'.png');setNotice('PNG downloaded')}catch{setNotice('PNG export failed. Try the SVG export.')}finally{if(url)URL.revokeObjectURL(url);setBusy(false)}}
  return <details className="export-menu"><summary>↓ Export</summary><div className="export-panel"><button type="button" onClick={svg}>SVG <small>Vector, scales to any size</small></button><button type="button" disabled={busy} onClick={png}>{busy?'Encoding…':'PNG'} <small>512 × 512, transparent unless backdrop set</small></button><p className="micro">Same geometry and chosen pose as the preview. Motion and live gaze are preview-only.</p><p className="micro" role="status">{notice}</p></div></details>
}
