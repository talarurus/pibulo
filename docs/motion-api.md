# Recorded motion · v0.3.0 development

`@talarurus/whoami/motion` exports `compileMotionRecording`, `MOTION_REVISION`
(`whoami-motion-1`) and generated public types. `@talarurus/whoami/motion/react`
exports `RecordedAgentAvatar` and `useMotionReducedPreference`. React is optional;
the core has no framework, DOM, network or wall clock. No new dependency is added.

```tsx
import {serializeRecording} from '@talarurus/whoami/recording';
import {compileMotionRecording} from '@talarurus/whoami/motion';
import {RecordedAgentAvatar} from '@talarurus/whoami/motion/react';

const file = serializeRecording({
  agents: [{id: 'atlas', name: 'Atlas'}],
  events: [
    {version: 1, agentId: 'atlas', taskId: 'task-1', sequence: 1,
     timestamp: 800, type: 'task.started'},
    {version: 1, agentId: 'atlas', taskId: 'task-1', sequence: 2,
     timestamp: 1800, type: 'task.working'},
    {version: 1, agentId: 'atlas', taskId: 'task-1', sequence: 3,
     timestamp: 3300, type: 'task.completed'},
  ],
});
if (!file.ok) throw new Error(file.error);
const result = compileMotionRecording(file.json, {originMs: 0});
if (!result.ok) throw new Error(`${result.code}: ${result.error}`);
const motion = result.motion;
const sample = motion.sample('atlas', 2200);
const agents = motion.sampleAll(2200); // Same timestamp, registration order
const svg = motion.svgFor('atlas', 2200, {size: 240});

export function Agent({playbackMs}: {playbackMs: number}) {
  return <RecordedAgentAvatar motion={motion} agentId="atlas"
    playbackMs={playbackMs} size={160}/>;
}
```

## Input and policy

`compileMotionRecording(json, {originMs, policy?, limits?})` accepts a **complete
version 1 JSON recording**, not an event tail or unchecked snapshots. Existing
`parseRecording` validates its schema, identity revision, ordering, lifecycle and
per-agent task-ID uniqueness. Compilation reuses the existing engine; it never
changes a supplied live engine. SDK limits default to 1 MiB, 1,000 events and 32
agents. `limits` can lower these using the existing recording limit contract.

Origin is a required nonnegative safe integer. Playback milliseconds equal event
timestamp minus origin. Every event must be at or after origin. Compilation also
rejects a duration that would exceed safe integer precision after the final morph.
Studio chooses an explicit displayed origin 800 ms before the minimum event time,
clamped to zero; its Playback origin control can atomically apply another value.
Empty recordings have duration zero and retain the registered idle agents.

The visual policy is separate from the recording envelope:

```ts
const result = compileMotionRecording(json, {
  originMs: 1800000000000,
  policy: {
    transitionMs: 400,
    expressions: {waiting: 'sleepy', completed: 'happy'},
  },
  limits: {maxBytes: 262144, maxEvents: 120, maxAgents: 8},
});
```

Transition duration is an integer 1..2000 ms, default 400. Omitted mappings use:
idle→idle, thinking/working→thinking, waiting→sleepy, needs-input→unsure,
completed→happy, error→mad. Override state keys only with existing supported
expression names. Unknown fields, accessor options, unsupported expressions and
invalid durations fail predictably. No palette or trait override is exposed by
this milestone; raw IDs select the same generation 2 identities as v0.2.0.

Input validation returns `{ok:false, code, error, eventIndex?}` from the existing
recording API, or `code:'invalid-motion-options'` for policy/origin failures.
Success is `{ok:true, motion}`. There is no partially compiled result.

## Sampling and immutability

The compiled object exposes frozen `recording`, `originMs`, `policy`, `revision`,
`tracks` and `durationMs`. Each per-agent track has frozen segments containing
metadata visibility time, morph start time, snapshot and frozen origin/target
pose and palette. Runtime lookup maps stay private. `sample` returns a frozen
snapshot/pose/palette; `sampleAll` returns them in registration order.

Events are **never sorted**. Per-agent tracks are nondecreasing because existing
validation guarantees that ordering. At a timestamp tie, all same-agent events
are applied in input order; the last tied event supplies metadata/target. Events
for other agents can arrive with earlier timestamps and remain independent. At a
shared playback time, each agent selects its own applicable events. That is not
a global recording-prefix replay; original replay APIs retain their old behavior.

Geometric channels use the pinned `lerpPose`/`bakePose` helpers and a versioned
smoothstep curve. Interruption origins come from sampling the preceding segment
at the interruption timestamp, preserving position (C0), not velocity (C1).
Same-state updates carry new metadata without restarting a morph. Semantic state
changes immediately at the event time while the displayed expression approaches
its target. Out-of-range future samples hold the final pose; negative/nonfinite
times, unknown IDs and invalid sampling options throw TypeError/RangeError.
Fractional playback milliseconds are allowed up to safe numeric magnitude.

Palette interpolation uses existing sRGB helpers. If a mix falls below 4.5:1
eye-to-head contrast, the eye is deterministically moved toward black/white until
it meets the ratio; safe endpoints remain unchanged. A rare polarity fallback
may cause a visual color change. Color values are quantized to 8-bit hex. This
does not establish every possible silhouette's containment or text contrast on
every host surface; representative geometric coverage is recorded separately.

`svgFor(id, time, {size=240, decorative=false, reducedMotion=false})` emits static
SVG from the unchanged renderer. Size is an integer 24..4096. Informative SVG
contains an escaped title; decorative SVG omits it. No external style, idle
animation or pointer gaze is required. The ordinary root `svgFor`, Face,
AgentAvatar, AgentScene, event and recording APIs remain compatible.

## Reduced motion and React

Core `sample`, `sampleAll` and `svgFor` accept `{reducedMotion:true}` to select the
latest event's settled target. The event's meaning remains visible, without a
morph. Reduced motion is an explicit frame input, not inferred from the OS in
the framework-neutral module.

`RecordedAgentAvatar` accepts `motion`, `agentId`, `playbackMs`, optional `size`,
`className` and `reducedMotion` (`'system'` default, or boolean). The caller owns
the cursor. The component has no playback timer, live subscription or gaze effect.
It displays polite atomic text status plus distinct planning/execution cues.
The system preference hook removes its media listener on unmount or preference
replacement. Explicit booleans skip media listeners. SSR uses non-reduced
sampling for `'system'`; use an explicit matching boolean for a fixed server/
client render policy. OS preferences may change the pose after hydration.

## Reproducing a frame

Retain the complete recording bytes/data, identity revision, motion revision,
resolved visual policy, origin, exact agent ID, playback timestamp, reduced-motion
flag, SVG size and decorative/title policy. Equal inputs produce equal sampled
values and SVG bytes in the tested runtime. Seeking order, previous samples,
mounting, pause and replay history cannot change those values.

Studio's rAF cursor, speed, hidden-tab pause and browser rasterization remain
browser-driven. Existing Face CSS/gaze and AgentScene playback are outside this
motion sampler. No cross-engine pixel identity, hardware encoding determinism or
historical CSS-animation parity is claimed. See the implemented
[MP4 frame contract](mp4-frame-contract.md) and
[development validation](development-v0.3.0.md).
