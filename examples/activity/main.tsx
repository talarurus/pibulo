import React from 'react';
import {createRoot} from 'react-dom/client';
import {createActivityEngine, replayActivity, type ActivityEvent} from '@talarurus/whoami/activity';
import {AgentAvatar} from '@talarurus/whoami/activity/react';
import {AgentScene} from '@talarurus/whoami/scenes';
import '@talarurus/whoami/motion.css';
import '@talarurus/whoami/gaze.css';
import '@talarurus/whoami/react.css';
import '@talarurus/whoami/scenes.css';

const agents = [{id: 'example-agent', name: 'Example agent'}];
const recording: readonly ActivityEvent[] = [
  {version: 1, type: 'task.started', agentId: 'example-agent', taskId: 'task-001', sequence: 1, timestamp: 0},
  {version: 1, type: 'task.working', agentId: 'example-agent', taskId: 'task-001', sequence: 2, timestamp: 1},
];
const engine = createActivityEngine({agents, historyLimit: 50});
for (const event of recording) {
  const result = engine.dispatch(event);
  if (!result.ok) throw new Error(result.error);
}
const replayed = replayActivity({agents}, recording).engine;
if (replayed.getAgent('example-agent')?.state !== 'working') throw new Error('Replay failed');

function Example() {
  function complete() {
    const previous = engine.getAgent('example-agent')!;
    const result = engine.dispatch({version: 1, type: 'task.completed', agentId: previous.id,
      taskId: previous.taskId!, sequence: previous.sequence + 1, timestamp: previous.timestamp + 1});
    if (!result.ok) console.error(result.code, result.error);
  }
  return <main style={{maxWidth: 600, margin: 'auto', padding: 16}}>
    <h1>whoami activity example</h1><p>Simulated caller events.</p>
    <div><AgentAvatar engine={engine} agentId="example-agent" size={96}/></div>
    <div><AgentScene engine={engine} agentId="example-agent" size={240} motion="always"/></div>
    <button type="button" onClick={complete}>Complete task</button>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Example/>);
