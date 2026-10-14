import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ACTIVITY_LABELS, createActivityEngine, replayActivity, type ActivityEvent, type EventType, type AgentSnapshot, type AgentDefinition} from '@talarurus/whoami/activity';
import {parseRecording, serializeRecording} from '@talarurus/whoami/recording';
import {AgentScene} from '@talarurus/whoami/scenes';
import '@talarurus/whoami/scenes.css';
import '@talarurus/whoami/motion.css';
import '@talarurus/whoami/react.css';
import './studio.css';

const initialAgents = [{id: 'atlas', name: 'Atlas'}, {id: 'mira', name: 'Mira'}, {id: 'cedar', name: 'Cedar'}] as const;
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
const studioLimits = {maxBytes: 262144, maxEvents: 120, maxAgents: 8};
const options = {agents: initialAgents, historyLimit: studioLimits.maxEvents};
const ready = () => ({agents: initialAgents as readonly AgentDefinition[], live: replayActivity(options, sample).engine, events: sample as readonly ActivityEvent[], imported: false});
const eventLabels: Record<EventType, string> = {'task.started': 'Task started', 'task.working': 'Work in progress', 'task.waiting': 'Waiting for a dependency', 'task.input-required': 'Input requested', 'task.input-resolved': 'Input received', 'task.completed': 'Task completed', 'task.failed': 'Task failed', 'agent.reset': 'Agent reset'};
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
  const [session, setSession] = useState(ready);
  const {agents, live, events: recording} = session;
  const [selected, setSelected] = useState('atlas'), [task, setTask] = useState('Build something useful');
  const [cursor, setCursor] = useState<number | null>(null), [playing, setPlaying] = useState(false);
  const [codeTab, setCodeTab] = useState<'react' | 'events'>('react'), [feedback, setFeedback] = useState('');
  const [importing, setImporting] = useState(false), [fileNotice, setFileNotice] = useState<{error: boolean; text: string} | null>(null);
  const fileInput = useRef<HTMLInputElement>(null), importToken = useRef(0), eventList = useRef<HTMLOListElement>(null);
  const replay = useMemo(() => cursor === null ? null : replayActivity({agents, historyLimit: studioLimits.maxEvents}, recording.slice(0, cursor)).engine, [cursor, recording, agents]);
  const engine = replay ?? live, snapshots = engine.getAgents(), current = engine.getAgent(selected)!;
  const locked = cursor !== null || recording.length >= studioLimits.maxEvents || importing;
  const selectedIndex = (cursor ?? recording.length) - 1, selectedEvent = recording[selectedIndex];
  const exported = useMemo(() => serializeRecording({agents, events: recording}, studioLimits), [agents, recording]);
  useEffect(() => () => {importToken.current++;}, []);
  useEffect(() => {
    const list = eventList.current, row = list?.querySelector<HTMLElement>('[aria-current=step]');
    if (!list || !row) return;
    const box = list.getBoundingClientRect(), item = row.getBoundingClientRect();
    if (item.top < box.top) list.scrollTop -= box.top - item.top;
    else if (item.bottom > box.bottom) list.scrollTop += item.bottom - box.bottom;
  }, [cursor, recording.length]);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (cursor !== null && cursor < recording.length) setCursor(cursor + 1);
      else setPlaying(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [playing, cursor, recording.length]);
  useEffect(() => { if (!feedback) return; const timer = setTimeout(() => setFeedback(''), 3000); return () => clearTimeout(timer); }, [feedback]);
  function seek(position: number) {setPlaying(false); setCursor(position);}
  function newSession() {
    setPlaying(false); setCursor(null); setFileNotice(null);
    setSession({agents, live: createActivityEngine({agents, historyLimit: studioLimits.maxEvents}), events: [], imported: false});
  }
  function download() {
    if (!exported.ok) {setFileNotice({error: true, text: exported.error}); return;}
    const url = URL.createObjectURL(new Blob([exported.json], {type: 'application/json'}));
    const link = document.createElement('a'); link.href = url; link.download = 'whoami-recording-v1.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFileNotice({error: false, text: 'Recording exported. Review caller-supplied information before sharing.'});
  }
  async function importFile(file: File) {
    const token = ++importToken.current;
    setImporting(true); setFileNotice(null);
    try {
      if (file.size > studioLimits.maxBytes) {setFileNotice({error: true, text: 'File exceeds the Studio limit of 256 KiB. Current session kept.'}); return;}
      const json = new TextDecoder('utf-8', {fatal: true}).decode(await file.arrayBuffer());
      if (token !== importToken.current) return;
      const result = parseRecording(json, studioLimits);
      if (!result.ok) {setFileNotice({error: true, text: result.error + ' Current session kept.'}); return;}
      setPlaying(false); setCursor(0); setSelected(result.recording.agents[0].id);
      setSession({agents: result.recording.agents, live: result.engine, events: result.recording.events, imported: true});
      setFileNotice({error: false, text: `Imported ${result.recording.events.length} events. Replay is at the beginning; return to live to continue simulating.`});
    } catch { if (token === importToken.current) setFileNotice({error: true, text: 'Could not read this file. Current session kept.'}); }
    finally {if (token === importToken.current) setImporting(false);}
  }
  function send(type: EventType) {
    if (locked) return;
    const previous = live.getAgent(selected)!;
    const base = {version: 1 as const, agentId: selected, sequence: previous.sequence + 1,
      timestamp: Math.max(epoch + recording.length * 1000, previous.timestamp), message: type === 'task.started' ? task.trim() || 'Untitled task' : messages[type]};
    let taskId = `studio-task-${base.sequence}`;
    const used = new Set(recording.filter(e => e.agentId === selected && e.type === 'task.started').map(e => 'taskId' in e ? e.taskId : ''));
    for (let suffix = 1; used.has(taskId); suffix++) taskId = `studio-task-${base.sequence}-${suffix}`;
    const result = live.dispatch(type === 'agent.reset' ? {...base, type} : {...base, type,
      taskId: type === 'task.started' ? taskId : previous.taskId!});
    if (!result.ok) { setFeedback(result.error); return; }
    setSession({...session, events: [...recording, live.getHistory().at(-1)!]});
  }
  const code = codeTab === 'events' ? (exported.ok ? exported.json : exported.error) : `import { createActivityEngine } from '@talarurus/whoami/activity';
import { AgentAvatar } from '@talarurus/whoami/activity/react';
import '@talarurus/whoami/motion.css';
import '@talarurus/whoami/gaze.css';
import '@talarurus/whoami/react.css';

const engine = createActivityEngine({
  agents: [{ id: ${JSON.stringify(selected)}, name: ${JSON.stringify(current.name)} }],
  historyLimit: 100,
});

const result = engine.dispatch({
  version: 1,
  agentId: ${JSON.stringify(selected)},
  taskId: 'task-001',
  sequence: 1,
  timestamp: 1800000000000,
  type: 'task.started',
  message: 'Build something useful',
});
if (!result.ok) console.error(result.code, result.error);

export function Agent() {
  return <AgentAvatar engine={engine} agentId={${JSON.stringify(selected)}} />;
}

// Optional laptop scenes: AgentScene from '@talarurus/whoami/scenes'
// with '@talarurus/whoami/scenes.css'.`;
  return <section className="studio">
    <div className="studio-intro"><div><span className="eyebrow">WHOAMI / AGENT TOOLKIT</span><h1>Identity, in motion.</h1><p>The same agent. A changing state. A story you can replay.</p></div><span className="studio-version">v0.2.0 <span>development</span></span></div>
    <div className="studio-explanation"><p><strong>Identity stays familiar.</strong> An agent’s stable ID generates its face. Tasks change its expression and activity, never its identity.</p><p><strong>Your application supplies events.</strong> whoami validates them and presents what each agent is doing.</p></div>
    <div className="studio-notice"><span className="studio-indicator"/><span><strong>Agent Identity Studio</strong> <span className="studio-notice-detail">· {session.imported ? 'Imported caller events; controls simulate new events.' : 'Simulated events, supplied by you.'} No live agent connection.</span></span></div>
    <div className="studio-section-heading"><h2>Your agents <span>{String(agents.length).padStart(2, '0')}</span></h2><span>Stable IDs · independent activity</span></div>
    <div className="studio-agents" role="group" aria-label="Choose an agent">{snapshots.map((agent, i) => <article key={agent.id} data-agent-id={agent.id} className={'studio-card' + (selected === agent.id ? ' selected' : '')}>
      <div className="studio-card-heading"><span className="studio-agent-index">0{i + 1} / {session.imported ? 'Imported agent' : roles[initialAgents.findIndex(a => a.id === agent.id)] ?? 'Agent'}</span><span className={'studio-state state-' + agent.state}>{ACTIVITY_LABELS[agent.state]}</span></div>
      <AgentScene engine={engine} agentId={agent.id} size={240} motion="always" className="studio-scene"/>
      <div className="studio-card-bottom"><div><h3 title={agent.name}>{agent.name}</h3><code title={agent.id}>id: {agent.id}</code></div><button type="button" aria-label={`Select ${agent.name}${snapshots.some(other => other.id !== agent.id && other.name === agent.name) ? ` (${agent.id})` : ''}`} aria-pressed={selected === agent.id} onClick={() => setSelected(agent.id)}>{selected === agent.id ? 'Selected' : 'Select ↗'}</button></div>
      <p className="studio-agent-message">{agent.message || 'Ready for the next task'}</p>
    </article>)}</div>
    <section className={'studio-playback' + (cursor === null ? '' : ' replaying')} aria-label="Activity playback">
      <div><span className="studio-mode" role="status">{cursor === null ? 'Live session' : 'Replay mode'}</span><p>{cursor === null ? 'Review how your agents got here.' : 'Viewing recorded states. Your live session is preserved.'}</p></div>
      <div className="studio-replay"><button type="button" className="studio-primary" disabled={!recording.length || importing} onClick={() => {setCursor(0); setPlaying(true);}}>Replay recording</button>{cursor !== null && <><button type="button" disabled={cursor >= recording.length || importing} onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'}</button><button type="button" onClick={() => {setPlaying(false); setCursor(null);}}>Return to live</button></>}</div>
    </section>
    <div className="studio-workspace"><section className="studio-controls" aria-label="Task controls">
      <div className="studio-section-heading"><h2>Direct {current.name}</h2><span>01 / INTERACT</span></div>
      <p>{cursor === null ? 'Give this agent a task, then guide what happens next.' : 'Controls are paused during replay. Return to live to send events.'}</p>
      <label htmlFor="studio-task">Task description</label><div className="studio-task-entry"><input id="studio-task" value={task} maxLength={160} onChange={e => setTask(e.target.value)} disabled={locked}/><button type="button" className="studio-primary" onClick={() => send('task.started')} disabled={locked || !can(current, 'task.started')}>Start task ↗</button></div>
      <div className="studio-actions">{([['task.working', 'Work'], ['task.waiting', 'Wait'], ['task.input-required', 'Request input'], ['task.input-resolved', 'Resolve input'], ['task.completed', 'Complete'], ['task.failed', 'Trigger error'], ['agent.reset', 'Reset agent']] as const).map(([type, label]) => <button type="button" key={type} onClick={() => send(type)} disabled={locked || !can(current, type)}>{label}</button>)}</div>
      <div className="studio-current"><span className={'studio-state state-' + current.state}>{ACTIVITY_LABELS[current.state]}</span><p>{current.message || 'No task yet. Start when you’re ready.'}</p><code>{current.taskId ?? 'No active task'} · seq {current.sequence}</code></div>
      <p className="studio-caption">Only valid next actions are enabled. Other agents keep their own state.</p>
    </section><section className="studio-timeline" aria-label="Event timeline">
      <div className="studio-section-heading"><h2>Event timeline <span>{String(recording.length).padStart(2, '0')}</span></h2><span>02 / EXPLORE</span></div>
      <div className="studio-timeline-nav"><button type="button" disabled={!recording.length || (cursor ?? recording.length) === 0} onClick={() => seek(Math.max(0, (cursor ?? recording.length) - 1))}>Previous</button><label className="studio-scrubber"><span>{cursor === null ? `${recording.length}/120 recorded` : `${cursor}/${recording.length} replayed`}</span><input aria-label="Replay position" aria-valuetext={cursor === 0 ? 'Before the first event' : `After event ${cursor ?? recording.length} of ${recording.length}`} type="range" min={0} max={recording.length} value={cursor ?? recording.length} onChange={e => seek(Number(e.target.value))}/></label><button type="button" disabled={cursor === null || cursor >= recording.length} onClick={() => seek((cursor ?? 0) + 1)}>Step</button></div>
      <div className="studio-event-detail" role="region" aria-label="Selected event details">{selectedEvent ? <><span className="eyebrow">{cursor === null ? 'MOST RECENT' : `EVENT ${selectedIndex + 1} OF ${recording.length}`}</span><h3>{eventLabels[selectedEvent.type]}</h3><p>{agents.find(a => a.id === selectedEvent.agentId)?.name} · {selectedEvent.message || 'No message supplied'}</p><code>{selectedEvent.type} · seq {selectedEvent.sequence}<br/>{'taskId' in selectedEvent ? selectedEvent.taskId + ' · ' : ''}{selectedEvent.timestamp} ms</code></> : <p>{recording.length ? 'Before the first event. All agents begin idle.' : 'Your next action starts the story.'}</p>}</div>
      <ol ref={eventList} className="studio-event-list" aria-label="Recorded events">{recording.map((event, i) => <li key={i} className={cursor !== null && i >= cursor ? 'future' : ''}><button type="button" aria-label={`Event ${i + 1}: ${eventLabels[event.type]}, ${event.agentId}`} aria-current={i === selectedIndex ? 'step' : undefined} tabIndex={i === Math.max(0, selectedIndex) ? 0 : -1} onClick={() => seek(i + 1)} onKeyDown={e => {const next = e.key === 'ArrowDown' ? Math.min(recording.length - 1, i + 1) : e.key === 'ArrowUp' ? Math.max(0, i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? recording.length - 1 : null; if (next !== null) {e.preventDefault(); seek(next + 1); eventList.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus({preventScroll: true});}}}><span className="studio-event-number">{String(i + 1).padStart(2, '0')}</span><span className="studio-event-copy"><strong>{eventLabels[event.type]}</strong><span>{event.agentId} · {event.message || 'No message supplied'}</span></span><span className="studio-event-seq">#{event.sequence}</span></button></li>)}{recording.length === 0 && <li className="studio-empty">Your next action starts the story.</li>}</ol>
      <div className="studio-recording-foot"><span>Accepted events · local session</span><button type="button" disabled={importing} onClick={newSession}>New session</button></div>
      {recording.length >= studioLimits.maxEvents && <p role="status">Recording full. Export it or start a new session to continue.</p>}
    </section></div>
    <section className="studio-files" aria-label="Recording files"><div><h2>Keep the story.</h2><p>Export a replayable JSON recording or import one from your application.</p><p className="studio-privacy">Recordings may contain task descriptions and other caller-supplied information. Review before sharing. Files stay local; nothing is uploaded.</p></div><div className="studio-file-actions"><button type="button" disabled={importing || !exported.ok} onClick={download}>Export recording</button><button type="button" disabled={importing} onClick={() => fileInput.current?.click()}>{importing ? 'Reading file…' : 'Import recording'}</button><input ref={fileInput} className="sr-only" type="file" accept="application/json,.json" aria-label="Import recording JSON" tabIndex={-1} onChange={e => {const file = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (file) void importFile(file);}}/><p>Up to 256 KiB · 120 events · 8 agents.<br/>A valid import replaces this session and opens replay.</p></div>{fileNotice && <p className={'studio-file-notice' + (fileNotice.error ? ' error' : '')} role={fileNotice.error ? 'alert' : 'status'}>{fileNotice.text}</p>}</section>
    <section className="studio-integration"><div className="studio-section-heading"><div><span className="eyebrow">03 / BUILD WITH IT</span><h2>Your events. Your interface.</h2></div><a href="/docs#activity">API & integration ↗</a></div><p>The same public API powers this Studio. Supply structured events from your application.</p><div className="studio-code-toolbar"><div role="group" aria-label="Integration example"><button type="button" aria-pressed={codeTab === 'react'} onClick={() => setCodeTab('react')}>React integration</button><button type="button" aria-pressed={codeTab === 'events'} onClick={() => setCodeTab('events')}>Recorded events</button></div><button type="button" onClick={() => copy(code, setFeedback)} aria-label="Copy Studio code">Copy code ↗</button></div><pre tabIndex={0} aria-label="Studio integration code"><code>{code}</code></pre><p role="status" className="studio-feedback">{feedback}</p></section>
    <div className="studio-credits"><p>Identity & expressions by Blobatar. Laptop scenes adapted from Blobatarling.<br/>Event lifecycle, replay, React bindings & Studio by Talarurus.</p><a href="/THIRD-PARTY-NOTICES.txt">Attribution & licenses ↗</a></div>
  </section>;
}
