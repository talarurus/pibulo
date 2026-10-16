import React,{useEffect,useMemo,useState,useRef} from 'react';
import {BlobatarFace} from './BlobatarFace.jsx';
export const Face=BlobatarFace;
export function Copy({text,label='Copy code',compact=false}){
  const [feedback,setFeedback]=useState('');
  useEffect(()=>{if(feedback){const t=setTimeout(()=>setFeedback(''),2400);return()=>clearTimeout(t)}},[feedback]);
  async function copy(){try{await navigator.clipboard.writeText(text);setFeedback('Copied')}catch{setFeedback('Select and copy the text below')}}
  return <span className="copy-wrap"><button type="button" className="copy" aria-label={label} title={label} onClick={copy}>{feedback==='Copied'?'✓':compact?'⧉':'Copy'}</button><span role="status" className="copy-feedback">{feedback}</span></span>;
}
export function Code({text,label='Copy code',title}){
  return <div className="code-box"><div className="code-toolbar">{title&&<div className="code-title">{title}</div>}<Copy text={text} label={label} compact/></div><pre tabIndex={0} aria-label={title||label.replace(/^Copy /,'')}><code>{text.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:import|from|const|export|return)\b)/g).map((t,i)=><span key={i} className={/^["']/.test(t)?'syntax-string':/^(import|from|const|export|return)$/.test(t)?'syntax-key':undefined}>{t}</span>)}</code></pre></div>;
}
export function Segmented({options,value,onChange,label}){return <div className="segmented" role="group" aria-label={label}>{options.map(item=>{const [v,title]=Array.isArray(item)?item:[item,item];return <button key={v} type="button" aria-pressed={value===v} onClick={()=>onChange(v)}>{title}</button>})}</div>}
export function Install(){return <div className="install"><span className="micro setup-label">Run locally</span><Code text={"npm ci\nnpm start"} label="Copy local setup command"/><p className="micro">From the pibulo source checkout. <a href="/docs#quick-start">Local setup</a></p></div>}
export function PageIntro({eyebrow,title,children}){return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{children}</p></div>}
