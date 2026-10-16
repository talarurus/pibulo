import {serializeRecording} from '@talarurus/pibulo/recording';
import {compileMotionRecording} from '@talarurus/pibulo/motion';
import type {ActivityEvent} from '@talarurus/pibulo/activity';

// One recording for the homepage and README media. Existing raw identities only.
export const demoAgents = [{id:'atlas',name:'Atlas'},{id:'mira',name:'Mira'},{id:'cedar',name:'Cedar'}];
const steps = [['task.started',900],['task.working',2300],['task.completed',4100]] as const;
const events: ActivityEvent[] = steps.flatMap(([type,timestamp],i)=>demoAgents.map(({id})=>({
  version:1,agentId:id,taskId:'demo/task-1',sequence:i+1,timestamp,type,
})));
const file = serializeRecording({agents:demoAgents,events});
if(!file.ok) throw new Error(file.error);
export const demoRecording = file.json;
const compiled = compileMotionRecording(demoRecording,{originMs:0});
if(!compiled.ok) throw new Error(compiled.error);
export const demoMotion = compiled.motion;
export const demoDuration = demoMotion.durationMs + 1000;
export const demoSteps = [
  {label:'Idle',time:0,detail:'Ready for the next task'},
  {label:'Thinking',time:1600,detail:'Planning the next steps'},
  {label:'Working',time:3100,detail:'Making progress together'},
  {label:'Completed',time:4800,detail:'Task finished. Identity preserved.'},
];
