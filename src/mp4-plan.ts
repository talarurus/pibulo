import type {CompiledMotion} from './motion.js';
import {ACTIVITY_LABELS} from './activity.js';

export const MP4_LIMITS = Object.freeze({minDimension:64, maxDimension:2048, maxDurationMs:30000, maxAgents:8, maxBytes:67108864, fps:30, terminalHoldMs:1000});
export type MP4ErrorCode = 'invalid-options' | 'unsupported' | 'busy' | 'cancelled' | 'render-failed' | 'encode-failed' | 'output-limit' | 'timeout';
export class MP4ExportError extends Error {
  constructor(readonly code: MP4ErrorCode, message: string) {super(message); this.name = 'MP4ExportError';}
}
export interface MP4Options {
  readonly width?: number;
  readonly height?: number;
  readonly background?: string;
  readonly agentIds?: readonly string[];
  readonly reducedMotion?: boolean;
}
export interface MP4Plan {
  readonly revision: 'whoami-mp4-grid-1';
  readonly width: number;
  readonly height: number;
  readonly background: string;
  readonly agentIds: readonly string[];
  readonly reducedMotion: boolean;
  readonly fps: 30;
  readonly frameCount: number;
  /** Actual encoded length rounded upward to a whole frame. */
  readonly durationMs: number;
}
export function createMP4Plan(motion: CompiledMotion, options: MP4Options = {}): MP4Plan {
  if (!motion || motion.revision !== 'whoami-motion-1') throw new MP4ExportError('invalid-options', 'Use a compiled whoami motion recording.');
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.getPrototypeOf(options) !== Object.prototype)
    throw new MP4ExportError('invalid-options', 'Expected plain MP4 options.');
  const descriptors = Object.getOwnPropertyDescriptors(options);
  if (Reflect.ownKeys(options).some(key => typeof key !== 'string' || !['width','height','background','agentIds','reducedMotion'].includes(key)) || Object.values(descriptors).some(field => !('value' in field)))
    throw new MP4ExportError('invalid-options', 'Unknown or accessor MP4 option.');
  const {width=1024,height=1024,background='#0a0a0b',agentIds=motion.recording.agents.map(agent => agent.id),reducedMotion=false} = options;
  for (const dimension of [width,height]) if (!Number.isInteger(dimension) || dimension < 64 || dimension > 2048 || dimension % 2)
    throw new MP4ExportError('invalid-options', 'Video dimensions must be even integers from 64 to 2048.');
  if (typeof background !== 'string' || !/^#[0-9a-f]{6}$/i.test(background)) throw new MP4ExportError('invalid-options', 'Choose an opaque six-digit hex background.');
  if (typeof reducedMotion !== 'boolean') throw new MP4ExportError('invalid-options', 'reducedMotion must be boolean.');
  if (!Array.isArray(agentIds) || !agentIds.length || agentIds.length > 8 || new Set(agentIds).size !== agentIds.length ||
      agentIds.some(id => !motion.recording.agents.some(agent => agent.id === id))) throw new MP4ExportError('invalid-options', 'Choose 1..8 unique registered agents in export order.');
  const requestedDuration = motion.durationMs + 1000;
  if (!Number.isFinite(requestedDuration) || requestedDuration < 1000 || requestedDuration > 30000)
    throw new MP4ExportError('invalid-options', 'Export supports up to 30 seconds, including the final one-second hold.');
  const frameCount = Math.ceil(requestedDuration * 30 / 1000);
  return Object.freeze({revision:'whoami-mp4-grid-1',width,height,background:background.toLowerCase(),agentIds:Object.freeze([...agentIds]),reducedMotion,fps:30,frameCount,durationMs:frameCount * 1000 / 30});
}
export function mp4FrameTiming(plan: MP4Plan, index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= plan.frameCount) throw new MP4ExportError('invalid-options', 'Frame index is outside this export.');
  const timestampUs = Math.round(index * 1000000 / 30);
  return Object.freeze({playbackMs:index * 1000 / 30, timestampUs, durationUs:Math.round((index + 1) * 1000000 / 30) - timestampUs});
}
const escape = (text: string) => text.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[character]!));
/** Pure composition oracle. Same frozen plan + motion + index => same SVG.
 * Only the existing sampler's avatar marks and escaped labels enter the grid.
 */
export function mp4FrameSVG(motion: CompiledMotion, plan: MP4Plan, index: number): string {
  const time = mp4FrameTiming(plan,index).playbackMs;
  const columns = Math.ceil(Math.sqrt(plan.agentIds.length)), rows = Math.ceil(plan.agentIds.length / columns);
  const cellWidth = plan.width / columns, cellHeight = plan.height / rows;
  const font = Math.max(2,Math.min(20,Math.floor(Math.min(cellWidth,cellHeight) / 18)));
  const avatarSize = Math.max(1,Math.floor(Math.min(cellWidth * .82,cellHeight - font * 4)));
  const linear = (byte: number) => {const value=byte/255;return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4);};
  const rgb=[1,3,5].map(offset=>linear(parseInt(plan.background.slice(offset,offset+2),16)));
  const luminance=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
  const labelColor=luminance<=.04?'#fafaf8':luminance<=.179?'#ffffff':'#000000';
  const stateColor=luminance<=.04?'#c7c7d0':labelColor;
  const contents = plan.agentIds.map((id,i) => {
    const sample = motion.sample(id,time,{reducedMotion:plan.reducedMotion});
    const x = (i % columns) * cellWidth + (cellWidth - avatarSize) / 2;
    const y = Math.floor(i / columns) * cellHeight + (cellHeight - avatarSize - font * 3) / 2;
    const samplingSize = Math.max(24,avatarSize);
    const svg = motion.svgFor(id,time,{size:samplingSize,decorative:true,reducedMotion:plan.reducedMotion})
      .replace(`width="${samplingSize}" height="${samplingSize}"`,`width="${avatarSize}" height="${avatarSize}"`)
      .replace('<svg ',`<svg x="${x}" y="${y}" `);
    // Reserve wide-glyph space so long caller names do not span adjacent cells.
    const chars = Array.from(sample.snapshot.name), maxChars = Math.max(4,Math.floor(cellWidth / (font * 1.2)) - 2);
    const name = chars.length > maxChars ? chars.slice(0,maxChars - 1).join('') + '…' : sample.snapshot.name;
    const cx = (i % columns + .5) * cellWidth, labelY = y + avatarSize + font * 1.2;
    return svg + `<text x="${cx}" y="${labelY}" fill="${labelColor}">${escape(name)}</text><text x="${cx}" y="${labelY + font * 1.45}" fill="${stateColor}">${ACTIVITY_LABELS[sample.snapshot.state]}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${plan.width}" height="${plan.height}" viewBox="0 0 ${plan.width} ${plan.height}"><rect width="100%" height="100%" fill="${plan.background}"/><g font-family="Arial,sans-serif" font-size="${font}" text-anchor="middle">${contents}</g></svg>`;
}
