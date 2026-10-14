import React, {useCallback, useSyncExternalStore} from 'react';
import {ACTIVITY_LABELS} from './activity.js';
import type {CompiledMotion} from './motion.js';

/** SSR returns false. Attach one media listener per mounted subscriber; remove it
 * on unmount. An explicit preference skips browser media subscriptions entirely.
 */
export function useMotionReducedPreference(preference: boolean | 'system' = 'system'): boolean {
  const subscribe = useCallback((notify: () => void) => {
    if (preference !== 'system' || typeof matchMedia === 'undefined') return () => {};
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    query.addEventListener('change', notify);
    return () => query.removeEventListener('change', notify);
  }, [preference]);
  const read = useCallback(() => preference === 'system' ?
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches : preference, [preference]);
  return useSyncExternalStore(subscribe, read, () => preference === true);
}
export interface RecordedAgentAvatarProps {
  readonly motion: CompiledMotion;
  readonly agentId: string;
  readonly playbackMs: number;
  readonly size?: number;
  readonly reducedMotion?: boolean | 'system';
  readonly className?: string;
}
/** Caller owns the timestamp. No timers, animation CSS, live engine subscription,
 * or pointer listeners; mounting/unmounting cannot alter the recorded motion.
 */
export function RecordedAgentAvatar({motion, agentId, playbackMs, size = 240, reducedMotion = 'system', className}: RecordedAgentAvatarProps) {
  const reduced = useMotionReducedPreference(reducedMotion);
  const sample = motion.sample(agentId, playbackMs, {reducedMotion: reduced});
  const agent = sample.snapshot;
  const svg = motion.svgFor(agentId, playbackMs, {size, reducedMotion: reduced, decorative: true});
  return <span className={className} data-agent-state={agent.state} data-motion-agent={agent.id}>
    <span aria-hidden="true" style={{display: 'inline-block', width: size, maxWidth: '100%'}} dangerouslySetInnerHTML={{__html: svg}}/>
    <span role="status" aria-live="polite" aria-atomic="true">{agent.name} · {ACTIVITY_LABELS[agent.state]}</span>
    {(agent.state === 'thinking' || agent.state === 'working') && <small className="whoami-motion-cue">{agent.state === 'thinking' ? '··· Planning' : '↗ Executing task'}</small>}
  </span>;
}
