import {parseRecording, serializeRecording, type ActivityRecording} from '@talarurus/pibulo/recording';

const exported = serializeRecording({
  agents: [{id: 'atlas', name: 'Atlas'}],
  events: [{version: 1, type: 'task.started', agentId: 'atlas', taskId: 'task-001', sequence: 1, timestamp: 0}],
});
if (!exported.ok) throw new Error(exported.error);
// Save exported.json through your application’s own file/UI boundary.
const imported = parseRecording(exported.json);
if (imported.ok) {
  const recording: ActivityRecording = imported.recording;
  console.log(imported.engine.getAgent('atlas')?.state); // thinking
  const roundTrip = serializeRecording(recording);
  if (!roundTrip.ok) throw new Error(roundTrip.error);
} else console.error(imported.code, imported.error);
