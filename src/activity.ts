/** Caller-driven activity. No clocks, transports, renderer or framework dependencies. */
export const EVENT_VERSION = 1 as const;
export const EVENT_STATES = Object.freeze({
  'task.started': 'thinking',
  'task.working': 'working',
  'task.waiting': 'waiting',
  'task.input-required': 'needs-input',
  'task.input-resolved': 'working',
  'task.completed': 'completed',
  'task.failed': 'error',
  'agent.reset': 'idle',
} as const);
export type EventType = keyof typeof EVENT_STATES;
export type ActivityState = typeof EVENT_STATES[EventType];
interface EventBase {
  readonly version: typeof EVENT_VERSION;
  readonly agentId: string;
  /** Strictly increasing per agent, including across resets. Gaps are allowed. */
  readonly sequence: number;
  /** Caller timestamp in integer milliseconds; must not decrease per agent. */
  readonly timestamp: number;
  readonly message?: string;
}
export type ActivityEvent = EventBase & (
  {readonly type: 'agent.reset'} |
  {readonly type: Exclude<EventType, 'agent.reset'>; readonly taskId: string}
);
export interface AgentDefinition { readonly id: string; readonly name?: string }
export interface AgentSnapshot {
  readonly id: string;
  readonly name: string;
  /** Render this seed with normalization="raw". Names never affect identity. */
  readonly seed: string;
  readonly state: ActivityState;
  readonly taskId: string | null;
  readonly sequence: number;
  readonly timestamp: number;
  readonly message: string;
}
export type RejectionCode = 'invalid-event' | 'unknown-agent' | 'stale-event' | 'task-mismatch' | 'invalid-transition';
export type DispatchResult = {readonly ok: true; readonly snapshot: AgentSnapshot} |
  {readonly ok: false; readonly code: RejectionCode; readonly error: string};
export type ValidationResult = {readonly ok: true; readonly event: ActivityEvent} |
  {readonly ok: false; readonly code: 'invalid-event'; readonly error: string};
export interface ActivityOptions { readonly agents: readonly AgentDefinition[]; readonly historyLimit?: number }
export interface ActivityEngine {
  dispatch(input: unknown): DispatchResult;
  getAgent(id: string): AgentSnapshot | undefined;
  getAgents(): readonly AgentSnapshot[];
  /** Accepted events in arrival order. A bounded tail, not a full recording. */
  getHistory(): readonly ActivityEvent[];
  /** Listeners receive accepted updates only. Unsubscribe is idempotent. */
  subscribe(listener: () => void): () => void;
}
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= max &&
  value.isWellFormed() && !/[\u0000-\u001f\u007f]/u.test(value);
