/*! Animated SVG branch adapted from Blobatar src/react.tsx and useGaze. Copyright (c) 2026 Alain, MIT. Full notice: ../../vendor/blobatar/LICENSE. */
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useGaze} from '../../vendor/blobatar/useGaze.ts';
import {DEFAULTS,configFor,animatedParts,svgFor,labelFor,statusFor} from '../adapter.mjs';
export function BlobatarFace({name='atlas',config=DEFAULTS,size=64,motion='off',pointerGaze=false,target,label,decorative=true,travel=3.8}){
  const [mounted,setMounted]=useState(false),[svg,setSvg]=useState(null),[visible,setVisible]=useState(true),[hidden,setHidden]=useState(false),host=useRef(null);
  const result=useMemo(()=>{try{const c=configFor(config,name);return{config:c,status:statusFor(c),svg:svgFor(c,size,{decorative,label:label||labelFor(name)})}}catch(e){return{error:e.message}}},[name,JSON.stringify(config),size,label,decorative]);
  const inline=motion!=='off'||pointerGaze||target!==undefined;
  const parts=useMemo(()=>result.error?null:animatedParts(result.config,size,motion),[result,motion,size]);
  const html=useMemo(()=>({__html:parts?.inner||''}),[parts?.inner]);
  const staticHtml=useMemo(()=>({__html:result.svg||''}),[result.svg]);
  const {ref,lookAt,remeasure}=useGaze({travel,settle:145,snap:10,lookAt:(!visible||hidden)?'rest':target!==undefined?target:pointerGaze?'pointer':null});
  useEffect(()=>{setMounted(true);const hide=()=>setHidden(document.hidden);hide();document.addEventListener('visibilitychange',hide);const observer=new IntersectionObserver(entries=>setVisible(entries.some(e=>e.isIntersecting)));if(host.current)observer.observe(host.current);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide)}},[]);
  useEffect(()=>{ref(mounted&&inline&&visible&&!hidden?svg:null);return()=>ref(null)},[ref,svg,mounted,inline,visible,hidden]);
  useEffect(()=>{remeasure()},[parts?.inner,remeasure]);
  useEffect(()=>{const rest=()=>lookAt('rest'),resume=()=>lookAt(target!==undefined?target:pointerGaze?'pointer':null);window.addEventListener('blur',rest);window.addEventListener('focus',resume);return()=>{window.removeEventListener('blur',rest);window.removeEventListener('focus',resume)}},[lookAt,pointerGaze,target]);
  if(result.error)return <span role="alert" className="error">{result.error}</span>;
  const stopped=motion==='off'||!visible||hidden;
  return <span ref={host} className={'avatar preview-face'+(stopped?' preview-no-idle':'')} data-avatar-renderer="blobatar" data-avatar-seed={name} style={{display:'inline-flex',alignItems:'center',gap:8}}>
    {mounted&&inline?<svg ref={setSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} role={decorative?undefined:'img'} aria-hidden={decorative?true:undefined} aria-label={decorative?undefined:label||labelFor(name)} style={parts.vars}>{!decorative&&<title>{label||labelFor(name)}</title>}{parts.bg&&<path d={parts.bg.d} fill={parts.bg.fill}/>}<g className={parts.cls} dangerouslySetInnerHTML={html}/></svg>:<span role={decorative?undefined:'img'} aria-label={decorative?undefined:label||labelFor(name)} aria-hidden={decorative?true:undefined} dangerouslySetInnerHTML={staticHtml}/>}
    {result.status&&<span className="avatar-status" aria-hidden={decorative?true:undefined}>{result.status}</span>}
  </span>;
}
