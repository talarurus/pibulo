/*! Adapted from Blobatar apps/site/src/components/editor/crowd.tsx, Copyright (c) 2026 Alain, MIT. */
import React from 'react';
import {Face} from '../components/ui.jsx';
export const NAMES=['atlas','mira','juniper','nova','orbit','cedar','lyra','sage','fern','pixel','echo','rune','tove','elena','emeka','kasper','sora','dara','lumi','cleo','robin','arlo','ren','tala','milo','astrid','sol','wren','zola'];
const offset=name=>{let h=2166136261;for(let i=0;i<name.length;i++)h=Math.imul(h^name.charCodeAt(i),16777619);return(h>>>0)%NAMES.length};
export const crowd=name=>Array.from({length:8},(_,i)=>NAMES[(offset(name)+i*17)%NAMES.length]).filter(n=>n!==name).slice(0,7);
export function Crowd({config,onPick}){return <div className="crowd"><span className="micro">Other names, same configuration</span><div>{crowd(config.name).map(name=><button type="button" key={name} title={name} aria-label={'Preview '+name} onClick={()=>onPick(name)}><Face name={name} config={config} size={44}/></button>)}</div></div>}