const integer = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0;
/** Strict JSON-shaped validation. Unknown fields and versions are rejected. */
export function validateActivityEvent(input: unknown): ValidationResult {
  const fail = (error: string): ValidationResult => ({ok: false, code: 'invalid-event', error});
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return fail('Expected an event object.');
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) return fail('Expected a plain event object.');
    const descriptors = Object.getOwnPropertyDescriptors(input);
    if (Object.values(descriptors).some(descriptor => !('value' in descriptor))) return fail('Event fields must be data properties.');
    const e: Record<string, unknown> = Object.fromEntries(Object.entries(descriptors).map(([key, descriptor]) => [key, descriptor.value]));
    if (e.version !== EVENT_VERSION) return fail('Unsupported event version.');
    if (typeof e.type !== 'string' || !Object.hasOwn(EVENT_STATES, e.type)) return fail('Unknown event type.');
    const allowed = ['version', 'type', 'agentId', 'sequence', 'timestamp', 'message', ...(e.type === 'agent.reset' ? [] : ['taskId'])];
    if (Object.keys(e).some(key => !allowed.includes(key))) return fail('Unknown event field.');
    if (!text(e.agentId, 128) || !integer(e.sequence) || e.sequence === 0 || !integer(e.timestamp)) return fail('Invalid agent ID, sequence or timestamp.');
    if (e.type !== 'agent.reset' && !text(e.taskId, 128)) return fail('A task ID is required.');
    if (e.message !== undefined && (typeof e.message !== 'string' || e.message.length > 512 || !e.message.isWellFormed() || /[\u0000-\u001f\u007f]/u.test(e.message))) return fail('Invalid message.');
    // Copy only validated fields; callers cannot mutate an accepted event later.
    const event = Object.freeze({version: EVENT_VERSION, type: e.type, agentId: e.agentId,
      sequence: e.sequence, timestamp: e.timestamp,
      ...(e.type === 'agent.reset' ? {} : {taskId: e.taskId}),
      ...(e.message === undefined ? {} : {message: e.message})}) as ActivityEvent;
    return {ok: true, event};
  } catch { return fail('Event could not be read.'); }
}
const transitions: Readonly<Record<ActivityState, readonly EventType[]>> = {
  idle: ['task.started', 'agent.reset'],
  thinking: ['task.working', 'task.waiting', 'task.input-required', 'task.completed', 'task.failed', 'agent.reset'],
  working: ['task.working', 'task.waiting', 'task.input-required', 'task.completed', 'task.failed', 'agent.reset'],
  waiting: ['task.working', 'task.input-required', 'task.completed', 'task.failed', 'agent.reset'],
  'needs-input': ['task.input-resolved', 'task.failed', 'agent.reset'],
  completed: ['task.started', 'agent.reset'],
  error: ['task.started', 'agent.reset'],
};
export function createActivityEngine({agents, historyLimit = 100}: ActivityOptions): ActivityEngine {
  if (!Number.isSafeInteger(historyLimit) || historyLimit < 1 || historyLimit > 10000) throw new RangeError('historyLimit must be 1..10000.');
  const states = new Map<string, AgentSnapshot>();
  for (const agent of agents) {
    if (!text(agent.id, 128) || (agent.name !== undefined && !text(agent.name, 128)) || states.has(agent.id)) throw new TypeError('Agent IDs must be valid and unique; names must be valid.');
    states.set(agent.id, Object.freeze({id: agent.id, name: agent.name ?? agent.id, seed: agent.id,
      state: 'idle', taskId: null, sequence: 0, timestamp: 0, message: ''}));
  }
  let history: readonly ActivityEvent[] = Object.freeze([]);
  const listeners = new Set<() => void>();
  let notifying = false;
  const reject = (code: RejectionCode, error: string): DispatchResult => ({ok: false, code, error});
  const engine: ActivityEngine = {
    dispatch(input) {
      // Reentrant dispatch would interleave notification ordering; reject it predictably.
      if (notifying) return reject('invalid-transition', 'Dispatch from a subscriber is not supported.');
      const parsed = validateActivityEvent(input);
      if (!parsed.ok) return parsed;
      const e = parsed.event, prev = states.get(e.agentId);
      if (!prev) return reject('unknown-agent', 'Register the agent when creating the engine.');
      if (e.sequence <= prev.sequence || e.timestamp < prev.timestamp) return reject('stale-event', 'Sequence or timestamp is stale.');
      if (e.type !== 'agent.reset' && e.type !== 'task.started' && e.taskId !== prev.taskId) return reject('task-mismatch', 'Event belongs to another task.');
      if (!transitions[prev.state].includes(e.type)) return reject('invalid-transition', `Cannot apply ${e.type} while ${prev.state}.`);
      // Reusing a terminal task ID risks accepting late events as a new task.
      if (e.type === 'task.started' && e.taskId === prev.taskId) return reject('task-mismatch', 'Use a fresh task ID.');
      const next: AgentSnapshot = Object.freeze({...prev, state: EVENT_STATES[e.type],
        taskId: e.type === 'agent.reset' ? null : e.taskId, sequence: e.sequence,
        timestamp: e.timestamp, message: e.message ?? ''});
      states.set(e.agentId, next);
      history = Object.freeze([...history.slice(Math.max(0, history.length - historyLimit + 1)), e]);
      notifying = true;
      try { for (const listener of [...listeners]) { try { listener(); } catch { /* A consumer cannot roll back an accepted event or starve other subscribers. */ } } }
      finally { notifying = false; }
      return {ok: true, snapshot: next};
    },
    getAgent: id => states.get(id),
    getAgents: () => Object.freeze([...states.values()]),
    getHistory: () => history,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
  return Object.freeze(engine);
}
/** Replays a complete caller recording in its original order, without clocks or sorting. */
export function replayActivity(options: ActivityOptions, events: readonly unknown[]): {readonly engine: ActivityEngine; readonly results: readonly DispatchResult[]} {
  const engine = createActivityEngine(options);
  return {engine, results: Object.freeze(events.map(event => engine.dispatch(event)))};
}
export const ACTIVITY_LABELS: Readonly<Record<ActivityState, string>> = Object.freeze({
  idle: 'Idle', waiting: 'Waiting', thinking: 'Thinking', working: 'Working',
  'needs-input': 'Needs input', completed: 'Completed', error: 'Error',
});
