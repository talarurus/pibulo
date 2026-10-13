/*! Home layout and click reaction adapted from Blobatar apps/site/src/components/Hero.tsx at a7fd546. Copyright (c) 2026 Alain, MIT. */
import {BRAND} from './brand.mjs';
import React,{useEffect,useRef,useState} from 'react';
import {Face,Code,Install,Segmented} from './components/ui.jsx';
import {GroupChat} from './components/compositions.jsx';
import {Wall} from './Wall.jsx';
import {DEFAULTS,EXPRESSIONS,shareHash} from './adapter.mjs';
import {heroSnippet} from './editor/snippet.mjs';
import {NAMES} from './editor/crowd.jsx';
const HOLD=1500;
export function Home(){
  const [name,setName]=useState('atlas'),[expression,setExpression]=useState('idle'),[api,setApi]=useState('react'),[burst,setBurst]=useState(null),release=useRef(null);
  useEffect(()=>()=>clearTimeout(release.current),[]);
  const shown=burst??expression;
  const config={...DEFAULTS,name,expression,motion:'always',pointerGaze:true};
  function react(){const pool=EXPRESSIONS.filter(p=>p!==shown&&p!=='idle');setBurst(pool[Math.floor(Math.random()*pool.length)]);clearTimeout(release.current);release.current=setTimeout(()=>setBurst(null),HOLD)}
  function pick(value){clearTimeout(release.current);setBurst(null);setExpression(value)}
  function shuffle(){const pool=NAMES.filter(n=>n!==name);setName(pool[Math.floor(Math.random()*pool.length)])}
  const example=heroSnippet(api,config);
  return <><section className="home-hero"><div className="home-identity"><h1>{BRAND.wordmark}</h1><p>Deterministic avatars for AI agents.<br/>A familiar face, from any name.</p><div className="home-name"><label htmlFor="hero-name">Name or seed</label><div className="hero-seed-control"><input id="hero-name" maxLength={256} value={name} placeholder="Try any name" aria-describedby="hero-name-hint" onChange={e=>setName(e.target.value)}/><button type="button" aria-label="Shuffle name" onClick={shuffle}>Shuffle</button></div></div><p className="micro" id="hero-name-hint">Type a name to generate a face.</p><button type="button" className="home-face" id="hero-avatar" onClick={react} aria-label={`Make ${name||'the empty-seed avatar'} react`} aria-describedby="hero-reaction-hint" data-expression={shown} data-base-expression={expression}><Face name={name} config={{...config,expression:shown}} size={300} motion="always" pointerGaze decorative={false}/></button><span className="micro" id="hero-reaction-hint">Click for a little reaction.</span><details className="hero-expressions"><summary>Expression · {expression}</summary><div className="expression-chips" role="group" aria-label="Hero expression">{EXPRESSIONS.map(e=><button type="button" key={e} aria-pressed={expression===e} onClick={()=>pick(e)}>{e}</button>)}</div></details></div><div className="hero-developer"><Install/><div className="snippet-heading"><span className="micro">your config</span><Segmented label="Homepage code API" options={['react','core']} value={api} onChange={setApi}/></div><Code text={example} label="Copy hero example"/><p className="micro">Examples from this checkout · <a href="/docs#installation">Usage notes</a></p><a className="text-link" href={'/editor'+shareHash(config)}>Tune every trait in the editor</a><div className="companion-entry"><a href="/agent-scenes">Explore agent scenes</a><p className="micro">An optional AI-agent companion, shown in six manual demo states.</p></div></div></section><Wall/><section className="identity-section"><div><h2>Everyone gets a face.</h2><p>One stable seed per agent. The face you learn in a conversation is the one you recognize in the sidebar.</p><a className="text-link" href="/components">See it in an interface</a></div><GroupChat channel="little-team" messages={[{name:'atlas',time:'09:41',text:'I’ve got the plan. Mira, want to take a look?'},{name:'mira',time:'09:42',text:'On it. Same team, a new idea.'},{name:'mira',time:'09:42',text:'And a face I can recognize in every thread.'},{name:'nova',time:'09:43',text:'Ready when you are. 🌱'}]}/></section><section className="facts">{[['10','silhouettes'],['14','expressions'],['SVG','vector exports']].map(([value,label])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}</section></>
}
