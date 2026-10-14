# API and integration

Install the locally built tarball as shown in the README. The root ESM entry is `@talarurus/whoami`; React is `@talarurus/whoami/react`. Node 24 and React 19.2 are the tested versions. CommonJS is not included.

`svgFor(config?, size=512, {decorative=false, label}?)` returns static SVG. Sizes are integers 24..4096. `name` defaults to atlas. Informative SVG includes a title derived from name or label; decorative SVG omits it. Insert only the SVG returned by this renderer, never arbitrary untrusted markup.

`configFor(config?, name?)` validates and fills defaults. `identity(config?, name?)` returns raw/canonical seed, renderer revision, upstream generation 2, overrides and all resolved traits. `expressionFor`, `statusFor`, `shareHash` and `readConfig` expose the same editor contracts. Invalid inputs throw errors; invalid share links return defaults with `linkError`.

Configuration fields: `name`, `traits`, `expression`, `state`, `motion`, `theme`, `backdrop`, `normalization`, `pointerGaze`, `nextTime`, `timezone`, `recovery`, `palette`, `contrast`. Exported `EXPRESSIONS`, `SHAPES`, `TONES`, `TRAIT_KEYS`, `AGENT_STATES`, `REVISION` and `DEFAULTS` enumerate supported values. Traits accept finite normalized positions or lists of at most 32 entries; the upstream renderer clamps finite out-of-range values. Unknown trait keys fail. Default normalization is NFC, trim, lowercase; raw mode skips it. Names allow at most 256 well-formed UTF-16 units.

Palette overrides accept head/eye/bg six-digit hex colors. They and `contrast=false` bypass generated contrast guarantees. Theme changes the website surface. State labels are caller-supplied presentation; expression=auto derives a pose from state, while an explicit expression wins. Scheduled needs nextTime/timezone; error needs recovery text.

`Face` props: `name`, `config`, `size=64`, `motion=off`, `pointerGaze=false`, `target`, `label`, `decorative=true`, `travel=3.8`. Name is a separate prop and overrides config.name. Motion accepts off/hover/always; config.motion and config.pointerGaze are editor fields, so pass the matching Face props explicitly. Import all three package CSS entries for motion and pause rules. Target can be pointer, rest, null, a DOM Element, or a client-coordinate {x,y}. The component renders static SSR markup before attaching effects. Offscreen/hidden components pause and dispose gaze listeners on replacement/unmount. OS reduced motion/coarse pointers suppress tracking. Invalid config renders an alert.

A separate application needs React/ReactDOM 19.2, a bundler that handles CSS imports, and (for TypeScript) React declarations. Run `npm run example:react` for the source example. There is no runtime framework inside the SVG entry, no hosted API, and no PNG API in the package.

The website includes five existing composition examples in `website/preview/src/components/compositions.jsx`. Reuse those with their relative helper modules and styles, preserving notices; they are not package exports. The password helper is a synthetic demonstration and never submits or saves text. The original six-state manual scene demo remains available. The new optional AgentScene entry below packages those same scene visuals with activity subscriptions.

Saved links pin Blobatar revision a7fd546ebede49d0a9fa638945b9e534489782a2 and envelope version 2. No Blinkling generation data is migrated. Keep the seed non-sensitive: it appears in SVG titles, share fragments, local endpoint URLs and browser-local wall storage.

## Activity API · v0.2.0 development

The existing root SVG and `/react` Face exports above remain unchanged. New ESM entries:

| Entry | Exports |
| --- | --- |
| `@talarurus/whoami/activity` | `createActivityEngine`, `replayActivity`, `validateActivityEvent`, `EVENT_VERSION`, `EVENT_STATES`, `ACTIVITY_LABELS`; generated public types |
| `@talarurus/whoami/activity/react` | `AgentAvatar`, `useAgentActivity`; `AgentAvatarProps` |
| `@talarurus/whoami/scenes` | `AgentScene` |
| `@talarurus/whoami/scenes.css` | Optional upstream scene transitions and reduced-motion rules |

The activity engine is framework-neutral and contains no renderer, React, network or wall clock. Register agent definitions `{id, name?}` with `createActivityEngine({agents, historyLimit: 100})`. IDs are exact case-sensitive, well-formed strings of 1..128 UTF-16 units without controls. Names have the same bounds and default to ID. Unique IDs are required; invalid definitions/limits throw TypeError/RangeError. History limits are integers 1..10000. The registered set is fixed; create another engine for a different roster.

`getAgent(id)` returns an immutable snapshot or undefined. `getAgents()` returns snapshots in registration order. A snapshot has `id`, `name`, `seed`, `state`, `taskId`, `sequence`, `timestamp`, `message`. Initially state=idle, taskId=null, sequence=0, timestamp=0 and message="". Seed is the exact ID. Render it with `normalization: 'raw'`; the React components do this automatically, including scenes. Display names and lifecycle changes never change identity. Different IDs may still produce visually similar avatars; identity artwork is not authentication.

### Version 1 event schema

```ts
import type { ActivityEvent } from '@talarurus/whoami/activity';

const event: ActivityEvent = {
  version: 1,
  agentId: 'atlas',
  taskId: 'task-001',
  sequence: 1,
  timestamp: 1800000000000,
  type: 'task.started',
  message: 'Review the API', // optional plain text, up to 512 UTF-16 units
};
```

