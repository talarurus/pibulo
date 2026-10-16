import {createActivityEngine, validateActivityEvent, EVENT_VERSION, type ActivityEngine, type ActivityEvent, type AgentDefinition} from './activity.js';

export const RECORDING_VERSION = 1 as const;
/** The identity contract is pinned; a future renderer needs an explicit migration. */
export const RECORDING_IDENTITY = Object.freeze({renderer: 'blobatar', revision: 'a7fd546ebede49d0a9fa638945b9e534489782a2', normalization: 'raw'} as const);
export const RECORDING_LIMITS = Object.freeze({maxBytes: 1048576, maxEvents: 1000, maxAgents: 32});
export interface RecordingLimits { readonly maxBytes?: number; readonly maxEvents?: number; readonly maxAgents?: number }
export interface RecordingSource { readonly agents: readonly AgentDefinition[]; readonly events: readonly ActivityEvent[] }
export interface ActivityRecording extends RecordingSource {
  readonly format: 'whoami-recording';
  readonly version: typeof RECORDING_VERSION;
  readonly eventVersion: typeof EVENT_VERSION;
  readonly initialState: 'idle';
  readonly identity: typeof RECORDING_IDENTITY;
}
export type RecordingErrorCode = 'invalid-recording' | 'unsupported-recording' | 'recording-limit' | 'inconsistent-recording';
export interface RecordingFailure { readonly ok: false; readonly code: RecordingErrorCode; readonly error: string; readonly eventIndex?: number }
export type RecordingImportResult = {readonly ok: true; readonly recording: ActivityRecording; readonly engine: ActivityEngine} | RecordingFailure;
export type RecordingExportResult = {readonly ok: true; readonly recording: ActivityRecording; readonly json: string} | RecordingFailure;
const fail = (code: RecordingErrorCode, error: string, eventIndex?: number): RecordingFailure =>
  ({ok: false, code, error, ...(eventIndex === undefined ? {} : {eventIndex})});

