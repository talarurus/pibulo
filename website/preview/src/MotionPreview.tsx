import React,{useEffect,useRef} from 'react';
import {RecordedAgentAvatar,useMotionReducedPreference} from '@talarurus/whoami/motion/react';
import {useMotionPlayback} from './useMotionPlayback';
import {demoAgents,demoMotion,demoDuration,demoSteps} from './demo-recording';

export default function MotionPreview(){
  const reduced=useMotionReducedPreference(),player=useMotionPlayback(demoDuration,true,reduced);
  const stage=useRef<HTMLElement>(null);
  // Pause when the preview leaves the viewport; resuming is always explicit.
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)player.pause();});
    if(stage.current)observer.observe(stage.current);return()=>observer.disconnect();},[]);
  const state=demoMotion.sample('atlas',player.time).snapshot.state;
  const active=state==='thinking'?1:state==='working'?2:state==='completed'?3:0;
  return <section className="motion-preview" ref={stage} aria-label="Recorded agent activity preview">
    <div className="motion-preview-copy"><span className="eyebrow">IDENTITY → ACTIVITY → MOTION</span><h2>Same face.<br/> A little more alive.</h2><p>Watch a task move from thought to done. Every expression follows a recorded event.</p><a className="text-link" href="/studio?mode=motion">Replay your own recording ↗</a><span className="micro">Simulated recording · Local replay & MP4 export</span></div>
    <div className="motion-preview-player"><div className="preview-player-heading"><span className="micro">A small team, in sync</span><button className="quiet" type="button" onClick={()=>player.playing?player.pause():player.play()} disabled={reduced}>{player.playing?'Pause preview':player.time>=demoDuration?'Replay preview':'Play preview'} <span aria-hidden="true">{player.playing?'Ⅱ':'▷'}</span></button></div>
      <div className="preview-agents">{demoAgents.map(agent=><RecordedAgentAvatar key={agent.id} motion={demoMotion} agentId={agent.id} playbackMs={player.time} size={140} className="preview-agent"/>)}</div>
      <div className="preview-steps" role="group" aria-label="Preview task state">{demoSteps.map((step,i)=><button type="button" key={step.label} aria-pressed={active===i} onClick={()=>player.seek(step.time)}><span className="step-number">0{i+1}</span>{step.label}</button>)}</div>
      <div className="preview-player-foot"><span>{demoSteps[active].detail}</span><span>{reduced?'Reduced motion · choose a state':`${(player.time/1000).toFixed(1)} / ${(demoDuration/1000).toFixed(1)}s`}</span></div>
    </div>
  </section>;
}
