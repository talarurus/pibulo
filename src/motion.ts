/** Optional recorded motion. No wall clock, DOM, React or Bloub code.
 * Rendering uses the existing pinned MIT Blobatar utilities (root notices).
 */
import {parseRecording, type ActivityRecording, type RecordingLimits, type RecordingFailure} from './recording.js';
import {createActivityEngine, type AgentSnapshot, type ActivityState} from './activity.js';
import type {Expression as ExpressionName} from './index.js';
import {blobatar, _layout} from '../website/preview/vendor/blobatar/src/blobatar';
import * as expressions from '../website/preview/vendor/blobatar/src/expression';
import {bakePose, lerpPose, type Pose} from '../website/preview/vendor/blobatar/src/morph';
import {fadeHex, contrast, fromHex, type Palette} from '../website/preview/vendor/blobatar/src/color';

export const MOTION_REVISION = 'whoami-motion-1' as const;
export interface MotionPolicy {
  readonly transitionMs?: number;
  readonly expressions?: Readonly<Partial<Record<ActivityState, ExpressionName>>>;
}
export interface MotionOptions {
  readonly originMs: number;
  readonly policy?: MotionPolicy;
  readonly limits?: RecordingLimits;
}
export interface ResolvedMotionPolicy {
  readonly transitionMs: number;
  readonly expressions: Readonly<Record<ActivityState, ExpressionName>>;
}
export type MotionPose = Readonly<Record<'esx' | 'esy' | 'tilt' | 'edy' | 'edx' | 'esx2' | 'esy2' | 'tilt2' | 'edy2' | 'lock' | 'heat' | 'shake' | 'rock' | 'bdy', number>>;
export type MotionPalette = Readonly<Partial<Record<'head' | 'eye' | 'bg', string>>>;
export interface MotionVisual {
  readonly pose: MotionPose;
  readonly palette: MotionPalette;
}
export interface MotionSegment {
  /** Visibility time for this event's metadata; per-agent ties keep arrival order. */
  readonly atMs: number;
  /** May precede atMs for metadata-only updates that retain the current morph. */
  readonly transitionStartMs: number;
  readonly snapshot: AgentSnapshot;
  readonly from: MotionVisual;
  readonly to: MotionVisual;
}
export interface MotionTrack {
  readonly agentId: string;
  readonly darkEyes: boolean;
  readonly segments: readonly MotionSegment[];
}
export interface MotionSample extends MotionVisual {readonly snapshot: AgentSnapshot}
export interface MotionSamplingOptions {readonly reducedMotion?: boolean}
export interface MotionSVGOptions extends MotionSamplingOptions {
  readonly size?: number;
  readonly decorative?: boolean;
}
export interface CompiledMotion {
  readonly revision: typeof MOTION_REVISION;
  readonly recording: ActivityRecording;
  readonly originMs: number;
  readonly durationMs: number;
  readonly policy: ResolvedMotionPolicy;
  readonly tracks: readonly MotionTrack[];
  sample(agentId: string, playbackMs: number, options?: MotionSamplingOptions): MotionSample;
  sampleAll(playbackMs: number, options?: MotionSamplingOptions): readonly MotionSample[];
  svgFor(agentId: string, playbackMs: number, options?: MotionSVGOptions): string;
}
export type MotionCompileResult = {readonly ok: true; readonly motion: CompiledMotion} |
  RecordingFailure | {readonly ok: false; readonly code: 'invalid-motion-options'; readonly error: string};
const defaults: Readonly<Record<ActivityState, ExpressionName>> = Object.freeze({
  idle: 'idle', waiting: 'sleepy', thinking: 'thinking', working: 'thinking',
  'needs-input': 'unsure', completed: 'happy', error: 'mad',
});
const names: readonly ExpressionName[] = ['idle','happy','sad','mad','surprised','wink','sleepy','smug','unsure','scared','love','shy','sick','thinking'];
function fields(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new TypeError('Expected plain motion options.');
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(value).some(key => typeof key !== 'string' || !allowed.includes(key)) ||
      Object.values(descriptors).some(field => !('value' in field))) throw new TypeError('Unknown or accessor motion option.');
  return Object.fromEntries(Object.entries(descriptors).map(([key, field]) => [key, field.value]));
}
const visual = (pose: Readonly<Pose>, palette: Readonly<Palette>): MotionVisual => Object.freeze({
  pose: Object.freeze({...pose}), palette: Object.freeze({...palette}),
});
/** Preserve eye polarity. Only adjust a mix if 8-bit sRGB interpolation loses 4.5:1.
 * Bisection toward black/white is deterministic and leaves safe endpoints unchanged.
 */
