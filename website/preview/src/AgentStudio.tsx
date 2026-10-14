import React, {useEffect, useMemo, useState} from 'react';
import {ACTIVITY_LABELS, createActivityEngine, replayActivity, type ActivityEvent, type EventType, type AgentSnapshot} from '@talarurus/whoami/activity';
import {AgentScene} from '@talarurus/whoami/scenes';
import '@talarurus/whoami/scenes.css';
import '@talarurus/whoami/motion.css';
import '@talarurus/whoami/react.css';
import './studio.css';

const agents = [{id: 'atlas', name: 'Atlas'}, {id: 'mira', name: 'Mira'}, {id: 'cedar', name: 'Cedar'}] as const;
const roles = ['Engineering', 'Research', 'Quality'];
const epoch = 1800000000000;
const sample: ActivityEvent[] = [
  {version: 1, agentId: 'atlas', sequence: 1, timestamp: epoch, taskId: 'atlas/task-1', type: 'task.started', message: 'Review the activity API'},
  {version: 1, agentId: 'atlas', sequence: 2, timestamp: epoch + 1000, taskId: 'atlas/task-1', type: 'task.working', message: 'Checking event transitions'},
  {version: 1, agentId: 'mira', sequence: 1, timestamp: epoch + 2000, taskId: 'mira/task-1', type: 'task.started', message: 'Explore identity patterns'},
  {version: 1, agentId: 'mira', sequence: 2, timestamp: epoch + 3000, taskId: 'mira/task-1', type: 'task.input-required', message: 'Approve the research direction'},
  {version: 1, agentId: 'cedar', sequence: 1, timestamp: epoch + 4000, taskId: 'cedar/task-1', type: 'task.started', message: 'Check the example application'},
  {version: 1, agentId: 'cedar', sequence: 2, timestamp: epoch + 5000, taskId: 'cedar/task-1', type: 'task.completed', message: 'Example application verified'},
];
const options = {agents, historyLimit: 120};
const ready = () => replayActivity(options, sample).engine;
const messages: Partial<Record<EventType, string>> = {
  'task.working': 'Making progress on the task', 'task.waiting': 'Waiting for a dependency',
  'task.input-required': 'Your approval or input is needed', 'task.input-resolved': 'Input received; continuing the task',
  'task.completed': 'Task completed successfully', 'task.failed': 'Simulated task error; reset to recover', 'agent.reset': 'Agent reset',
};
function can(agent: AgentSnapshot, type: EventType) {
  if (type === 'agent.reset') return true;
  if (type === 'task.started') return ['idle', 'completed', 'error'].includes(agent.state);
  if (type === 'task.input-resolved') return agent.state === 'needs-input';
  if (agent.state === 'needs-input') return type === 'task.failed';
  if (type === 'task.waiting' && agent.state === 'waiting') return false;
  return ['thinking', 'working', 'waiting'].includes(agent.state);
}
async function copy(text: string, done: (message: string) => void) {
  try { await navigator.clipboard.writeText(text); done('Copied integration code'); }
  catch { done('Select the code below and copy it manually'); }
}
export default function AgentStudio() {
  const [live, setLive] = useState(ready), [recording, setRecording] = useState<readonly ActivityEvent[]>(sample);
  const [selected, setSelected] = useState('atlas'), [task, setTask] = useState('Build something useful');
  const [cursor, setCursor] = useState<number | null>(null), [playing, setPlaying] = useState(false);
  const [codeTab, setCodeTab] = useState<'react' | 'events'>('react'), [feedback, setFeedback] = useState('');
  const replay = useMemo(() => cursor === null ? null : replayActivity(options, recording.slice(0, cursor)).engine, [cursor, recording]);
  const engine = replay ?? live, snapshots = engine.getAgents(), current = engine.getAgent(selected)!;
  const locked = cursor !== null || recording.length >= 120;
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (cursor !== null && cursor < recording.length) setCursor(cursor + 1);
      else setPlaying(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [playing, cursor, recording.length]);
  useEffect(() => { if (!feedback) return; const timer = setTimeout(() => setFeedback(''), 3000); return () => clearTimeout(timer); }, [feedback]);
  function send(type: EventType) {
    const previous = live.getAgent(selected)!;
    const base = {version: 1 as const, agentId: selected, sequence: previous.sequence + 1,
      timestamp: epoch + recording.length * 1000, message: type === 'task.started' ? task.trim() || 'Untitled task' : messages[type]};
    const result = live.dispatch(type === 'agent.reset' ? {...base, type} : {...base, type,
      taskId: type === 'task.started' ? `${selected}/task-${base.sequence}` : previous.taskId!});
    if (!result.ok) { setFeedback(result.error); return; }
    setRecording(live.getHistory());
  }
  const code = codeTab === 'events' ? JSON.stringify(recording, null, 2) : `import { createActivityEngine } from '@talarurus/whoami/activity';
import { AgentAvatar } from '@talarurus/whoami/activity/react';
import '@talarurus/whoami/motion.css';
import '@talarurus/whoami/gaze.css';
import '@talarurus/whoami/react.css';

const engine = createActivityEngine({
  agents: [{ id: '${selected}', name: '${current.name}' }],
  historyLimit: 100,
});

const result = engine.dispatch({
  version: 1,
  agentId: '${selected}',
  taskId: 'task-001',
  sequence: 1,
  timestamp: 1800000000000,
  type: 'task.started',
  message: 'Build something useful',
});
if (!result.ok) console.error(result.code, result.error);

export function Agent() {
  return <AgentAvatar engine={engine} agentId="${selected}" />;
}

// Optional laptop scenes: AgentScene from '@talarurus/whoami/scenes'
// with '@talarurus/whoami/scenes.css'.`;
  return <section className="studio">
    <div className="studio-intro"><div><span className="eyebrow">WHOAMI / AGENT TOOLKIT</span><h1>Identity, in motion.</h1><p>A familiar face. A clear state. A story you can replay.</p></div><span className="studio-version">v0.2.0 <span>development</span></span></div>
    <div className="studio-notice"><span className="studio-indicator"/><span><strong>Agent Identity Studio</strong> <span className="studio-notice-detail">· Simulated events, supplied by you. No live agent connection.</span></span></div>
    <div className="studio-section-heading"><h2>Your agents <span>03</span></h2><span>Stable seeds · independent activity</span></div>
    <div className="studio-agents" aria-label="Agents">{snapshots.map((agent, i) => <article key={agent.id} data-agent-id={agent.id} className={'studio-card' + (selected === agent.id ? ' selected' : '')}>
      <div className="studio-card-heading"><span className="studio-agent-index">0{i + 1} / {roles[i]}</span><span className={'studio-state state-' + agent.state}>{ACTIVITY_LABELS[agent.state]}</span></div>
      <AgentScene engine={engine} agentId={agent.id} size={240} motion="always" className="studio-scene"/>
      <div className="studio-card-bottom"><div><h3>{agent.name}</h3><code>id: {agent.id}</code></div><button type="button" aria-label={`Select ${agent.name}`} aria-pressed={selected === agent.id} onClick={() => setSelected(agent.id)}>{selected === agent.id ? 'Selected' : 'Select ↗'}</button></div>
      <p className="studio-agent-message">{agent.message || 'Ready for the next task'}</p>
    </article>)}</div>
    <div className="studio-workspace"><section className="studio-controls" aria-label="Task controls">
      <div className="studio-section-heading"><h2>Direct {current.name}</h2><span>01 / INTERACT</span></div>
      <p>Give this agent a task, then guide what happens next.</p>
      <label htmlFor="studio-task">Task description</label><div className="studio-task-entry"><input id="studio-task" value={task} maxLength={160} onChange={e => setTask(e.target.value)} disabled={locked}/><button type="button" className="studio-primary" onClick={() => send('task.started')} disabled={locked || !can(current, 'task.started')}>Start task ↗</button></div>
      <div className="studio-actions">{([['task.working', 'Work'], ['task.waiting', 'Wait'], ['task.input-required', 'Request input'], ['task.input-resolved', 'Resolve input'], ['task.completed', 'Complete'], ['task.failed', 'Trigger error'], ['agent.reset', 'Reset agent']] as const).map(([type, label]) => <button type="button" key={type} onClick={() => send(type)} disabled={locked || !can(current, type)}>{label}</button>)}</div>
      <div className="studio-current"><span className={'studio-state state-' + current.state}>{ACTIVITY_LABELS[current.state]}</span><p>{current.message || 'No task yet. Start when you’re ready.'}</p><code>{current.taskId ?? 'No active task'} · seq {current.sequence}</code></div>
      <p className="studio-caption">Only valid next actions are enabled. Other agents keep their own state.</p>
    </section><section className="studio-timeline" aria-label="Event timeline">
      <div className="studio-section-heading"><h2>Event timeline <span>{String(recording.length).padStart(2, '0')}</span></h2><span>02 / REPLAY</span></div>
      <div className="studio-replay"><button type="button" disabled={!recording.length} onClick={() => {setCursor(0); setPlaying(true);}}>Replay recording</button>{cursor !== null && <><button type="button" onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button><button type="button" disabled={cursor >= recording.length} onClick={() => {setPlaying(false); setCursor(cursor + 1);}}>Step</button><button type="button" onClick={() => {setPlaying(false); setCursor(null);}}>Return to live</button></>}</div>
      <label className="studio-scrubber">{cursor === null ? `Recording · ${recording.length}/120 events` : `Replay · ${cursor}/${recording.length} events`}<input aria-label="Replay position" type="range" min={0} max={recording.length} value={cursor ?? recording.length} onChange={e => {setPlaying(false); setCursor(Number(e.target.value));}}/></label>
      <ol className="studio-event-list">{recording.map((event, i) => <li key={i} className={cursor !== null && i >= cursor ? 'future' : ''}><span className="studio-event-number">{String(i + 1).padStart(2, '0')}</span><div><code>{event.type}</code><p>{event.agentId} <span>· {event.message}</span></p></div><span className="studio-event-seq">#{event.sequence}</span></li>)}{recording.length === 0 && <li className="studio-empty">Your next action starts the story.</li>}</ol>
      <div className="studio-recording-foot"><span>Local session · accepted events only</span><button type="button" onClick={() => {setPlaying(false); setCursor(null); setLive(createActivityEngine(options)); setRecording([]);}}>New session</button></div>
      {recording.length >= 120 && <p role="status">Recording full. Start a new session to continue.</p>}
    </section></div>
    <section className="studio-integration"><div className="studio-section-heading"><div><span className="eyebrow">03 / BUILD WITH IT</span><h2>Your events. Your interface.</h2></div><a href="/docs">API & integration ↗</a></div><p>The same public API powers this Studio. Supply structured events from your application.</p><div className="studio-code-toolbar"><div role="group" aria-label="Integration example"><button type="button" aria-pressed={codeTab === 'react'} onClick={() => setCodeTab('react')}>React integration</button><button type="button" aria-pressed={codeTab === 'events'} onClick={() => setCodeTab('events')}>Recorded events</button></div><button type="button" onClick={() => copy(code, setFeedback)} aria-label="Copy Studio code">Copy code ↗</button></div><pre tabIndex={0} aria-label="Studio integration code"><code>{code}</code></pre><p role="status" className="studio-feedback">{feedback}</p></section>
    <div className="studio-credits"><p>Identity & expressions by Blobatar. Laptop scenes adapted from Blobatarling.<br/>Event lifecycle, replay, React bindings & Studio by Talarurus.</p><a href="/THIRD-PARTY-NOTICES.txt">Attribution & licenses ↗</a></div>
  </section>;
}
