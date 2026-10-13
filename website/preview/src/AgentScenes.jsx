/*! Optional manual companion demo using selected Blobatarling MIT scene modules. See vendor/blobatarling-scene/SOURCE.json. Not a coding-agent integration. */
import React,{useEffect,useRef,useState} from 'react';
import {bindScene} from '../vendor/blobatarling-scene/scene-dom.ts';
import {createActivityPlayback} from '../vendor/blobatarling-scene/scene-playback.ts';
import {laptop} from '../vendor/blobatarling-scene/activity-laptop.ts';
import {idle,thinking} from '../vendor/blobatar/src/expression.ts';
const STATES=[['idle','Idle'],['thinking','Thinking'],['working','Working'],['input','Needs approval / input'],['done','Completed'],['error','Error']];
const DETAILS={idle:'Resting, with the original idle motion and blinking.',thinking:'The original thinking expression. No extra props.',working:'A focused laptop scene, with hands tucked behind the keyboard.',input:'An open laptop and a raised hand asking for attention.',done:'An open laptop, satisfied expression and a completion badge.',error:'An open laptop, frustrated expression and an error badge.'};
function Scene({name,state,replay}){
  const svg=useRef(null),host=useRef(null),[paused,setPaused]=useState(false);
  useEffect(()=>{
    const el=svg.current,binding=bindScene(el),media=matchMedia('(prefers-reduced-motion: reduce)');
    let visible=true,hidden=document.hidden;
    const options={animate:'always',expression:state==='thinking'?thinking:idle,hands:false,title:`${name||'Empty seed'} · ${STATES.find(([id])=>id===state)[1]} (manual demo)`};
    const apply=sample=>{binding.apply(name,{...options,activity:sample??undefined});el.setAttribute('data-progress',sample?String(sample.progress):'none')};
    const playback=createActivityPlayback({onUpdate:apply});
    const sync=()=>{const stopped=!visible||hidden;host.current?.classList.toggle('preview-no-idle',stopped);setPaused(stopped);if(stopped)playback.pause();else playback.resume()};
    const start=()=>{if(state==='idle'||state==='thinking'){playback.stop();apply(null)}else playback.play(laptop(state),{mode:'hold',reducedMotion:media.matches});sync()};
    const hide=()=>{hidden=document.hidden;sync()};
    const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);sync()});observer.observe(host.current);
    document.addEventListener('visibilitychange',hide);media.addEventListener('change',start);start();
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);media.removeEventListener('change',start);playback.dispose();binding.dispose()};
  },[name,state,replay]);
  return <div className="scene-stage" ref={host}><svg ref={svg} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${name||'Empty seed'} · ${STATES.find(([id])=>id===state)[1]} (manual demo)`} id="agent-scene" data-demo-state={state} data-avatar-seed={name}/>{paused&&<span className="sr-only">Animation paused while out of view.</span>}</div>;
}
export function AgentScenes(){
  const [name,setName]=useState('atlas'),[state,setState]=useState('idle'),[replay,setReplay]=useState(0);
  useEffect(()=>{const link=document.createElement('link');link.rel='stylesheet';link.href='/agent-scenes.css';document.head.append(link);return()=>link.remove()},[]);
  return <section className="scene-page"><span className="eyebrow">OPTIONAL EXPERIMENT</span><h1>Agent scenes.</h1><p>Small moments for a familiar face. Choose a state to try a temporary companion scene.</p><p className="micro">Manual demo states. No Codex, Claude or other agent event integration is connected.</p><Scene name={name} state={state} replay={replay}/><div className="scene-controls" role="group" aria-label="Manual agent state">{STATES.map(([id,label])=><button type="button" key={id} aria-pressed={state===id} onClick={()=>setState(id)}>{label}</button>)}</div><div className="scene-settings"><label htmlFor="scene-name">Seed</label><input id="scene-name" maxLength={256} value={name} onChange={e=>setName(e.target.value)} placeholder="Empty seed"/><button type="button" className="quiet" onClick={()=>setReplay(v=>v+1)} disabled={state==='idle'||state==='thinking'}>Replay entrance</button></div><p className="scene-status" role="status">{DETAILS[state]}</p><details className="scene-details"><summary>About this experiment</summary><p>The original 100×100 avatar sits inside a stable 160×160 scene. The laptop is shown from behind: its screen faces the avatar. Working, input, completed and error use the fork’s original laptop activities; idle and thinking use upstream expressions. Motion holds at the authored midpoint and becomes a still pose with reduced motion.</p><p>Scenes do not change the seed or standard avatars. They have no export, saved-state or event-adapter API in v0.1.0. <a href="/THIRD-PARTY-NOTICES.txt">MIT attribution and licenses</a></p></details><div className="scene-links"><a href="/">Back to the generator</a><a href="/editor">Avatar editor</a><a href="/docs#companions">Developer notes</a></div></section>;
}