function safePalette(a: Readonly<Palette>, b: Readonly<Palette>, t: number, darkEyes: boolean): Readonly<Palette> {
  const palette: Palette = {};
  for (const key of ['head', 'eye', 'bg'] as const) {
    const av = a[key], bv = b[key];
    palette[key] = av && bv ? fadeHex(av, bv, t) : bv ?? av;
  }
  if (palette.head && palette.eye && contrast(fromHex(palette.head), fromHex(palette.eye)) < 4.5) {
    const eye = palette.eye, endpoint = darkEyes ? '#000000' : '#ffffff';
    // Fallback polarity is possible with an unusual expression mapping.
    const target = contrast(fromHex(palette.head), fromHex(endpoint)) >= 4.5 ? endpoint : darkEyes ? '#ffffff' : '#000000';
    let low = 0, high = 1;
    for (let i = 0; i < 16; i++) {
      const mid = (low + high) / 2;
      if (contrast(fromHex(palette.head), fromHex(fadeHex(eye, target, mid))) >= 4.5) high = mid; else low = mid;
    }
    palette.eye = fadeHex(eye, target, high);
  }
  return Object.freeze(palette);
}
function sampleSegment(segment: MotionSegment, time: number, policy: ResolvedMotionPolicy, darkEyes: boolean, reduced: boolean): MotionVisual {
  const fraction = Math.min(1, Math.max(0, (time - segment.transitionStartMs) / policy.transitionMs));
  const t = reduced ? 1 : fraction * fraction * (3 - 2 * fraction);
  if (t === 0) return segment.from;
  if (t === 1) return segment.to;
  return visual(lerpPose(segment.from.pose, segment.to.pose, t), safePalette(segment.from.palette, segment.to.palette, t, darkEyes));
}
const finiteTime = (time: number) => {
  if (!Number.isFinite(time) || time < 0 || time > Number.MAX_SAFE_INTEGER) throw new RangeError('Playback milliseconds must be finite, nonnegative and safely representable.');
};
/** Validate the complete existing v1 JSON envelope, never sort or hydrate snapshots.
 * Compilation failures return a result; invalid sampling arguments throw.
 */
