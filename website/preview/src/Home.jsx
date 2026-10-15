/*! Home interaction adapted from Blobatar Hero.tsx at a7fd546. Copyright (c) 2026 Alain, MIT. Presentation by Talarurus. */
import React,{lazy,Suspense,useEffect,useRef,useState} from 'react';
import {Face,Code,Install,Segmented} from './components/ui.jsx';
import {GroupChat} from './components/compositions.jsx';
import {Wall} from './Wall.jsx';
import {DEFAULTS,EXPRESSIONS,shareHash} from './adapter.mjs';
import {heroSnippet} from './editor/snippet.mjs';
import {NAMES} from './editor/crowd.jsx';
const MotionPreview=lazy(()=>import('./MotionPreview'));
const ROSTER=['atlas','mira','nova','cedar','juniper','orbit'];
export function Home(){
  const [name,setName]=useState('atlas'),[expression,setExpression]=useState('idle'),[api,setApi]=useState('react'),[burst,setBurst]=useState(null),release=useRef(null);
  useEffect(()=>()=>clearTimeout(release.current),[]);
  const shown=burst??expression,config={...DEFAULTS,name,expression,motion:'always',pointerGaze:true};
  function react(){const pool=EXPRESSIONS.filter(p=>p!==shown&&p!=='idle');setBurst(pool[Math.floor(Math.random()*pool.length)]);clearTimeout(release.current);release.current=setTimeout(()=>setBurst(null),1500)}
  function pick(value){clearTimeout(release.current);setBurst(null);setExpression(value)}
  function chooseName(value){clearTimeout(release.current);setBurst(null);setName(value)}
  function shuffle(){const pool=NAMES.filter(n=>n!==name);chooseName(pool[Math.floor(Math.random()*pool.length)])}
  return <>
    <section className="home-hero">
      <div className="home-copy">
        <span className="eyebrow">TALARURUS / OPEN SOURCE AGENT IDENTITY</span>
        <h1>A familiar face.<br/><span>Through every task.</span></h1>
        <p>Turn an agent ID into a face you recognize. Give it expression, follow its activity, and replay the moments in between.</p>
        <div className="hero-actions"><a className="button" href="/studio">Explore Studio <span aria-hidden="true">↗</span></a><a className="button secondary" href="/editor">Make it yours <span aria-hidden="true">→</span></a></div>
        <a className="hero-docs" href="/docs#installation">Build with whoami <span aria-hidden="true">↗</span></a>
        <div className="hero-facts"><span><b>10</b> silhouettes</span><span><b>14</b> expressions</span><span><b>1</b> stable identity</span></div>
        <p className="micro">MIT · Source package · Runs locally · Not on npm</p>
      </div>
      <div className="home-identity">
        <div className="identity-card-heading"><span className="eyebrow">YOUR NEXT TEAMMATE</span><span className="pill">Interactive preview</span></div>
        <div className="home-name"><label htmlFor="hero-name">Name or seed</label><div className="hero-seed-control"><input id="hero-name" maxLength={256} value={name} placeholder="Try any name" aria-describedby="hero-name-hint" onChange={e=>chooseName(e.target.value)}/><button type="button" aria-label="Shuffle name" onClick={shuffle}>Shuffle ↻</button></div></div>
        <div className="hero-art"><button type="button" className="home-face" id="hero-avatar" onClick={react} aria-label={`Make ${name||'the empty-seed avatar'} react`} aria-describedby="hero-reaction-hint" data-expression={shown} data-base-expression={expression}><Face name={name} config={{...config,expression:shown}} size={280} motion="always" pointerGaze decorative={false}/></button><span className="micro" id="hero-reaction-hint">Move your pointer. Tap for a reaction.</span></div>
        <details className="hero-expressions"><summary>Expression <span>{expression} · 14 poses</span></summary><div className="expression-chips" role="group" aria-label="Hero expression">{EXPRESSIONS.map(e=><button type="button" key={e} aria-pressed={expression===e} onClick={()=>pick(e)}><Face name={name} config={{...config,expression:e}} size={40}/><span>{e}</span></button>)}</div></details>
        <div className="hero-roster" role="group" aria-label="Try another identity">{ROSTER.map(n=><button type="button" key={n} aria-pressed={name===n} onClick={()=>chooseName(n)}><Face name={n} size={48}/><span>{n}</span></button>)}</div>
        <p className="micro" id="hero-name-hint">Different names. Different faces. Always repeatable.</p>
        <a className="card-editor-link" href={'/editor'+shareHash(config)}>Customize this identity <span aria-hidden="true">→</span></a>
      </div>
    </section>
    <Suspense fallback={<section className="motion-preview"><p>Loading recorded motion…</p></section>}><MotionPreview/></Suspense>
    <section className="developer-section" id="build"><div className="developer-copy"><span className="eyebrow">A SMALL API. A LOT OF CHARACTER.</span><h2>From a string<br/>to someone familiar.</h2><p>Start with a static SVG or a React avatar. Add task events and recorded motion when your interface needs them.</p><div className="developer-links"><a href="/docs">Developer documentation ↗</a><a href="/components">Explore interface examples ↗</a><a href="/agent-scenes">Try experimental agent scenes ↗</a></div><Install/></div><div className="hero-developer"><div className="snippet-heading"><span className="micro">Your live configuration</span><Segmented label="Homepage code API" options={['react','core']} value={api} onChange={setApi}/></div><Code text={heroSnippet(api,config)} label="Copy hero example"/><p className="micro">Install from the locally built tarball. <a href="/docs#installation">Installation notes</a></p></div></section>
    <Wall/>
    <section className="identity-section"><div><span className="eyebrow">SAME TEAM. EVERY SURFACE.</span><h2>Everyone gets a face.</h2><p>One stable seed per agent. The face you learn in a conversation is the one you recognize in the sidebar.</p><a className="text-link" href="/components">See it in an interface ↗</a></div><GroupChat channel="little-team" messages={[{name:'atlas',time:'09:41',text:'I’ve got the plan. Mira, want to take a look?'},{name:'mira',time:'09:42',text:'On it. Same team, a new idea.'},{name:'mira',time:'09:42',text:'And a face I can recognize in every thread.'},{name:'nova',time:'09:43',text:'Ready when you are.'}]}/></section>
  </>
}
