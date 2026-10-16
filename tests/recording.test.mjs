import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {REVISION, identity} from '@talarurus/pibulo';
import {createActivityEngine} from '@talarurus/pibulo/activity';
import {parseRecording, serializeRecording, RECORDING_IDENTITY, RECORDING_LIMITS} from '@talarurus/pibulo/recording';
const agents=[{id:'Atlas',name:'Atlas "one"'},{id:'atlas',name:'Second agent'}];
const event=(type,sequence,extra={})=>({version:1,type,agentId:'Atlas',taskId:'task-1',sequence,timestamp:sequence,...extra});
const events=[event('task.started',1),event('task.working',2),event('task.started',1,{agentId:'atlas'}),event('task.input-required',3),event('task.completed',2,{agentId:'atlas'}),event('task.input-resolved',4),event('task.completed',5)];
const source={agents,events};
const serialized=()=>{const result=serializeRecording(source);assert.equal(result.ok,true);return result;};
test('recording round-trip retains required identity metadata, accepted events and deterministic independent replay',()=>{
 const out=serialized(),one=parseRecording(out.json),two=parseRecording(out.json);
 assert.equal(one.ok,true);assert.equal(two.ok,true);assert.equal(RECORDING_IDENTITY.revision,REVISION);
 assert.equal(one.recording.initialState,'idle');assert.equal(one.recording.eventVersion,1);assert.equal(one.recording.version,1);
 assert.deepEqual(one.engine.getAgents(),two.engine.getAgents());assert.deepEqual(one.recording.events,events);
 const expected=createActivityEngine({agents});for(const e of events)assert.equal(expected.dispatch(e).ok,true);
 assert.deepEqual(one.engine.getAgents(),expected.getAgents());assert.equal(serializeRecording(one.recording).json,out.json);
 assert.equal(serializeRecording({agents:one.recording.agents,events:one.recording.events}).json,out.json);
 assert.notDeepEqual(...one.engine.getAgents().map(a=>identity({name:a.seed,normalization:'raw'}).traits));
 assert.throws(()=>one.recording.events.push(events[0]),TypeError);assert.throws(()=>{one.recording.agents[0].name='changed'},TypeError);
});
test('malformed, unsupported and extended recording envelopes are rejected with helpful messages',()=>{
 const valid=JSON.parse(serialized().json);
 for(const payload of [null,[],{}, {...valid,version:2},{...valid,eventVersion:2},{...valid,format:'other'},{...valid,initialState:'working'},{...valid,identity:{...valid.identity,revision:'other'}},{...valid,identity:{...valid.identity,normalization:'blobatar'}},{...valid,extra:1},{...valid,identity:{...valid.identity,extra:1}},{...valid,agents:null},{...valid,events:null},{...valid,agents:[]},{...valid,agents:[agents[0],agents[0]]},{...valid,agents:[{...agents[0],extra:true}]},{...valid,agents:[{id:'x'.repeat(129)}]},{...valid,agents:[{id:'ok',name:'x'.repeat(129)}]},{...valid,agents:[{id:'\ud800'}]}]){
  const result=parseRecording(JSON.stringify(payload));assert.equal(result.ok,false,JSON.stringify(payload));assert.ok(result.error.length>10);assert.equal('engine' in result,false);
 }
 for(const json of ['','{bad','null','[1,2]',123])assert.equal(parseRecording(json).ok,false);
});
test('recording import rejects incomplete lifecycle boundaries, duplicate/stale/out-of-order events and unknown agents atomically',()=>{
 const valid=JSON.parse(serialized().json);
 for(const sequence of [[event('task.working',1)],[event('task.started',1),event('task.working',1)],[event('task.started',2),event('task.working',1)],[event('task.started',1),event('task.working',2,{timestamp:0})],[event('task.started',1),event('task.completed',2,{taskId:'wrong'})],[event('task.started',1,{agentId:'missing'})],[event('task.started',1),event('task.input-required',2),event('task.completed',3)],[event('task.started',1),event('task.completed',2),event('task.started',3)], [{version:1,type:'agent.reset',agentId:'Atlas',sequence:1,timestamp:1},event('task.working',2)]]){
  const result=parseRecording(JSON.stringify({...valid,events:sequence}));assert.equal(result.ok,false);assert.equal(result.code,'inconsistent-recording');assert.ok(Number.isInteger(result.eventIndex));assert.equal('engine' in result,false);
 }
 const live=createActivityEngine({agents});live.dispatch(events[0]);const before=live.getAgent('Atlas');
 parseRecording(JSON.stringify({...valid,events:[events[0],{...events[1],sequence:1}]}));assert.equal(live.getAgent('Atlas'),before);
});
test('recording rejects task ID reuse across resets while allowing identical task IDs for independent agents',()=>{
 const duplicate=[event('task.started',1),{version:1,type:'agent.reset',agentId:'Atlas',sequence:2,timestamp:2},event('task.started',3)];
 assert.equal(serializeRecording({agents,events:duplicate}).code,'inconsistent-recording');
 assert.equal(serializeRecording(source).ok,true);
});
test('recording limits bound UTF-8 bytes, agents, events and caller strings before session replacement',()=>{
 const json=serialized().json;
 assert.equal(parseRecording(json,{maxBytes:new TextEncoder().encode(json).length}).ok,true);
 assert.equal(parseRecording(json,{maxBytes:json.length-1}).code,'recording-limit');
 assert.equal(parseRecording(json,{maxEvents:events.length-1}).code,'recording-limit');
 assert.equal(parseRecording(json,{maxAgents:1}).code,'recording-limit');
 const unicode=serializeRecording({agents:[{id:'猫'}],events:[]}).json;
 assert.equal(parseRecording(unicode,{maxBytes:unicode.length}).code,'recording-limit');
 assert.equal(parseRecording(' '.repeat(RECORDING_LIMITS.maxBytes+1)).code,'recording-limit');
 assert.equal(serializeRecording(source,{maxBytes:1}).code,'recording-limit');
 for(const limits of [null,{maxBytes:0},{maxEvents:1001},{maxAgents:33},{maxAgents:1.5},{maxEvents:Infinity},{extra:1}])assert.equal(parseRecording(json,limits).ok,false);
 for(const bad of [{...events[0],message:'x'.repeat(513)},{...events[0],message:'\u0000'},{...events[0],taskId:'x'.repeat(129)},{...events[0],sequence:Number.MAX_SAFE_INTEGER+1},{...events[0],extra:true}])assert.equal(serializeRecording({agents,events:[bad]}).ok,false);
});
test('empty recordings preserve roster and raw identities; exports contain frozen copies rather than caller objects',()=>{
 const a={id:'agent',name:'Original'},e={version:1,type:'task.started',agentId:'agent',taskId:'t',sequence:1,timestamp:0};
 const out=serializeRecording({agents:[a],events:[e]});assert.equal(out.ok,true);a.name='changed';e.taskId='changed';assert.equal(out.recording.agents[0].name,'Original');assert.equal(out.recording.events[0].taskId,'t');
 const idle=parseRecording(serializeRecording({agents,events:[]}).json);assert.equal(idle.ok,true);assert.ok(idle.engine.getAgents().every(a=>a.state==='idle'));
});
test('export validation rejects accessor fields and catches unreadable inputs without executing getters',()=>{
 let read=false;const bad={events};Object.defineProperty(bad,'agents',{get(){read=true;return agents}});
 assert.equal(serializeRecording(bad).ok,false);assert.equal(read,false);
 assert.equal(serializeRecording(new Proxy({},{getOwnPropertyDescriptor(){throw Error('bad')}})).ok,false);
});
test('recording entry is framework-neutral and excludes renderer and scene code',async()=>{
 const result=await build({entryPoints:['src/recording.ts'],bundle:true,format:'esm',write:false,metafile:true});
 assert.deepEqual(Object.keys(result.metafile.inputs).sort(),['src/activity.ts','src/recording.ts']);
});
