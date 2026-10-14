import {createActivityEngine, type ActivityEvent, type ActivityState} from '@talarurus/whoami/activity';

const event: ActivityEvent = {
  version: 1, type: 'task.started', agentId: 'agent-001', taskId: 'task-001', sequence: 1, timestamp: 0,
};
const engine = createActivityEngine({agents: [{id: 'agent-001'}]});
const result = engine.dispatch(event);
if (result.ok) {
  const state: ActivityState = result.snapshot.state;
  console.log(state);
} else console.error(result.code, result.error);

// Compile-time checks for the discriminated, versioned schema.
// @ts-expect-error A task event requires taskId.
const missingTask: ActivityEvent = {version: 1, type: 'task.started', agentId: 'agent-001', sequence: 1, timestamp: 0};
// @ts-expect-error Unsupported schema version.
const unsupported: ActivityEvent = {...event, version: 2};
void missingTask; void unsupported;