/** Read own data fields without invoking accessors, and reject unversioned extensions. */
function fields(input: unknown, allowed: readonly string[]): Record<string, unknown> | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const descriptors = Object.getOwnPropertyDescriptors(input);
  if (Reflect.ownKeys(descriptors).some(key => typeof key !== 'string' || !allowed.includes(key))) return null;
  if (Object.values(descriptors).some(value => !('value' in value))) return null;
  return Object.fromEntries(Object.entries(descriptors).map(([key, value]) => [key, value.value]));
}
function limitsFor(input: RecordingLimits): Required<RecordingLimits> | null {
  const data = fields(input, ['maxBytes', 'maxEvents', 'maxAgents']);
  if (!data) return null;
  const limits = {...RECORDING_LIMITS, ...data};
  for (const key of ['maxBytes', 'maxEvents', 'maxAgents'] as const)
    if (!Number.isSafeInteger(limits[key]) || (limits[key] as number) < 1 || (limits[key] as number) > RECORDING_LIMITS[key]) return null;
  return limits as Required<RecordingLimits>;
}
function validatePayload(input: unknown, limits: Required<RecordingLimits>): RecordingImportResult {
  const data = fields(input, ['format', 'version', 'eventVersion', 'initialState', 'identity', 'agents', 'events']);
  if (!data) return fail('invalid-recording', 'Expected a recording object with only supported fields.');
  if (data.format !== 'whoami-recording' || data.version !== RECORDING_VERSION || data.eventVersion !== EVENT_VERSION)
    return fail('unsupported-recording', 'Unsupported recording format, recording version or event version.');
  const identity = fields(data.identity, ['renderer', 'revision', 'normalization']);
  if (data.initialState !== 'idle' || !identity || identity.renderer !== RECORDING_IDENTITY.renderer || identity.revision !== RECORDING_IDENTITY.revision || identity.normalization !== 'raw')
    return fail('unsupported-recording', 'This recording uses another identity revision or initial state; no automatic migration is performed.');
  if (!Array.isArray(data.agents) || !Array.isArray(data.events)) return fail('invalid-recording', 'Recording agents and events must be arrays.');
  if (data.agents.length < 1 || data.agents.length > limits.maxAgents) return fail('recording-limit', `Recording must contain 1..${limits.maxAgents} agents.`);
  if (data.events.length > limits.maxEvents) return fail('recording-limit', `Recording exceeds ${limits.maxEvents} events.`);
  const agents: AgentDefinition[] = [];
  for (const [index, inputAgent] of data.agents.entries()) {
    const agent = fields(inputAgent, ['id', 'name']);
    if (!agent || typeof agent.id !== 'string' || (agent.name !== undefined && typeof agent.name !== 'string')) return fail('invalid-recording', `Agent ${index + 1}: expected an ID and optional display name.`);
    agents.push(Object.freeze({id: agent.id, name: (agent.name as string | undefined) ?? agent.id}));
  }
  let engine: ActivityEngine;
  try { engine = createActivityEngine({agents, historyLimit: Math.max(1, data.events.length)}); }
  catch { return fail('invalid-recording', 'Agent IDs must be unique; IDs/names must be well-formed strings of 1..128 units without controls.'); }
  const events: ActivityEvent[] = [];
  const taskIds = new Map(agents.map(agent => [agent.id, new Set<string>()]));
  for (const [index, inputEvent] of data.events.entries()) {
    const parsed = validateActivityEvent(inputEvent);
    if (!parsed.ok) return fail('invalid-recording', `Event ${index + 1}: ${parsed.error}`, index);
    const event = parsed.event;
    if (event.type === 'task.started') {
      const used = taskIds.get(event.agentId);
      if (used?.has(event.taskId)) return fail('inconsistent-recording', `Event ${index + 1}: task IDs must be unique per agent across the recording, including resets.`, index);
      used?.add(event.taskId);
    }
    const result = engine.dispatch(event);
    if (!result.ok) return fail('inconsistent-recording', `Event ${index + 1}: ${result.code}: ${result.error}`, index);
    events.push(event);
  }
  const recording: ActivityRecording = Object.freeze({format: 'whoami-recording', version: RECORDING_VERSION,
    eventVersion: EVENT_VERSION, initialState: 'idle', identity: RECORDING_IDENTITY,
    agents: Object.freeze(agents), events: Object.freeze(events)});
  return {ok: true, recording, engine};
}
/** Parse bounded JSON and replay every event through a fresh engine. Never mutates a caller session. */
export function parseRecording(json: string, options: RecordingLimits = {}): RecordingImportResult {
  try {
    const limits = limitsFor(options);
    if (!limits) return fail('recording-limit', 'Recording limits must be positive integers within the published maximums.');
    if (typeof json !== 'string') return fail('invalid-recording', 'Expected recording JSON text.');
    if (json.length > limits.maxBytes || new TextEncoder().encode(json).byteLength > limits.maxBytes) return fail('recording-limit', `Recording exceeds ${limits.maxBytes} UTF-8 bytes.`);
    let payload: unknown;
    try { payload = JSON.parse(json); } catch { return fail('invalid-recording', 'Could not parse recording JSON. Choose a valid Pibulo recording file.'); }
    return validatePayload(payload, limits);
  } catch { return fail('invalid-recording', 'Recording could not be read.'); }
}
/** Export a complete accepted sequence from idle, not an evicted history tail. Validates before serialization. */
export function serializeRecording(source: RecordingSource, options: RecordingLimits = {}): RecordingExportResult {
  try {
    const limits = limitsFor(options);
    if (!limits) return fail('recording-limit', 'Recording limits must be positive integers within the published maximums.');
    const data = fields(source, ['agents', 'events', 'format', 'version', 'eventVersion', 'initialState', 'identity']);
    if (!data) return fail('invalid-recording', 'Expected agents and a complete accepted event recording.');
    const checked = validatePayload(Object.keys(data).some(key => key !== 'agents' && key !== 'events') ? data :
      {format: 'whoami-recording', version: RECORDING_VERSION, eventVersion: EVENT_VERSION,
        initialState: 'idle', identity: RECORDING_IDENTITY, agents: data.agents, events: data.events}, limits);
    if (!checked.ok) return checked;
    const json = JSON.stringify(checked.recording, null, 2);
    if (new TextEncoder().encode(json).byteLength > limits.maxBytes) return fail('recording-limit', `Recording exceeds ${limits.maxBytes} UTF-8 bytes.`);
    return {ok: true, recording: checked.recording, json};
  } catch { return fail('invalid-recording', 'Recording could not be serialized.'); }
}
