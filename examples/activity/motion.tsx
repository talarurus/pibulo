import {compileMotionRecording, type CompiledMotion} from '@talarurus/whoami/motion';
import {RecordedAgentAvatar} from '@talarurus/whoami/motion/react';

export function readMotion(recordingJSON: string, originMs: number): CompiledMotion {
  const result = compileMotionRecording(recordingJSON, {originMs});
  if (!result.ok) throw new Error(`${result.code}: ${result.error}`);
  return result.motion;
}
export function RecordedAgent({motion, playbackMs}: {motion: CompiledMotion; playbackMs: number}) {
  return <RecordedAgentAvatar motion={motion} agentId={motion.recording.agents[0].id}
    playbackMs={playbackMs} size={160}/>;
}