export function compileMotionRecording(json: string, options: MotionOptions): MotionCompileResult {
  try {
    const data = fields(options, ['originMs', 'policy', 'limits']);
    const origin = data.originMs;
    if (typeof origin !== 'number' || !Number.isSafeInteger(origin) || origin < 0) throw new RangeError('originMs must be a nonnegative safe integer.');
    const inputPolicy = fields(data.policy ?? {}, ['transitionMs', 'expressions']);
    const transition = inputPolicy.transitionMs ?? 400;
    if (typeof transition !== 'number' || !Number.isSafeInteger(transition) || transition < 1 || transition > 2000) throw new RangeError('transitionMs must be an integer from 1 to 2000.');
    const mapping = fields(inputPolicy.expressions ?? {}, Object.keys(defaults));
    if (Object.values(mapping).some(name => !names.includes(name as ExpressionName))) throw new TypeError('Unsupported expression.');
    const policy: ResolvedMotionPolicy = Object.freeze({transitionMs: transition, expressions: Object.freeze({...defaults, ...mapping})});
    const parsed = parseRecording(json, (data.limits ?? {}) as RecordingLimits);
    if (!parsed.ok) return parsed;
    const recording = parsed.recording;
    if (recording.events.some(event => event.timestamp < origin)) throw new RangeError('An event precedes originMs.');
    const last = Math.max(0, ...recording.events.map(event => event.timestamp - origin));
    if (last > Number.MAX_SAFE_INTEGER - transition) throw new RangeError('Recording duration exceeds safe millisecond precision.');
    const engine = createActivityEngine({agents: recording.agents});
    const bases = new Map(recording.agents.map(agent => [agent.id, _layout(agent.id, {normalize: false}).palette]));
    const mutable = new Map<string, {darkEyes: boolean; segments: MotionSegment[]}>();
    for (const snapshot of engine.getAgents()) {
      const base = bases.get(snapshot.id)!;
      const expression = expressions[policy.expressions.idle];
      const rest = visual(expression.p, expression.tint ? expression.tint(base, expression.p) : base);
      // Base eye polarity is stable across ordinary tint expressions.
      const darkEyes = fromHex(base.eye!).l < fromHex(base.head!).l;
      mutable.set(snapshot.id, {darkEyes, segments: [Object.freeze({atMs: 0, transitionStartMs: 0, snapshot, from: rest, to: rest})]});
    }
    for (const event of recording.events) {
      const accepted = engine.dispatch(event);
      if (!accepted.ok) throw new Error('Validated recording could not be replayed.');
      const track = mutable.get(event.agentId)!;
      const previous = track.segments[track.segments.length - 1];
      const atMs = event.timestamp - origin;
      if (previous.snapshot.state === accepted.snapshot.state) {
        track.segments.push(Object.freeze({...previous, atMs, snapshot: accepted.snapshot}));
      } else {
        const expression = expressions[policy.expressions[accepted.snapshot.state]], base = bases.get(event.agentId)!;
        track.segments.push(Object.freeze({atMs, transitionStartMs: atMs, snapshot: accepted.snapshot,
          from: sampleSegment(previous, atMs, policy, track.darkEyes, false),
          to: visual(expression.p, expression.tint ? expression.tint(base, expression.p) : base)}));
      }
    }
    const tracks = Object.freeze([...mutable].map(([agentId, track]) => Object.freeze({agentId, darkEyes: track.darkEyes, segments: Object.freeze(track.segments)})));
    const byId = new Map(tracks.map(track => [track.agentId, track]));
    function sample(agentId: string, playbackMs: number, sampling: MotionSamplingOptions = {}): MotionSample {
      finiteTime(playbackMs);
      const input = fields(sampling, ['reducedMotion']);
      if (input.reducedMotion !== undefined && typeof input.reducedMotion !== 'boolean') throw new TypeError('reducedMotion must be boolean.');
      const track = byId.get(agentId);
      if (!track) throw new RangeError('Unknown agent ID.');
      let low = 0, high = track.segments.length;
      while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (track.segments[mid].atMs <= playbackMs) low = mid + 1; else high = mid;
      }
      const segment = track.segments[Math.max(0, low - 1)];
      return Object.freeze({snapshot: segment.snapshot, ...sampleSegment(segment, playbackMs, policy, track.darkEyes, input.reducedMotion === true)});
    }
    const motion: CompiledMotion = Object.freeze({revision: MOTION_REVISION, recording, originMs: origin, policy, tracks,
      durationMs: recording.events.length ? last + transition : 0,
      sample,
      sampleAll: (time: number, sampling?: MotionSamplingOptions) => Object.freeze(tracks.map(track => sample(track.agentId, time, sampling))),
      svgFor(agentId: string, time: number, svgOptions: MotionSVGOptions = {}) {
        const input = fields(svgOptions, ['size', 'decorative', 'reducedMotion']);
        const size = input.size ?? 240;
        if (typeof size !== 'number' || !Number.isInteger(size) || size < 24 || size > 4096) throw new RangeError('SVG size must be 24..4096.');
        if (input.decorative !== undefined && typeof input.decorative !== 'boolean') throw new TypeError('decorative must be boolean.');
        const result = sample(agentId, time, input.reducedMotion === undefined ? {} : {reducedMotion: input.reducedMotion as boolean});
        return blobatar(result.snapshot.seed, {normalize: false, size,
          title: input.decorative ? undefined : `${result.snapshot.name} · ${result.snapshot.state}`,
          expression: {p: result.pose, vars: expressions.poseVars, bake: bakePose, tint: () => result.palette}});
      },
    });
    return {ok: true, motion};
  } catch (error) {
    return {ok: false, code: 'invalid-motion-options', error: error instanceof Error ? error.message : 'Motion options could not be read.'};
  }
}
