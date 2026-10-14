/*! Scene rendering adapted from the existing Blobatarling scene demo. MIT: see THIRD-PARTY-NOTICES.txt. */
import React, {useEffect, useRef} from 'react';
import {useAgentActivity, type AgentAvatarProps} from './activity-react.js';
import {ACTIVITY_LABELS} from './activity.js';
import {blobatarScene} from '../website/preview/vendor/blobatarling-scene/scene';
import {bindScene} from '../website/preview/vendor/blobatarling-scene/scene-dom';
import {createActivityPlayback} from '../website/preview/vendor/blobatarling-scene/scene-playback';
import {laptop, type LaptopState} from '../website/preview/vendor/blobatarling-scene/activity-laptop';
import {idle, thinking, sleepy} from '../website/preview/vendor/blobatar/src/expression';
import type {ActivitySample} from '../website/preview/vendor/blobatarling-scene/scene-activity';

/** Optional scene entry. Import motion.css and scenes.css for animation. */
export function AgentScene({engine, agentId, size = 240, motion = 'off', className}: AgentAvatarProps) {
  const agent = useAgentActivity(engine, agentId), host = useRef<HTMLSpanElement>(null);
  const state = agent.state;
  const activityState: LaptopState | null = state === 'working' ? 'working' : state === 'needs-input' ? 'input' : state === 'completed' ? 'done' : state === 'error' ? 'error' : null;
  const expression = state === 'thinking' ? thinking : state === 'waiting' ? sleepy : idle;
  const label = `${agent.name} · ${ACTIVITY_LABELS[state]}`;
  // Deterministic, meaningful SSR still; the effect takes ownership of SVG internals.
  const html = blobatarScene(agent.seed, {size, normalize: false, animate: undefined, hands: false, expression,
    activity: activityState ? {value: laptop(activityState), progress: 0.5} : undefined});
  useEffect(() => {
    const svg = host.current?.querySelector('svg');
    if (!svg || !host.current) return;
    const binding = bindScene(svg), media = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    const apply = (sample: ActivitySample | null) => binding.apply(agent.seed, {size, normalize: false, hands: false, expression,
      animate: motion === 'off' || media.matches ? undefined : motion, activity: sample ?? undefined});
    const playback = createActivityPlayback({onUpdate: apply});
    const sync = () => {
      const stopped = !visible || document.hidden;
      host.current?.classList.toggle('preview-no-idle', stopped || motion === 'off' || media.matches);
      if (stopped) playback.pause(); else playback.resume();
    };
    const start = () => {
      if (activityState) playback.play(laptop(activityState), {mode: 'hold', reducedMotion: media.matches || motion === 'off'});
      else { playback.stop(); apply(null); }
      sync();
    };
    const observer = new IntersectionObserver(entries => {visible = entries.some(entry => entry.isIntersecting); sync();});
    observer.observe(host.current);
    document.addEventListener('visibilitychange', sync); media.addEventListener('change', start); start();
    return () => {observer.disconnect(); document.removeEventListener('visibilitychange', sync); media.removeEventListener('change', start); playback.dispose(); binding.dispose();};
  }, [agent.seed, state, size, motion]);
  return <span className={className} data-agent-state={state}>
    <span ref={host} aria-hidden="true" style={{display: 'inline-block', width: size, maxWidth: '100%'}} dangerouslySetInnerHTML={{__html: html}}/>
    <span role="status" aria-live="polite" aria-atomic="true">{label}</span>
  </span>;
}