Every event requires version, type, agentId, sequence and timestamp. Task events require taskId (same string bounds as agent IDs). `agent.reset` omits taskId. Unknown fields/types/versions, arrays, non-plain objects, accessor fields, malformed strings, control characters, and invalid numbers are rejected. Sequence is a positive safe integer strictly increasing **per agent**, including across tasks/resets. Gaps are allowed. Timestamp is a nonnegative safe integer (caller milliseconds); it cannot decrease per agent. Equal timestamps are allowed. Caller sequence is authoritative; events are never sorted or buffered, and rejected events do not consume sequence numbers.

| Event | Resulting visual state |
| --- | --- |
| `task.started` | thinking |
| `task.working` | working |
| `task.waiting` | waiting |
| `task.input-required` | needs-input |
| `task.input-resolved` | working |
| `task.completed` | completed |
| `task.failed` | error |
| `agent.reset` | idle |

### Lifecycle and error contract

- Idle, completed and error permit task.started; completed/error retain their terminal task ID until a new task or reset.
- Thinking and working permit working, waiting, input-required, completed and failed. Waiting permits working, input-required, completed and failed. All updates must match the current task ID.
- Needs-input permits only input-resolved, failed or reset. Completion requires resolving input first.
- Reset is allowed in every state, clears task/message (unless a new message is supplied), and **preserves sequence/timestamp ordering**. It does not change seed.
- Start uses a fresh task ID; restarting the immediately preceding terminal task ID is rejected. Callers must use unique task IDs across the engine session, including after resets. One concurrent task per agent is supported; multiple agents run independently.

`validateActivityEvent(unknown)` returns `{ok:true,event}` with a frozen copy, or `{ok:false,code:'invalid-event',error}`. `dispatch(unknown)` validates and returns `{ok:true,snapshot}` or `{ok:false,code,error}`. Rejection codes are `invalid-event`, `unknown-agent`, `stale-event`, `task-mismatch`, `invalid-transition`. Rejections never change state/history or notify. Events and snapshots cannot be mutated by callers. Neither caller messages nor input requests execute code or approve external operations.

`subscribe(listener)` returns an idempotent unsubscribe function. Accepted events update state before notifying. Subscriber exceptions are isolated so other listeners still run; they do not roll back accepted events. Dispatch from inside a subscriber is rejected as invalid-transition; dispatch after the notification instead. No asynchronous work, timers or transport resources are owned by the engine.

### Bounded history and deterministic replay

`getHistory()` returns an immutable tail of **accepted** events in dispatch order, bounded globally across the roster. It is not necessarily a replayable recording after eviction. Retain the complete input sequence separately when persistence/replay is needed. There are no implicit checkpoints or durable storage.

```ts
import { replayActivity } from '@talarurus/whoami/activity';
const {engine, results} = replayActivity({agents: [{id: 'atlas'}]}, recording);
// Same starting definitions + ordered recording = same snapshots and results.
// Invalid/stale records yield the same rejections; inspect results[].ok.
```

Replay creates a fresh engine and dispatches the supplied sequence in original order with the same validation. It does not sort timestamps, animate time or overwrite a live engine. A retained tail may lack the task start and fail lifecycle checks. Empty recordings reconstruct idle agents. Limit recording size in the caller. The Studio keeps a complete recording of at most 120 events, then requires a new session; it never silently replays an evicted tail. Replay seeking rebuilds a prefix; playback timing is a Studio control, not part of the engine.

### React activity rendering

```tsx
import {createActivityEngine} from '@talarurus/whoami/activity';
import {AgentAvatar} from '@talarurus/whoami/activity/react';
import '@talarurus/whoami/motion.css';
import '@talarurus/whoami/gaze.css';
import '@talarurus/whoami/react.css';
const engine = createActivityEngine({agents: [{id:'atlas', name:'Atlas'}]});
export function Agent() {
  return <AgentAvatar engine={engine} agentId="atlas" size={96} motion="always"/>;
}
```

Keep the engine stable outside render or create it once in state. `useAgentActivity(engine, agentId)` uses React’s external-store subscription contract and returns the current immutable snapshot. Unknown IDs throw RangeError; use an application error boundary. Components unsubscribe on unmount or engine/ID replacement. The server snapshot uses current engine state; hydration requires matching server/client definitions and events.

Both components accept `engine`, `agentId`, `size`, `motion` (`off` default, `hover`, `always`) and `className`. AgentAvatar defaults to 64px and reuses Face with automatic state expressions. AgentScene defaults to 240px and adapts the existing Blobatarling laptop activities; import from `/scenes` and add `scenes.css` plus `motion.css`. Idle/thinking/waiting use existing expressions; working/input/completed/error use existing laptop poses. Appearance uses the exact stable seed in both integrations. Motion governs idle animation and scene entrance playback; off and OS reduced motion select a deterministic still. Hidden/offscreen scenes pause and dispose playback on unmount. Sizes should be positive pixel dimensions.

Both provide an accessible visible text status (`Name · State`) with polite, atomic live announcements; decorative SVG is hidden. Consumers may visually hide the status while preserving it in the accessibility tree, as the Studio does alongside visible badges. Error/input meaning is preserved in text rather than color alone. Scene code is isolated from ordinary `/activity/react`, `/react`, root SVG and engine imports. Neither integration monitors coding agents, approves requests, schedules tasks or changes renderer generation.
