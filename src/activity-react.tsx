import React, {useCallback, useSyncExternalStore} from 'react';
import {Face, type FaceProps} from './react.jsx';
import {ACTIVITY_LABELS, type ActivityEngine, type AgentSnapshot} from './activity.js';
import type {Expression} from './index.js';

export function useAgentActivity(engine: ActivityEngine, agentId: string): AgentSnapshot {
  const read = useCallback(() => engine.getAgent(agentId), [engine, agentId]);
  const snapshot = useSyncExternalStore(engine.subscribe, read, read);
  if (!snapshot) throw new RangeError(`Unknown agent: ${agentId}`);
  return snapshot;
}
export interface AgentAvatarProps {
  engine: ActivityEngine;
  agentId: string;
  size?: number;
  motion?: FaceProps['motion'];
  className?: string;
}
const expressions: Readonly<Record<AgentSnapshot['state'], Expression>> = {
  idle: 'idle', waiting: 'sleepy', thinking: 'thinking', working: 'thinking',
  'needs-input': 'unsure', completed: 'happy', error: 'mad',
};
/** Ordinary avatar integration: does not import optional scene code. */
export function AgentAvatar({engine, agentId, size = 64, motion = 'off', className}: AgentAvatarProps) {
  const agent = useAgentActivity(engine, agentId);
  return <span className={className} data-agent-state={agent.state}>
    <Face name={agent.seed} config={{normalization: 'raw', expression: expressions[agent.state]}} size={size} motion={motion} decorative label={agent.name}/>
    <span role="status" aria-live="polite" aria-atomic="true">{agent.name} · {ACTIVITY_LABELS[agent.state]}</span>
  </span>;
}
